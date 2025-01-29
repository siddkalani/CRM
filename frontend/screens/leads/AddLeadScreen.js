import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddLeadScreen = ({ navigation }) => {
  // Example local states for each field
  const [company, setCompany] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Add a checkmark icon in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add Lead',
      headerRight: () => (
        <Ionicons
          name="checkmark"
          size={24}
          color="#fff"
          style={{ marginRight: 16 }}
          onPress={handleSave}
        />
      ),
    });
  }, [navigation, company, firstName, lastName, email, phone]);

  const handleSave = () => {
    // Here you would typically create a new lead object 
    // and call your API or Redux action, etc.
    const newLead = {
      id: Date.now(), // mock ID
      company,
      firstName,
      lastName,
      email,
      phone,
      owner: 'siddharth kalani',
    };

    // Navigate back or to a “LeadDetailsScreen” after saving
    navigation.goBack();
    // or: navigation.navigate('LeadDetailsScreen', { lead: newLead });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="px-4 py-2">
        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Lead Owner</Text>
          <Text className="text-black font-semibold">siddharth kalani</Text>
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-red-500">*</Text>
          <Text className="text-gray-600">Company</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md"
            placeholder="Enter Company"
            value={company}
            onChangeText={setCompany}
          />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">First Name</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md"
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-red-500">*</Text>
          <Text className="text-gray-600">Last Name</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md"
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Email</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md"
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="border-b border-gray-200 py-2">
          <Text className="text-gray-600">Phone</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md"
            placeholder="Enter Phone Number"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </ScrollView>

      {/* Show All Fields Button (optional) */}
      <TouchableOpacity className="p-4 border-t border-gray-200 items-center">
        <Text className="text-blue-500">Show all fields</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddLeadScreen;
