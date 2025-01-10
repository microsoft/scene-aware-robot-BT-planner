import { useState, useEffect, useRef } from 'react';
import {SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason, SpeechRecognitionEventArgs, AutoDetectSourceLanguageConfig, AutoDetectSourceLanguageResult } from 'microsoft-cognitiveservices-speech-sdk';
import Fab from "@mui/material/Fab"
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import MicOffIcon from '@mui/icons-material/MicOff';
import useChat from '../../contexts/ChatContext';
import { ChatState } from '../../types/chatTypes';

const SpeechToTextButton = () => {
  const SPEECH_KEY = import.meta.env.VITE_SPEECH_API_KEY;
  const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION;
  // const speechConfig = useRef<SpeechConfig | null>(null);
  const audioConfig = useRef<AudioConfig | null>(null);
  const recognizer = useRef<SpeechRecognizer | null>(null);

  const [state, setState] = useState<"off" | "on" | "pause">("off");
  const {chatState, sendMessage} = useChat();
  // const [myTranscript, setMyTranscript] = useState("");
  // const [recognizingTranscript, setRecTranscript] = useState("");

  useEffect(() => {
    //speechConfig.current.speechRecognitionLanguage = 'en-US';
    const speechConfig = SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION
    );
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const autoDetectSourceLanguageConfig = AutoDetectSourceLanguageConfig.fromLanguages(['en-US']); //, 'ja-JP'
    recognizer.current = SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);
    recognizer.current.recognized = (_s, e) => processRecognizedTranscript(e);

    return () => {
      recognizer.current?.stopContinuousRecognitionAsync(() => {
        setState("off");
      });
    };
  }, []);

  useEffect(() => {
    if (!recognizer.current)
      return;
    // console.log("chatState: ", chatState);
    const shuoldPause = chatState === ChatState.ROBOT_TALKING || chatState === ChatState.WAITING_FOR_RESPONSE;
    if (shuoldPause && state === "on") {
      setState("pause");
      recognizer.current.stopContinuousRecognitionAsync(() => {
        console.log('Speech recognition paused due to waiting for response or robot talking.');
      });
    }
    else if(!shuoldPause && state === "pause"){
      setState("on");
      recognizer.current.startContinuousRecognitionAsync(() => {
        console.log('Speech recognition resumed.');
      });
    }
  }, [chatState])

  const processRecognizedTranscript = (event: SpeechRecognitionEventArgs) => {
    const result = event.result;
    console.log('Recognition result:', result);

    if (result.reason === ResultReason.RecognizedSpeech) {
      const transcript = result.text;
      console.log('Transcript: -->', transcript);
      if (transcript !== 'Play.') {
        // Call a function to process the transcript as needed
        sendMessage(transcript);
      }
    }
  };
  
  const startListening = () => {
    setState("on");
    recognizer.current?.startContinuousRecognitionAsync(() => {
      console.log('Speech recognition started.');
    });
  };

  const stopListening = () => {
    setState("off");
    recognizer.current?.stopContinuousRecognitionAsync(() => {
      console.log('Speech recognition stopped.');
    });
  };

  const toggleListening = () => {
    switch(state){
      case "on":
        stopListening();
        break;
      case "off":
        startListening();
        break;
      default:
        console.warn("state is pause, shouldn't be able to toggle listening.")
        break;
    }
  }

  return (
    <Fab
      color={state === "off" ? "primary" : "error"}
      onClick={() => toggleListening()}
      sx={{
        marginLeft: "1rem",
        minWidth: 56,
        height: 56,
        width: 56
      }}
    >
      {state === "off" ? <KeyboardVoiceIcon /> : <MicOffIcon />}
    </Fab>
  );
};

export default SpeechToTextButton;