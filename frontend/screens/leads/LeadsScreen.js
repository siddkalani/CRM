import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import SkeletonLoader from '../../components/SkeletonLoader';
import { StatusBar } from 'expo-status-bar';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const LeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/lead/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch leads.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const allLeads = data.leads || [];
      setLeads(allLeads);
      setFilteredLeads(allLeads);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching leads.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [])
  );

  const deleteLead = async (leadId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lead/${leadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lead');
      }

      // Remove lead from state
      const updatedLeads = leads.filter(lead => lead._id !== leadId);
      setLeads(updatedLeads);
      setFilteredLeads(filteredLeads.filter(lead => lead._id !== leadId));
      
      Alert.alert('Success', 'Lead deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while deleting the lead');
      console.error(error);
    }
  };

  const confirmDeleteLead = (lead) => {
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => deleteLead(lead._id),
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  const handleSearchChange = (text) => {
    setSearchText(text);

    if (!text.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const lowerText = text.toLowerCase();

    const matchedLeads = leads.reduce((acc, lead) => {
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
      const email = (lead.email || '').toLowerCase();

      const matchedNotes = Array.isArray(lead.notes)
        ? lead.notes.filter((note) => note.text && note.text.toLowerCase().includes(lowerText))
        : [];

      const leadMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (leadMatches || matchedNotes.length > 0) {
        acc.push({ ...lead, matchedNotes });
      }

      return acc;
    }, []);

    setFilteredLeads(matchedLeads);
  };

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">No leads found</Text>
        <Text className="text-gray-500 text-center mt-2">
          Add your first lead by tapping the + button below
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
          onPress={() => navigation.navigate('AddLeadScreen')}
        >
          <Text className="text-white font-medium">Add Lead</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (lead) => {
    return (
      <TouchableOpacity
        className="bg-red-500 w-20 justify-center items-center"
        onPress={() => confirmDeleteLead(lead)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text className="text-white text-xs mt-1">Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('LeadDetailsScreen', { lead: item })}
        className="p-4 border-b border-gray-100 bg-white"
      >
        <View className="flex-row items-center">
          {/* Avatar with initials */}
          <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Text className="text-blue-600 font-bold text-xl">
              {`${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`}
            </Text>
          </View>

          {/* Lead info */}
          <View className="flex-1">
            <Text className="font-semibold text-gray-800">
              {item.firstName} {item.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.email || 'No email provided'}
            </Text>
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
    </Swipeable>
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
                <View className="h-2" />
                <SkeletonLoader width="60%" height={14} borderRadius={4} />
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
        
        {/* Custom Header with Search */}
        <CustomHeader
          navigation={navigation}
          title="Leads"
          onSearchChange={handleSearchChange}
          containerClassName="bg-blue-600"
          titleClassName="text-white font-bold text-lg"
          searchPlaceholder="Search leads..."
        />

        {/* Filter Bar */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <Text className="font-bold text-blue-600">All Leads</Text>
          <View className="flex-row">
            <TouchableOpacity className="ml-2 p-1" onPress={fetchLeads}>
              <Ionicons name="refresh-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Leads List */}
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item._id?.toString()}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderItem}
        />

        {/* Floating Action Button */}
        <View className="absolute bottom-10 right-5">
          <TouchableOpacity
            className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            onPress={() => navigation.navigate('AddLeadScreen')}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default LeadsScreen;