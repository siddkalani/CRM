import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomHeader = ({ title = 'Home' }) => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Get device's safe area padding (ensures consistent alignment)
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="bg-blue-500"
    >
      {/* Fixed height to prevent jumping */}
      <View className="flex-row items-center px-4" style={{ height: 56 }}>
        {searchMode ? (
          // Search Mode Header
          <>
            {/* Back Button */}
            <TouchableOpacity onPress={() => setSearchMode(false)} style={{ marginRight: 10 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Search Input */}
            <TextInput
              className="flex-1 bg-white px-3 py-2 rounded-md text-base"
              placeholder="Search All Modules"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              style={{ height: 40 }} // Ensures consistent height
            />

            {/* Close (X) Button */}
            <TouchableOpacity onPress={() => setSearchText('')} style={{ marginLeft: 10 }}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          // Default Header Mode
          <>
            <Text className="text-white text-lg font-semibold flex-1">{title}</Text>

            {/* Search Icon */}
            <TouchableOpacity onPress={() => setSearchMode(true)}>
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;
