import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddLeadScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">

      {/* Lead Form */}
      <ScrollView className="px-4 py-2">
        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Lead Owner</Text>
          <Text className="text-black font-semibold">siddharth kalani</Text>
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-red-500">*</Text>
          <Text className="text-gray-600">Company</Text>
          <TextInput className="border border-gray-300 p-2 rounded-md" placeholder="Enter Company" />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">First Name</Text>
          <TextInput className="border border-gray-300 p-2 rounded-md" placeholder="Enter First Name" />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-red-500">*</Text>
          <Text className="text-gray-600">Last Name</Text>
          <TextInput className="border border-gray-300 p-2 rounded-md" placeholder="Enter Last Name" />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Email</Text>
          <TextInput className="border border-gray-300 p-2 rounded-md" placeholder="Enter Email" />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Phone</Text>
          <TextInput className="border border-gray-300 p-2 rounded-md" placeholder="Enter Phone Number" />
        </View>
      </ScrollView>

      {/* Show All Fields Button */}
      <TouchableOpacity className="p-4 border-t border-gray-200 items-center">
        <Text className="text-blue-500">Show all fields</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddLeadScreen;
