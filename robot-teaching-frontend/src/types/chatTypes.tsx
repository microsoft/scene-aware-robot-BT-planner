import React from 'react';

export enum ChatState {
  INIT = "init",
  CLOSED = "closed",
  ERROR = "error",
  IDLE = "idle",
  GET_DEMONSTRATE = "get_demonstrate",
  GET_MAP = "get_map",
  UPLOADING = "uploading",
  ROBOT_TALKING = "robot_talking",
  ASK_FOR_INSTRUCTION = "ask_for_instruction",
  TASK_PLANNING = "task_planning",
  WAITING_FOR_RESPONSE = "waiting_for_response",
  WAITING_FOR_CONFIRM = "waiting_for_confirm",
}

export interface Message {
  from: string;
  contexts: React.ReactNode[];
}