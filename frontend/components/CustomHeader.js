import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomHeader = ({
  navigation,
  title = 'Home',
  showBackButton = false,
  showSearchButton = true, // new prop to conditionally show/hide search
  onSearchChange = () => {},
}) => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchInput = (text) => {
    setSearchText(text);
    onSearchChange(text);
  };

  return (
    <SafeAreaView className="bg-blue-500">
      <View className="flex-row items-center px-4" style={{ height: 56 }}>
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
              className="flex-1 bg-white px-3 py-2 rounded-md text-base"
              placeholder="Search All Modules"
              value={searchText}
              onChangeText={handleSearchInput}
              autoFocus
              style={{ height: 40 }}
            />

            <TouchableOpacity
              onPress={() => handleSearchInput('')}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {showBackButton && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}

            <Text className="text-white text-lg font-semibold flex-1">
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
