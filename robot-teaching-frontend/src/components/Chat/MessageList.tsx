/**
 * Represents a list of messages in the chat box.
 */
import React, { useEffect, useRef, useCallback } from "react";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import BotIcon from "../../assets/Bot.svg";
import { Box } from '@mui/material';
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import useChat from "../../contexts/ChatContext";
import { ChatState } from "../../types/chatTypes";
/**
 * Represents the visually hidden input element.
 * Used for uploading files.
 */
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface MessageTypographyProps {
  side: "left" | "right";
  children: React.ReactNode;
  messagePosition: "only" | "first" | "last" | "middle"; // position of the message
}

const MessageTypography = (props: MessageTypographyProps) => {
  const { side, children, messagePosition } = props;
  const theme = useTheme();
  const radius = theme.spacing(2.5);

  return (
    <Box
      sx={{
        padding: theme.spacing(1, 2),
        borderRadius: messagePosition === "only" ? radius : "4px",
        marginBottom: "4px",
        display: "inline-block",
        wordWrap: "break-word",
        whiteSpace: "pre-wrap",
        ...(side === "left"
          ? {
              borderTopRightRadius: radius,
              borderBottomRightRadius: radius,
              backgroundColor: theme.palette.grey[100],
            }
          : {
              borderTopLeftRadius: radius,
              borderBottomLeftRadius: radius,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
            }),

        ...(messagePosition !== "middle" &&
          messagePosition !== "only" && {
            ...(messagePosition === "first"
              ? {
                  ...(side === "left"
                    ? { borderTopLeftRadius: radius }
                    : { borderTopRightRadius: radius }),
                }
              : {
                  ...(side === "left"
                    ? { borderBottomLeftRadius: radius }
                    : { borderBottomRightRadius: radius }),
                }),
          }),
      }}
    >
      {children}
    </Box>
  );
};

interface ButtonInMessageProps {
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
  component?: React.ElementType;
}

export const ButtonInMessage = ({
  onClick,
  children,
  component = "button",
}: ButtonInMessageProps) => {
  return (
    <Button
      variant="outlined"
      size="small"
      onClick={onClick}
      component={component}
    >
      {children}
    </Button>
  );
};

interface ChatMessagesProps {
  avatar?: string;
  messages: React.ReactNode[];
  side?: "left" | "right";
  buttons?: React.ReactNode;
}

const ChatMessages = ({
  avatar = "",
  messages = [],
  side = "left",
  buttons,
}: ChatMessagesProps) => {
  const theme = useTheme();
  const size = theme.spacing(4);

  return (
    <Grid
      container
      spacing={2}
      sx={{ justifyContent: side === "right" ? "flex-end" : "flex-start" }}
    >
      {side === "left" && (
        <Grid item display="flex" alignItems="flex-end" padding="0.5rem 0" >
          <Avatar sx={{ width: size, height: size }} src={avatar} />
        </Grid>
      )}
      <Grid item xs={8}>
        {messages.map((msg, i) => {
          let position: "first" | "last" | "middle" | "only";

          if (messages.length === 1) position = "only";
          else if (i === 0) position = "first";
          else if (i === messages.length - 1) position = "last";
          else position = "middle";

          return (
            <Box
              key={`message-${i}`}
              display="flex"
              justifyContent={side === "right" ? "flex-end" : "flex-start"}
            >
              <MessageTypography
                side={side}
                messagePosition={position}
              >
                {msg}
                {side === "left" &&
                  (position === "only" || position === "last") &&
                  buttons}
              </MessageTypography>
            </Box>
          );
        })}
      </Grid>
    </Grid>
  );
};

/**
 * Represents the MessageList component.
 */
const MessageList = () => {
  const { uploadFile, uploadVideoFile, sendMessage, messages, chatState, confirmDefinition } = useChat();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if  (!event.target.files) {
      alert("Please select a file.");
      return;
    }
    const file = event.target.files[0];
    uploadFile(file);
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if  (!event.target.files) {
      alert("Please select a file.");
      return;
    }
    const files = event.target.files;
    uploadVideoFile(files);
  };
  //<ButtonInMessage onClick={() => sendMessage("start lfo")}>
  //Start LfO
  //</ButtonInMessage>
  const availableButtons = useCallback(() => {
    if (chatState === ChatState.IDLE) {
      return (
        <>
        <ButtonInMessage onClick={() => sendMessage("start commanding")}>
          Start Commanding
        </ButtonInMessage>
        </>
      )
    }
    else if (chatState === ChatState.GET_DEMONSTRATE) {
      return (
        <ButtonInMessage component="label">
          <VisuallyHiddenInput
            type="file"
            onChange={handleVideoFileChange}
            multiple
          />
          Upload Video File
        </ButtonInMessage>
      )
    }
    else if (chatState === ChatState.GET_MAP) {
      return (
        <ButtonInMessage component="label">
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
          />
          Upload JSON File
        </ButtonInMessage>
      )
    }
    else if (chatState === ChatState.TASK_PLANNING) {
      return (
        <>
          <ButtonInMessage onClick={() => confirmDefinition()}>
            Looks good!
          </ButtonInMessage>
        </>
      )
    }
  }, [chatState, confirmDefinition, handleFileChange, handleVideoFileChange, sendMessage]);

  return (
    <Box sx={{ flex: "1 1 0", overflowY: "auto", padding: "1rem" }}>
      {messages.map(({ from, contexts }, index) => {
        return (
          <ChatMessages
            avatar={BotIcon}
            messages={contexts}
            side={from === "robot" ? "left" : "right"}
            key={`messages-group-${index}`}
            buttons={
              index === messages.length - 1 && (
                <Stack direction="row" sx={{marginTop: "0.5rem" }} spacing={2}>
                  {availableButtons()}
                </Stack>
              )
            }
          />
        );
      })}
      {chatState === ChatState.WAITING_FOR_RESPONSE && (
        <ChatMessages
        avatar={BotIcon}
        messages={[<span>Typing...</span>]}
        side={"left"}
        key={`messages-group-${messages.length}`}
      />
      )}
      <Box
        ref={scrollRef}
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {chatState === ChatState.UPLOADING && (
          <>
            <CircularProgress sx={{ margin: "1rem" }} />
            <span>Uploading...</span>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MessageList;
