import "./App.css";
import { useState } from "react";
import UrlSelection from "./components/UrlSelection";
import { Box } from '@mui/material';
import { ChatContextProvider } from "./contexts/ChatContext";
import MainContent from "./components/MainContent";
import { BehaviorTreeVisualizerContextProvider } from "./contexts/BehaviorTreeVisualizerContext";

const App = () => {
  const defaultRobotTeachingUrl = import.meta.env.VITE_DEFAULT_ROBOT_TEACHING_URL;
  const [robotTeachingUrl, setRobotTeachingUrl] = useState<string>(defaultRobotTeachingUrl);
  
  return (
    <Box
      id="app"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <UrlSelection url={robotTeachingUrl} setUrl={setRobotTeachingUrl}/>
      <BehaviorTreeVisualizerContextProvider>
        <ChatContextProvider robotTeachingUrl={robotTeachingUrl}>
          <MainContent />
        </ChatContextProvider>
      </BehaviorTreeVisualizerContextProvider>
    </Box>
  );
};

export default App;
