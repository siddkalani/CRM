import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import SkeletonLoader from '../../components/SkeletonLoader';

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // Ensure notes are returned with contacts
      const response = await fetch(`${BASE_URL}/api/contacts/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch contacts.');
        return;
      }

      const data = await response.json();
      const allContacts = data.contacts || [];
      setContacts(allContacts);
      setFilteredContacts(allContacts);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching contacts.');
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  // Search logic to filter contacts and matched notes
  const handleSearchChange = (text) => {
    setSearchText(text);

    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const lowerText = text.toLowerCase();

    const matchedContacts = contacts.reduce((acc, contact) => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
      const email = (contact.email || '').toLowerCase();

      // Check notes for matches
      const matchedNotes = Array.isArray(contact.notes)
        ? contact.notes.filter((note) =>
            note.text && note.text.toLowerCase().includes(lowerText)
          )
        : [];

      const contactMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (contactMatches || matchedNotes.length > 0) {
        acc.push({
          ...contact,
          matchedNotes, // Attach matched notes
        });
      }

      return acc;
    }, []);

    setFilteredContacts(matchedContacts);
  };

  if (!contacts.length) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        {[...Array(5)].map((_, idx) => (
          <View key={idx} style={{ flexDirection: 'row', marginBottom: 16 }}>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <SkeletonLoader width="80%" height={16} />
              <SkeletonLoader width="60%" height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header with Search */}
      <CustomHeader
        navigation={navigation}
        title="Contacts"
        onSearchChange={handleSearchChange}
      />

      {/* Filter Bar */}
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

      {/* Contact List with matched notes */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ContactDetailsScreen', { contact: item })
            }
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            </View>

            {/* Display matched notes if any */}
            {item.matchedNotes && item.matchedNotes.length > 0 && (
              <View style={{ marginTop: 6, marginLeft: 52 }}>
                {item.matchedNotes.map((note) => (
                  <Text key={note._id} style={{ color: '#555', fontSize: 14 }}>
                    • {note.text}
                  </Text>
                ))}
              </View>
            )}
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
