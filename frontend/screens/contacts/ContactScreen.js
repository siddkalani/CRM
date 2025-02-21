import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // Must match GET /api/contact/user/:userId
      const response = await fetch(`${BASE_URL}/api/contacts/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch contacts.');
        return;
      }

      const data = await response.json();
      // data should be { contacts: [...] }
      setContacts(data.contacts || []);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching contacts.');
      console.error(error);
    }
  };

  // Refresh list whenever screen is in focus
  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: '#ccc'
      }}>
        <Text style={{ fontWeight: 'bold', color: '#007BFF' }}>
          All Contacts
        </Text>
        <TouchableOpacity>
          <Ionicons name="filter-circle-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ContactDetailsScreen', { contact: item })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <Ionicons
              name="person-circle"
              size={40}
              color="#999"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: '#000' }}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={{ color: '#666' }}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        right: 20
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007BFF',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={() => navigation.navigate('AddContactScreen')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactScreen;
