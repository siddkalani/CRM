import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomHeader = ({
  navigation,           // <-- Make sure to destructure navigation
  title = 'Home',
  showBackButton = false,
  showSearchButton = true,
  onSearchChange = () => {},
}) => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchInput = (text) => {
    setSearchText(text);
    onSearchChange(text);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#007BFF' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16 }}>
        {searchMode ? (
          <>
            {/* Back Button in Search Mode */}
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

            <TouchableOpacity
              onPress={() => handleSearchInput('')}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Back Button in Normal Mode */}
            {showBackButton && navigation && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}

            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, flex: 1 }}>
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
