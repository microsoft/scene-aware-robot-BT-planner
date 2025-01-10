import { BehaviourTree, BehaviourTreeOptions, convertMDSLToJSON, NodeDetails, State, validateDefinition } from "mistreevous";
import { CanvasElements } from "../libs/mistreevous-visualiser/MainPanel";
import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

export enum SidebarTab { Definition = 0, Board = 1 }

export enum DefinitionType { None = 0, MDSL = 1, JSON = 2 }

interface BehaviorTreeVisualizerContext {
  layoutId: string | null;
  activeSidebarTab: SidebarTab;
  definition: string;
  definitionType: DefinitionType;
  agent: string;
  agentExceptionMessage: string;
  behaviourTree: BehaviourTree | null;
  behaviourTreeExceptionMessage: string;
  behaviourTreePlayInterval: number | null;
  canvasElements: CanvasElements;
  definitionTabDisplayed: boolean;
  setDefinitionTabDisplayed: (value: boolean) => void;
  onDefinitionChange: (newDefinition: string, newAgent?: string) => void;
}

const BehaviorTreeVisualizerContext = createContext<BehaviorTreeVisualizerContext | null>(null);

interface BehaviorTreeVisualizerContextProviderProps {
  children: React.ReactNode;
}

export const BehaviorTreeVisualizerContextProvider = ({children}: BehaviorTreeVisualizerContextProviderProps) => {
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(SidebarTab.Definition);
  const [definition, setDefinition] = useState("");
  const [definitionType, setDefinitionType] = useState(DefinitionType.None);
  const [agent, setAgent] = useState("class Agent {}");
  const [agentExceptionMessage, setAgentExceptionMessage] = useState("");
  const [behaviourTree, setBehaviourTree] = useState<BehaviourTree | null>(null);
  const [behaviourTreeExceptionMessage, setBehaviourTreeExceptionMessage] = useState("");
  const [behaviourTreePlayInterval, setBehaviourTreePlayInterval] = useState<number | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElements>({ nodes: [], edges: [] });
  const [definitionTabDisplayed, setDefinitionTabDisplayed] = useState(false);

  const _getDefinitionType = useCallback((newDefinition: string) => {
    if (!newDefinition) return DefinitionType.None;

    // Lets see if its valid MDSL.
    try {
      // Try to convert our definition to JSON, assuming that it is MDSL.
      convertMDSLToJSON(newDefinition)

      // It worked! We can assume that this definition is valid MDSL!
      return DefinitionType.MDSL;
    } catch {
      // It wasn't MDSL.
    }

    // Lets see if it's valid JSON.
    try {
      // Try to convert our definition to JSON.
      JSON.parse(newDefinition);

      // It worked! We can assume that this definition is valid JSON!
      return DefinitionType.JSON;
    } catch {
      // It wasn't JSON.
    }

    return DefinitionType.None;
  }, [convertMDSLToJSON]);
  
  /**
   * Creates an instance of a board based on the class definition provided.
   * @param boardClassDefinition The board class definition.
   * @returns An instance of a board based on the class definition provided.
   */
  const _createBoardInstance = useCallback((boardClassDefinition: string): any => {
    const boardClassCreator = new Function("BehaviourTree", "State", "getStringValue", "getNumberValue", "getBooleanValue", "showErrorToast", "showInfoToast", `return ${boardClassDefinition};`);

    const getStringValue = (message: string) => window.prompt(message);
    const getNumberValue = (message: string) => parseFloat(window.prompt(message) as string);
    const getBooleanValue = (message: string) => window.confirm(`${message}. (Ok=true Cancel=false)`);
    const showErrorToast = (message: string) => toast.error(message);
    const showInfoToast = (message: string) => toast.info(message);
    
    const boardClass = boardClassCreator(BehaviourTree, State, getStringValue, getNumberValue, getBooleanValue, showErrorToast, showInfoToast);

    const boardInstance = new boardClass();

    return boardInstance;
  }, []);

  /**
   * Creates the behaviour tree instance.
   * @param definition 
   * @param board 
   * @returns The behaviour tree instance.
   */
  const _createTreeInstance = useCallback((newDefinition: string, boardClassDefinition: string): BehaviourTree | null => {
    // Create the board object.
    const board = _createBoardInstance(boardClassDefinition);

    const options: BehaviourTreeOptions = {
      // We are calling step() every 100ms in this class so a delta of 0.1 should match what we expect.
      getDeltaTime: () => 0.1
    };

    const behaviourTree = new BehaviourTree(newDefinition, board, options);

    return behaviourTree;
  }, [_createBoardInstance]);

  /**
   * Parse the nodes and connectors.
   * @param flattenedNodeDetails 
   * @returns The parsed nodes and connectors.
   */
  const _createCanvasElements = useCallback((rootNodeDetails: NodeDetails): CanvasElements => {
    let result: CanvasElements = { nodes: [], edges: [] };

    const processNodeDetails = (node: NodeDetails, parentId?: string) => {
      result.nodes.push({
        id: node.id,
        caption: node.name,
        state: node.state,
        type: node.type,
        args: node.args ?? [],
        whileGuard: node.while,
        untilGuard: node.until,
        entryCallback: node.entry,
        stepCallback: node.step,
        exitCallback: node.exit,
        variant: "default"
      } as any);

      if (parentId) {
        let variant;

        switch (node.state) {
          case State.RUNNING:
            variant = "active";
            break;

          case State.SUCCEEDED:
            variant = "succeeded";
            break;

          case State.FAILED:
            variant = "failed";
            break;

          default:
            variant = "default";
        }

        result.edges.push({
          id: `${parentId}_${node.id}`,
          from: parentId,
          to: node.id,
          variant
        });
      }

      (node.children ?? []).forEach((child) => processNodeDetails(child, node.id));
    };

    processNodeDetails(rootNodeDetails);

    return result;
  }, []);

  /**
   * Handles a change of definition.
   * @param definition The changed definition.
   */
  const onDefinitionChange = useCallback((newDefinition: string, newAgent?: string): void => {
    console.log(`new definition: ${newDefinition}`);

    let newBehaviourTree: BehaviourTree | null = null;
    let newBehaviourTreeExceptionMessage = "";
    let newCanvasElements: CanvasElements = { nodes: [], edges: [] };
    
    // Get the type of the definition.
    const newDefinitionType = _getDefinitionType(newDefinition);

    // Let's try to validate our definition.
    const validationResult = validateDefinition(newDefinitionType === DefinitionType.JSON? JSON.parse(newDefinition): newDefinition);

    if (validationResult.succeeded) {
      try {
        // Create the behaviour tree!
        newBehaviourTree = _createTreeInstance(
          newDefinitionType === DefinitionType.JSON? JSON.parse(newDefinition): newDefinition,
          newAgent ?? agent
        );

        // Create the canvas elements based on the built tree.
        newCanvasElements = _createCanvasElements(newBehaviourTree!.getTreeNodeDetails());
      } catch (error) {
        // We failed to build the tree instance.
        newBehaviourTreeExceptionMessage = `${error}`;
      }
    }
    else {
      // The definition was not valid.
      newBehaviourTreeExceptionMessage = validationResult.errorMessage!;
    }
    
    setDefinition(newDefinition);
    setDefinitionType(newDefinitionType);
    setBehaviourTreeExceptionMessage(newBehaviourTreeExceptionMessage);
    setCanvasElements(newCanvasElements);
    setBehaviourTree(newBehaviourTree);
  }, [_getDefinitionType, validateDefinition, _createTreeInstance, _createCanvasElements]);

  return (
    <BehaviorTreeVisualizerContext.Provider value={{
      layoutId,
      activeSidebarTab,
      definition,
      definitionType,
      agent,
      agentExceptionMessage,
      behaviourTree,
      behaviourTreeExceptionMessage,
      behaviourTreePlayInterval,
      canvasElements,
      definitionTabDisplayed,
      setDefinitionTabDisplayed,
      onDefinitionChange
    }}>
      {children}
    </BehaviorTreeVisualizerContext.Provider>
  );
}

const useBehaviorTreeVisualizer = (): BehaviorTreeVisualizerContext => {
  const currentChatContext = useContext(BehaviorTreeVisualizerContext);
  if (!currentChatContext) {
    throw new Error("useBehaviorTreeVisualizer must be used within a BehaviorTreeVisualizerContextProvider");
  }

  return currentChatContext;
}

export default useBehaviorTreeVisualizer;