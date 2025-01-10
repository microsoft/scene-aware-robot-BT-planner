import Box from '@mui/material/Box';
import Header from '../Common/Header';
import Typography from "@mui/material/Typography";
import Avatar from '@mui/material/Avatar';
import BotIcon from "../../assets/Bot.svg";

const ChatHeader = () => {
  return (
    <Header>
      <Avatar src={BotIcon} sx={{margin: "0.4rem"}}/>
      <Box display="flex" flexDirection="column">
        <Typography variant="subtitle2">Robot</Typography>
        <Typography variant="caption">Chat with me</Typography>
      </Box>
    </Header>
  )
}

export default ChatHeader;