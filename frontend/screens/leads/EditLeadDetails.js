import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditLeadDetails = ({ route, navigation }) => {
  const lead = route.params?.lead || {};

  // Pre-fill form fields with existing lead info
  const [firstName, setFirstName] = useState(lead.firstName || '');
  const [lastName, setLastName] = useState(lead.lastName || '');
  const [email, setEmail] = useState(lead.email || '');
  const [phone, setPhone] = useState(lead.phone || '');

  // Add a checkmark icon in the header for saving
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Lead',
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

  const handleSave = () => {
    // Typically update your backend or state management (Redux, etc.)
    // Then navigate back to details or wherever you want
    const updatedLead = {
      ...lead,
      firstName,
      lastName,
      email,
      phone,
    };

    // Example: go back to the detail screen (or pop to list)
    navigation.goBack();
    // If you want to pass updated data back, you can do so 
    // in various ways (Context, Redux, or route params).
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>First Name</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text>Last Name</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        value={lastName}
        onChangeText={setLastName}
      />

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        value={email}
        onChangeText={setEmail}
      />

      <Text>Phone</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
        value={phone}
        onChangeText={setPhone}
      />
    </View>
  );
};

export default EditLeadDetails;
