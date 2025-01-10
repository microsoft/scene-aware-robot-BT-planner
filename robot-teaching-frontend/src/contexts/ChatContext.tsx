import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import useChatState from "../hooks/useChatState";
import useMessages from "../hooks/useMessages";
import { ChatState } from "../types/chatTypes";
import { generateSessionId } from "../utils/helper";
import useBehaviorTreeVisualizer from "./BehaviorTreeVisualizerContext";
import React from 'react';
import VideoPlayer from "../components/Chat/VideoPlayer";

const MAX_MESSAGE_LENGTH = 5000;

interface ChatContextType {
  chatState: ChatState;
  messages: { from: string; contexts: React.ReactNode[] }[];
  inputMessage: string;
  //videoPaths: Record<string, any>;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (message: string) => void;
  uploadFile: (file: File) => void;
  uploadVideoFile: (files: FileList) => void;
  confirmDefinition: () => void;
  //setVideoPaths: (paths: Record<string, any>) => void;
}

interface ChatContextProviderProps {
  robotTeachingUrl: string;
  children: React.ReactNode;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatContextProvider = ({ robotTeachingUrl, children }: ChatContextProviderProps) => {
  const { chatState, updateChatState, restoreChatState, updateChatStateByResponse } = useChatState();
  const { messages, addMessage } = useMessages();
  const { definition, onDefinitionChange } = useBehaviorTreeVisualizer();
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  //const [videoPaths, setVideoPaths] = useState<Record<string, any>>({});  // args の状態を辞書形式で管理

  const sendMessage = useCallback((message: string) => {
    if (!webSocketRef.current || !sessionIdRef.current) {
      console.error("WebSocket is not initialized.");
      return;
    }

    if (webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open");
      return;
    }

    webSocketRef.current.send(
      message.length > MAX_MESSAGE_LENGTH
        ? message.substring(0, MAX_MESSAGE_LENGTH)
        : message
    );

    addMessage("user", <span>{message}</span>);
    updateChatState(ChatState.WAITING_FOR_RESPONSE);
  }, [addMessage, updateChatState]);

  const playAudio = useCallback((audioUrl: string) => {
    updateChatState(ChatState.ROBOT_TALKING);
    const audio = new Audio(audioUrl);
    const handleEnded = () => {
      if (!webSocketRef.current) {
        console.error("WebSocket is not initialized.");
        return;
      }
      webSocketRef.current.send("[play_ended]");
      restoreChatState();
    };
    audio.addEventListener("ended", handleEnded);
    audio.play();
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const updateDefinitionIfFound = useCallback((message: string) => {
    const pattern = /root\s*{([^]*)}/;
    const match = message.match(pattern);
    if (match)
      onDefinitionChange(match[0]);
  }, [onDefinitionChange]);

  const handleTimeSelected = useCallback((startTime: number, endTime: number) => {
    if (!sessionIdRef.current) {
      console.error("sessionID is not initialized");
      return;
    }

    const message = `(time selected) start: ${startTime.toFixed(2)}, end: ${endTime.toFixed(2)}`;
    sendMessage(message);
  }, [sendMessage]);

  const processMessage = useCallback((event: MessageEvent) => {

    if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
      const blob = new Blob([event.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      playAudio(audioUrl);
    } else {
      console.log(`message arrived: ${event.data}`);
      const response = event.data;
      const message = response.split("__args__")[0];
      const args = response.split("__args__")[1];

      updateChatStateByResponse(response);

      if (response.startsWith("Robot")) {
        const pattern = /root\s*{([^]*)}/;
        const modifiedMessage = message.replace(pattern, "");
        addMessage("robot", <span>{modifiedMessage}</span>);
        //addMessage("robot", <span>{message}</span>);
        updateDefinitionIfFound(message);
        if (args)
            console.log("args: ", args);
        }
      if (response.includes("[Idle]")) {
        onDefinitionChange("");
      }
      // task_planning の状態で、args が空でない場合
      //if (response.includes("[TaskPlanning]") && args.length>0) {
      //  try {
      //    console.log('debugging');
      //    console.log("args: ", args);
      //    const parsedArgs = JSON.parse(args);  // args をオブジェクトに変換
      //    console.log("Parsed args: ", parsedArgs);
      //    setVideoPaths(parsedArgs);  // args を更新してオブジェクトとして保存
      //    console.log("Parsed args: ", parsedArgs);
      //  } catch (error) {
      //    console.error("Failed to parse args:", error);
      //  }
      //}

      if (response.startsWith("[FILL_IN_FORM]")) {
        const fillmessage = message.split("[FILL_IN_FORM]:")[1];
        setInputMessage(fillmessage);
      }

      if (response.includes("[LFO_ASK]") && uploadedVideoUrl) {
        const startTimeMatch = args.match(/start:(\d+(\.\d+)?)/);
        const endTimeMatch = args.match(/end:(\d+(\.\d+)?)/);

        const startTime = startTimeMatch ? parseFloat(startTimeMatch[1]) : 0;
        const endTime = endTimeMatch ? parseFloat(endTimeMatch[1]) : undefined;
        addMessage("user", (
          <VideoPlayer
            videoUrl={uploadedVideoUrl}
            enableSlider={true}
            onTimeSelected={handleTimeSelected}
            initialStartTime={startTime}
            initialEndTime={endTime}
          />
        ));
        updateChatState(ChatState.WAITING_FOR_CONFIRM);
      }
    }
  }, [updateChatStateByResponse, addMessage, playAudio, updateDefinitionIfFound, handleTimeSelected, uploadedVideoUrl]);
    //}, [updateChatStateByResponse, addMessage, playAudio, updateDefinitionIfFound, handleTimeSelected, uploadedVideoUrl, setVideoPaths]);

  useEffect(() => {
    sessionIdRef.current = generateSessionId();
    webSocketRef.current = new WebSocket(`${robotTeachingUrl}/ws/${sessionIdRef.current}`);

    return () => {
      webSocketRef.current?.close();
      sessionIdRef.current = null;
      webSocketRef.current = null;
    };
  }, [robotTeachingUrl]);

  useEffect(() => {
    if (!webSocketRef.current)
      return;

    const ws = webSocketRef.current;

    ws.onopen = () => {
      console.log(`ws connected : ${ws.url}`);
      updateChatState(ChatState.IDLE);
    };

    ws.onerror = (e) => {
      console.error(`ws error: ${e}`);
      updateChatState(ChatState.ERROR);
    };

    ws.onclose = () => {
      console.log(`ws closed: ${ws.url}`);
      updateChatState(ChatState.CLOSED);
    };

    ws.onmessage = processMessage;
  }, [webSocketRef.current, updateChatState, processMessage]);

  const uploadFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("Please select a .json file.");
      return;
    }

    if (!sessionIdRef.current) {
      console.error("sessionID is not initialized");
      return;
    }

    updateChatState(ChatState.UPLOADING);

    const formData = new FormData();
    formData.append("files", file);

    const fetchBaseUrl = robotTeachingUrl.replace("ws", "http");

    fetch(`${fetchBaseUrl}/uploadfiles/${sessionIdRef.current}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message.startsWith("Error")) {
          alert(data.message);
        } else {
          sendMessage("(Upload Complete)");
        }
      })
      .catch((error) => console.error("Error:", error));
  }, [robotTeachingUrl, sendMessage]);

  const uploadVideoFile = useCallback((files: FileList) => {
    if (files.length !== 2) {
      alert("Please select two files.");
      return;
    }

    let mp4File: File | null = null;
    let npyFile: File | null = null;

    Array.from(files).forEach(file => {
      if (file.name.endsWith(".mp4")) {
        mp4File = file;
      } else if (file.name.endsWith(".npy") || file.name.endsWith(".npz")) {
        npyFile = file;
      }
    });

    if (!mp4File || !npyFile) {
      alert("Please select a .mp4 file and a .npy file.");
      return;
    }

    updateChatState(ChatState.UPLOADING);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append("files", file);
    });

    const videoUrl = URL.createObjectURL(mp4File);
    setUploadedVideoUrl(videoUrl);

    addMessage("user", <VideoPlayer videoUrl={videoUrl} />);
    const fetchBaseUrl = robotTeachingUrl.replace("ws", "http");

    fetch(`${fetchBaseUrl}/uploadvideofiles/${sessionIdRef.current}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message.startsWith("Error")) {
          alert(data.message);
        } else {
          sendMessage("(Upload Complete)");
        }
      })
      .catch((error) => console.error("Error:", error));
  }, [robotTeachingUrl, addMessage, sendMessage]);

  const confirmDefinition = useCallback(() => {
    sendMessage(
      `(BT_Confirmed)\n${definition}`
    );
  }, [definition, sendMessage]);

  return (
    //<ChatContext.Provider value={{ chatState, messages, inputMessage, videoPaths, setInputMessage, sendMessage, uploadFile, uploadVideoFile, confirmDefinition, setVideoPaths }}>
    <ChatContext.Provider value={{ chatState, messages, inputMessage, setInputMessage, sendMessage, uploadFile, uploadVideoFile, confirmDefinition }}>
      {children}
    </ChatContext.Provider>
  );
}

const useChat = () => {
  const currentChatContext = useContext(ChatContext);

  if (!currentChatContext) {
    throw new Error(
      "useChat has to be used within <ChatContext.Provider>"
    );
  }

  return currentChatContext;
}

export default useChat;