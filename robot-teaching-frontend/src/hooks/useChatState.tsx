import { useState, useRef, useCallback } from 'react';
import { ChatState } from '../types/chatTypes';

const useChatState = () => {
  const [chatState, setChatState] = useState<ChatState>(ChatState.INIT);
  const prevChatStateRef = useRef<ChatState>(chatState);

  const updateChatState = useCallback((newChatState: ChatState) => {
    setChatState((prevChatState) => {
      prevChatStateRef.current = prevChatState
      return newChatState;
    });
  }, []);

  const updateChatStateByResponse = useCallback((response: string) => {
    if(response.includes("ROBOT_TALKING_START")) {
      updateChatState(ChatState.ROBOT_TALKING);
    } else if(response.includes("ROBOT_TALKING_FINISH")) {
      updateChatState(prevChatStateRef.current);
    } else if (response.includes("[Idle]")) {
      updateChatState(ChatState.IDLE);
    } else if (response.includes("[GetDemonstration]")) {
      updateChatState(ChatState.GET_DEMONSTRATE);
    } else if (response.includes("[GetMap]")) {
        updateChatState(ChatState.GET_MAP);
    } else if (response.includes("[AskForInstruction]")) {
      updateChatState(ChatState.ASK_FOR_INSTRUCTION);
    } else if (response.includes("[TaskPlanning]")) {
      updateChatState(ChatState.TASK_PLANNING);
    } else if (response.includes("[LfO]")) {
      updateChatState(ChatState.TASK_PLANNING);
    }
  }, [updateChatState]);

  const restoreChatState = useCallback(() => {
    updateChatState(prevChatStateRef.current);
  }, [updateChatState]);

  return {chatState, updateChatState, updateChatStateByResponse, restoreChatState };
}

export default useChatState;