import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';

const AddContactScreen = ({ navigation }) => {
  // State for each field
//   const [company, setCompany] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Function to handle saving the lead
  const handleSave = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const newLead = {
      firstName,
      lastName,
      email,
      phone,
      ownerId: userId,
    //   company,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/contacts/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add lead.');
        return;
      }

      // Wait for response data if needed (not used here)
      await response.json();

      // Show success alert and navigate back on confirmation
      Alert.alert('Success', 'Contact added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the lead.');
      console.error(error);
    }
  };

  // Add the checkmark icon in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add Contact',
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
  }, [navigation, firstName, lastName, email, phone]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ padding: 16 }}>
        {/* Lead Owner Section */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#666' }}>Lead Owner</Text>
          <Text style={{ fontWeight: '600', color: '#000' }}>siddharth kalani</Text>
        </View> */}

        {/* Company */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ color: 'red' }}>* Company</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 8,
              borderRadius: 4,
              marginTop: 4,
            }}
            placeholder="Enter Company"
            value={company}
            onChangeText={setCompany}
          />
        </View> */}

        {/* First Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: 'red' }}>* First Name</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 8,
              borderRadius: 4,
              marginTop: 4,
            }}
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Last Name */}
        <View style={{ marginBottom: 16 }}>
          <Text>Last Name</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 8,
              borderRadius: 4,
              marginTop: 4,
            }}
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: 'red' }}>* Email</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 8,
              borderRadius: 4,
              marginTop: 4,
            }}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#666' }}>Phone</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 8,
              borderRadius: 4,
              marginTop: 4,
            }}
            placeholder="Enter Phone Number"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </ScrollView>

      {/* Add Lead Button */}
      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: '#007bff',
          alignItems: 'center',
        }}
        onPress={handleSave}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Lead</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddContactScreen;
