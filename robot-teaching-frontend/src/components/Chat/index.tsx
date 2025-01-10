import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

const Chat = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <ChatHeader />
      <Divider />
      <MessageList />
      <Divider />
      <MessageInput />
    </Box>
  )
};

export default Chat;
