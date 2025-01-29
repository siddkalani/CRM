import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Welcome + Dropdown */}
      <View className="bg-gray-100 px-4 py-3">
        <Text className="text-gray-700 text-base mb-2">
          Welcome siddharth kalani
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center justify-between bg-white rounded-md px-3 py-2 shadow"
        >
          <Text className="text-gray-800">siddharth kalani's Home</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View className="px-4 pt-4">
        {/* My Open Deals */}
        <View className="bg-white rounded-md shadow p-4 mb-2">
          <Text className="text-gray-700 text-base font-semibold">
            My Open Deals
          </Text>
          <Text className="text-2xl font-bold text-black">8</Text>
        </View>

        {/* My Untouched Deals */}
        <View className="bg-white rounded-md shadow p-4 mb-2">
          <Text className="text-gray-700 text-base font-semibold">
            My Untouched Deals
          </Text>
          <Text className="text-2xl font-bold text-black">2</Text>
        </View>

        {/* My Today's Calls */}
        <View className="bg-white rounded-md shadow p-4 mb-2">
          <Text className="text-gray-700 text-base font-semibold">
            My Today's Calls
          </Text>
          <Text className="text-2xl font-bold text-black">0</Text>
        </View>
      </View>

      {/* Floating "Zia" Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="absolute bottom-20 right-4 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow"
      >
        <Text className="text-white font-bold">Zia</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
