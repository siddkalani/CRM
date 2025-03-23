import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import SkeletonLoader from '../../components/SkeletonLoader';
import { StatusBar } from 'expo-status-bar';

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        setIsLoading(false);
        return;
      }

      // Fetch all contacts for this user
      const response = await fetch(`${BASE_URL}/api/contacts/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch contacts.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const allContacts = data.contacts || [];
      setContacts(allContacts);
      setFilteredContacts(allContacts);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching contacts.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  const handleSearchChange = (text) => {
    setSearchText(text);

    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const lowerText = text.toLowerCase();

    // Mirror the leads logic, but for contacts
    const matched = contacts.reduce((acc, contact) => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
      const email = (contact.email || '').toLowerCase();

      const matchedNotes = Array.isArray(contact.notes)
        ? contact.notes.filter((note) => 
            note.text && note.text.toLowerCase().includes(lowerText)
          )
        : [];

      const contactMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (contactMatches || matchedNotes.length > 0) {
        acc.push({
          ...contact,
          matchedNotes,
        });
      }

      return acc;
    }, []);

    setFilteredContacts(matched);
  };

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 16, 
      backgroundColor: '#f9fafb'
    }}>
      <Ionicons name="people-outline" size={64} color="#CBD5E1" />
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 8 }}>
        No contacts found
      </Text>
      <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
        Add your first contact by tapping the + button below
      </Text>
      <TouchableOpacity
        style={{
          marginTop: 16,
          backgroundColor: '#007BFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 24,
        }}
        onPress={() => navigation.navigate('AddContactScreen')}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Add Contact</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    // Skeleton UI, same idea as leads
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Skeleton Header */}
        <View style={{ backgroundColor: '#007BFF', paddingTop: 40 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            height: 56, 
            paddingHorizontal: 12 
          }}>
            {/* Icon placeholder */}
            <SkeletonLoader width={24} height={24} borderRadius={4} style={{ marginRight: 10 }} />
            {/* Title placeholder */}
            <SkeletonLoader width={100} height={16} borderRadius={4} />
            <View style={{ flex: 1 }} />
            {/* Right icon placeholder */}
            <SkeletonLoader width={24} height={24} borderRadius={4} />
          </View>
        </View>

        {/* Skeleton Filter Bar */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderBottomWidth: 1, 
          borderBottomColor: '#ccc' 
        }}>
          <SkeletonLoader width={80} height={16} borderRadius={4} />
        </View>

        {/* Skeleton List Items */}
        <View style={{ flex: 1, padding: 16 }}>
          {[...Array(5)].map((_, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              {/* Circular avatar placeholder */}
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              {/* Text lines placeholder */}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="60%" height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="light" />

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
        borderBottomColor: '#ccc',
        backgroundColor: '#f9fafb',
      }}>
        <Text style={{ fontWeight: 'bold', color: '#007BFF' }}>All Contacts</Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={{ marginLeft: 8, padding: 4 }}
            onPress={fetchContacts}
          >
            <Ionicons name="refresh-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
  data={filteredContacts}
  keyExtractor={(item) => item._id?.toString()}
  ListEmptyComponent={renderEmptyState}
  renderItem={({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ContactDetailsScreen', { contact: item })}
      className="p-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="flex-row items-center">
        {/* Avatar with initials */}
        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-3">
          <Text className="text-blue-600 font-bold text-xl">
            {`${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`}
          </Text>
        </View>

        {/* Contact info */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">
            {item.firstName} {item.lastName}
          </Text>
          {/* Show email if available */}
          {item.email ? (
            <Text className="text-gray-500 text-sm">{item.email}</Text>
          ) : (
            <Text className="text-gray-500 text-sm">No email provided</Text>
          )}
          {/* Show phone if available */}
          {item.phone && (
            <Text className="text-gray-500 text-sm">{item.phone}</Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>

      {/* Display matched notes if searching */}
      {item.matchedNotes && item.matchedNotes.length > 0 && (
        <View className="mt-2 ml-12 pl-2 border-l-2 border-blue-200">
          {item.matchedNotes.map((note) => (
            <Text key={note._id} className="text-gray-600 text-sm my-1">
              {note.text}
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
