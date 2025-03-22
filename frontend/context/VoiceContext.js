// VoiceContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Voice from '@react-native-voice/voice';

// 1) Create the context
const VoiceContext = createContext(null);

// 2) Create the Provider component that wraps your app
export const VoiceProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  useEffect(() => {
    // Register Voice listeners once
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length) {
        const phrase = event.value[0].trim();
        // Append recognized text to existing
        setRecognizedText((prev) =>
          prev ? `${prev} ${phrase}` : phrase
        );
      }
    };

    Voice.onSpeechError = (error) => {
        const errorCode = error?.error?.code || error?.error?.message;
      
        // Suppress "No match" (code 7 or message "7/No match")
        if (errorCode === '7' || errorCode === '7/No match' || errorCode?.includes('No match')) {
          setIsRecording(false);
          return; // don't show alert
        }
      
        // Alert.alert(
        //   'Speech Error',
        //   error?.error?.message || 'Something went wrong'
        // );
        setIsRecording(false);
      };
      

    // Cleanup on unmount (only once)
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    try {
      // Clear old text each time we start
      setRecognizedText('');
      setIsRecording(true);
      await Voice.start('en-US'); // or any locale
    } catch (err) {
      console.log('startRecording error', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (err) {
      console.log('stopRecording error', err);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isRecording,
        recognizedText,
        setRecognizedText, // to manually clear or reset
        startRecording,
        stopRecording
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

// 3) Export a convenient hook to use the context
export const useVoice = () => {
  return useContext(VoiceContext);
};
