import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const SpeechToTextComponent = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent('onSpeechResults', (event) => {
    setTranscript(event.value[0]);
  });

  const startListening = async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (granted) {
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
      });
    } else {
      console.warn('Microphone permission not granted');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View>
      <Button
        title={isListening ? 'Stop Listening' : 'Start Listening'}
        onPress={isListening ? stopListening : startListening}
      />
      <Text>Transcript: {transcript}</Text>
    </View>
  );
};

export default SpeechToTextComponent;
