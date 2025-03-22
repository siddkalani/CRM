// CustomHeader.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoice } from '../context/VoiceContext'; // <-- import your voice context

const CustomHeader = ({
  navigation,
  title = 'Home',
  showBackButton = false,
  showSearchButton = true,
  enableVoice = true, 
  onSearchChange = () => {},
}) => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Get the voice manager from context
  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording
  } = useVoice();

  // Whenever recognizedText changes (while in search mode), append it to searchText
  useEffect(() => {
    if (searchMode && recognizedText) {
      const newText = searchText
        ? `${searchText} ${recognizedText}`
        : recognizedText;
      setSearchText(newText.trim());
      onSearchChange(newText.trim());

      // Clear recognizedText so it doesn't keep re-appending
      setRecognizedText('');
    }
  }, [recognizedText]);

  const handleSearchInput = (text) => {
    setSearchText(text);
    onSearchChange(text);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#007BFF' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16 }}>
        {searchMode ? (
          <>
            <TouchableOpacity
              onPress={() => {
                setSearchMode(false);
                handleSearchInput('');
              }}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#fff',
                paddingHorizontal: 8,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              placeholder="Search..."
              value={searchText}
              onChangeText={handleSearchInput}
              autoFocus
            />

            <TouchableOpacity onPress={() => handleSearchInput('')} style={{ marginLeft: 10 }}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Mic only if enabled */}
            {enableVoice && (
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {showBackButton && navigation && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}

            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 18,
                flex: 1,
              }}
            >
              {title}
            </Text>

            {showSearchButton && (
              <TouchableOpacity onPress={() => setSearchMode(true)}>
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;
