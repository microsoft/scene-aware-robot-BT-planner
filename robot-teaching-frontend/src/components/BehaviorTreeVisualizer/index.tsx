import useBehaviorTreeVisualizer from "../../contexts/BehaviorTreeVisualizerContext"
import Box from "@mui/material/Box";
import './index.css';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import DefinitionEditor from "./DefinitionEditor";
import { MainPanel } from "../../libs/mistreevous-visualiser/MainPanel";
import { ToastContainer } from "react-toastify";
import useChat from "../../contexts/ChatContext";
import { useCallback } from "react";
import Divider from "@mui/material/Divider";

const BehaviorTreeVisualizer = () => {
  const {
    definition, 
    definitionType,
    onDefinitionChange,
    canvasElements,
    behaviourTreeExceptionMessage,
    behaviourTreePlayInterval,
    setDefinitionTabDisplayed
  } = useBehaviorTreeVisualizer();

  const { confirmDefinition } = useChat();
  const isSidebarReadOnly = !!behaviourTreePlayInterval;

  const onConfirmButtonClicked = useCallback(() => {
    confirmDefinition();
    setDefinitionTabDisplayed(false)
  }, [confirmDefinition, setDefinitionTabDisplayed]);

  return (
    <Box className="app-box">
      <Grid container direction="column" sx={{ flexGrow: 1 }}>
        <Grid item xs>
          <MainPanel
            layoutId={null}
            elements={canvasElements}
            showPlayButton={false}
            showReplayButton={false}
            showStopButton={!!behaviourTreePlayInterval}
            onPlayButtonClick={() => {}}
            onReplayButtonClick={() => {}}
            onStopButtonClick={() => {}}
          />
          <ToastContainer />
        </Grid>
        <Grid item className={`sidebar ${isSidebarReadOnly ? "read-only" : ""}`} xs={12} sm={4} xl={4}>
          {/* <Card style={{ margin: "6px", flexGrow: 1 }} elevation={3}> */}
            <Divider />
            <DefinitionEditor
              definition={definition}
              onChange={onDefinitionChange}
              errorMessage={behaviourTreeExceptionMessage}
              readOnly={!!behaviourTreePlayInterval}
              onConfirmButtonClicked={onConfirmButtonClicked}
            />
          {/* </Card> */}
        </Grid>
      </Grid>
    </Box>
  )
}

export default BehaviorTreeVisualizer;