import Alert from "@mui/material/Alert";
import useChat from "../../contexts/ChatContext";
import { ChatState } from "../../types/chatTypes";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Chat from "../Chat";
import BehaviorTreeVisualizer from "../BehaviorTreeVisualizer";

const MainContent = () => {
  const { chatState } = useChat();

  const displayContent = () => {
    if (chatState === ChatState.INIT) {
      return (
        <Alert severity="info" icon={false}>
          <Box display="flex" alignItems="center" gap="0 1rem">
            <Typography variant="body1">Connecting... </Typography>
            <CircularProgress />
          </Box>
        </Alert>
      );
    }
    if (chatState === ChatState.ERROR || chatState === ChatState.CLOSED) {
      return (
        <Alert severity="error">
          <Typography variant="body1">
            Please check the url and make sure your backend is listening for connection.
          </Typography>
        </Alert>
      );
    }
    return (
      <Grid container flex="1">
        <Grid item xs={4} padding="0.5rem">
          <Paper sx={{height: "100%", display: 'flex', flexDirection: 'column'}} elevation={3}>
            <Chat />
          </Paper>
        </Grid>
        <Grid item xs={8} padding="0.5rem">
          <Paper sx={{height: "100%", display: 'flex', flexDirection: 'column'}} elevation={3}>
            <BehaviorTreeVisualizer />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return displayContent();
}

export default MainContent;
