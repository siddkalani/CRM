import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVoice } from '../context/VoiceContext';

const CustomHeader = ({
  navigation,
  title = 'Home',
  showBackButton = false,
  showSearchButton = true,
  enableVoice = true,
  onSearchChange = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording
  } = useVoice();

  useEffect(() => {
    if (searchMode && recognizedText) {
      const newText = searchText
        ? `${searchText} ${recognizedText}`
        : recognizedText;
      setSearchText(newText.trim());
      onSearchChange(newText.trim());
      setRecognizedText('');
    }
  }, [recognizedText]);

  const handleSearchInput = (text) => {
    setSearchText(text);
    onSearchChange(text);
  };

  return (
    <View style={{ backgroundColor: '#007BFF', paddingTop: insets.top + 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 12 }}>
        {searchMode ? (
          <>
            <TouchableOpacity
              onPress={() => {
                setSearchMode(false);
                handleSearchInput('');
              }}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 40,
            }}>
              <TextInput
                style={{ flex: 1, paddingVertical: 0 }}
                placeholder="Search..."
                value={searchText}
                onChangeText={handleSearchInput}
                autoFocus
              />

              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchInput('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

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
              numberOfLines={1}
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
    </View>
  );
};

export default CustomHeader;
