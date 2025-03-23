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
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

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

  // Delete contact logic
  const deleteContact = async (contactId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contact');
      }
      const updatedContacts = contacts.filter(contact => contact._id !== contactId);
      setContacts(updatedContacts);
      setFilteredContacts(filteredContacts.filter(contact => contact._id !== contactId));
      Alert.alert('Success', 'Contact deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while deleting the contact');
      console.error(error);
    }
  };

  const confirmDeleteContact = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteContact(contact._id) }
      ],
      { cancelable: true }
    );
  };

  const renderRightActions = (contact) => {
    return (
      <TouchableOpacity
        className="bg-red-500 w-20 justify-center items-center"
        onPress={() => confirmDeleteContact(contact)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text className="text-white text-xs mt-1">Delete</Text>
      </TouchableOpacity>
    );
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    const lowerText = text.toLowerCase();
    const matched = contacts.reduce((acc, contact) => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
      const email = (contact.email || '').toLowerCase();

      const matchedNotes = Array.isArray(contact.notes)
        ? contact.notes.filter((note) =>
            note.text && note.text.toLowerCase().includes(lowerText)
          )
        : [];
      if (fullName.includes(lowerText) || email.includes(lowerText) || matchedNotes.length > 0) {
        acc.push({ ...contact, matchedNotes });
      }
      return acc;
    }, []);
    setFilteredContacts(matched);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
      <Ionicons name="people-outline" size={64} color="#CBD5E1" />
      <Text className="text-xl font-semibold text-gray-700 mt-4">No contacts found</Text>
      <Text className="text-gray-500 text-center mt-2">
        Add your first contact by tapping the + button below
      </Text>
      <TouchableOpacity
        className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
        onPress={() => navigation.navigate('AddContactScreen')}
      >
        <Text className="text-white font-medium">Add Contact</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-white">
          {/* Skeleton Header */}
          <View className="bg-blue-600 pt-10">
            <View className="flex-row items-center h-14 px-4">
              <SkeletonLoader width={24} height={24} borderRadius={4} style={{ marginRight: 10 }} />
              <SkeletonLoader width={100} height={16} borderRadius={4} />
              <View className="flex-1" />
              <SkeletonLoader width={24} height={24} borderRadius={4} />
            </View>
          </View>
          {/* Skeleton Filter Bar */}
          <View className="px-4 py-3 border-b border-gray-200">
            <SkeletonLoader width={80} height={16} borderRadius={4} />
          </View>
          {/* Skeleton List Items */}
          <View className="flex-1 p-4">
            {[...Array(5)].map((_, idx) => (
              <View key={idx} className="flex-row items-center mb-4 p-2">
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View className="ml-3 flex-1">
                  <SkeletonLoader width="80%" height={16} borderRadius={4} />
                  <SkeletonLoader width="60%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <StatusBar style="light" />
        <CustomHeader
          navigation={navigation}
          title="Contacts"
          onSearchChange={handleSearchChange}
        />
        {/* Filter Bar */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <Text className="font-bold text-blue-600">All Contacts</Text>
          <View className="flex-row">
            <TouchableOpacity style={{ marginLeft: 8, padding: 4 }} onPress={fetchContacts}>
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
            <Swipeable
              renderRightActions={() => renderRightActions(item)}
              friction={2}
              rightThreshold={40}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('ContactDetailsScreen', { contact: item })}
                className="p-4 border-b border-gray-100 active:bg-gray-50 bg-white"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-xl">
                      {`${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">
                      {item.firstName} {item.lastName}
                    </Text>
                    {item.email ? (
                      <Text className="text-gray-500 text-sm">{item.email}</Text>
                    ) : (
                      <Text className="text-gray-500 text-sm">No email provided</Text>
                    )}
                    {item.phone && (
                      <Text className="text-gray-500 text-sm">{item.phone}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
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
            </Swipeable>
          )}
        />
        {/* Floating Action Button */}
        <View className="absolute bottom-10 right-5">
          <TouchableOpacity
            style={{
              backgroundColor: "#007BFF",
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
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
    </GestureHandlerRootView>
  );
};

export default ContactScreen;
