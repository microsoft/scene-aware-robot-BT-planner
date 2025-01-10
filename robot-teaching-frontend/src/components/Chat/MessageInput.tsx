/**
 * Represents a component for inputting and sending messages.
 */
import React from "react";
import { Box } from '@mui/material';
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import SendIcon from "@mui/icons-material/Send";
import useChat from "../../contexts/ChatContext";
import SpeechToTextButton from "./SpeechToTextButton";
import Button from "@mui/material/Button";
import { useTheme } from '@mui/material/styles';
// import { useState } from "react";
// import SpeechToTextButton from "./SpeechToTextButton";


const MessageInput = () => {
  const { inputMessage, setInputMessage, sendMessage, chatState } = useChat();
  const theme = useTheme();
  /**
   * Handles the change event of the input message.
   * @param event - The change event.
   */
  const handleInputMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInputMessage(event.target.value);
    event.preventDefault();
  };

  /**
   * Handles the key down event.
   * If the Enter key is pressed, sends the message and clears the input.
   * @param event - The key down event.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      sendMessage(inputMessage);
      setInputMessage("");
      event.preventDefault();
    }
  };

  const button = () => {
    if (inputMessage === "") {
      return <SpeechToTextButton />;
    } else {
      return (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleSendClick}
          sx={{
            marginLeft: "1rem",
            minWidth: 56,
            height: 56,
            width: 56
          }}
          disabled={chatState === "robot_talking"}
        >
          <SendIcon />
        </Fab>
      );
    }
  };

  /**
   * Handles the click event of the send button.
   * Sends the message and clears the input.
   * @param event - The click event.
   */
  const handleSendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    sendMessage(inputMessage);
    setInputMessage("");
    event.preventDefault();
  };

  interface ButtonInMessageProps {
    onClick?: (event: React.MouseEvent) => void;
    children: React.ReactNode;
    component?: React.ElementType;
    sx?: object;
  }
  
  const ButtonInMessage = ({
    onClick,
    children,
    component = "button",
    sx = {}
  }: ButtonInMessageProps) => {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={onClick}
        component={component}
        sx={{
          fontSize: theme.typography.pxToRem(12),
          backgroundColor: children === "Emergency Stop" ? "red" : "inherit", // Emergency Stopの場合のみ背景色を赤に設定
          color: children === "Emergency Stop" ? "#fff" : "inherit", // テキストカラーを白に設定
          '&:hover': {
            backgroundColor: children === "Emergency Stop" ? "#b22222" : "inherit", // ホバー時の背景色を暗い赤に変更
          },
          ...sx // 追加のスタイルを適用する
        }}
      >
        {children}
      </Button>
    );
  };

  // <ButtonInMessage onClick={() => sendMessage("cancel")}>
  // Cancel Instruction
  // </ButtonInMessage>
  return (
    <Box sx={{ display: "inline-flex", padding: "1rem" }}>
      <TextField
        label="Type Something"
        value={inputMessage}
        onChange={handleInputMessageChange}
        onKeyDown={handleKeyDown}
        fullWidth
      />
      <ButtonInMessage onClick={() => sendMessage("e-stop")}>
        Emergency Stop
      </ButtonInMessage>
      {button()}
    </Box>
  );
}

export default MessageInput;