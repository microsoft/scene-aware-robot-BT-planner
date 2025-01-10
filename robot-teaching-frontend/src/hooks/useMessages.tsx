import { useState, useCallback } from 'react';
import { Message } from '../types/chatTypes';
import React from 'react';

const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "robot",
      contexts: [<span>Robot [Idle]: Hello. What can I do for you today?</span>],
    },
  ]);

  const addMessage = useCallback((from: string, context: React.ReactNode): void => {
    setMessages((messages) => {
      const clonedMessages = [...messages];
      if (from === messages[messages.length - 1].from) {
        clonedMessages[messages.length - 1].contexts.push(context);
      } else {
        clonedMessages.push({
          from: from,
          contexts: [context],
        });
      }
      return clonedMessages;
    });
  }, []);

  return { messages, addMessage };
}

export default useMessages;
