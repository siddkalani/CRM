import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';

const LeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchLeads = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/lead/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch leads.');
        return;
      }

      const data = await response.json();
      const allLeads = data.leads || [];
      setLeads(allLeads);
      setFilteredLeads(allLeads);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching leads.');
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [])
  );

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
        ? lead.notes.filter((note) =>
            note.text && note.text.toLowerCase().includes(lowerText)
          )
        : [];

      const leadMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (leadMatches || matchedNotes.length > 0) {
        acc.push({ ...lead, matchedNotes });
      }

      return acc;
    }, []);

    setFilteredLeads(matchedLeads);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader
        navigation={navigation}
        title="Leads"
        onSearchChange={handleSearchChange}
      />

      {/* Filter Panel */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-300">
        <Text className="text-blue-500 text-base font-bold">All Leads</Text>
        <TouchableOpacity>
          <Ionicons name="filter-circle-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('LeadDetailsScreen', { lead: item })
            }
            className="p-4 border-b border-gray-200"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="person-circle"
                size={40}
                color="#999"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text className="text-black text-base font-semibold">
                  {item.firstName} {item.lastName}
                </Text>
                <Text className="text-gray-600">{item.email}</Text>
              </View>
            </View>

            {item.matchedNotes && item.matchedNotes.length > 0 && (
              <View className="mt-2 ml-12">
                {item.matchedNotes.map((note) => (
                  <Text key={note._id} className="text-gray-700 text-sm">
                    • {note.text}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <View style={{ position: 'absolute', bottom: 40, right: 20 }}>
        <TouchableOpacity
          className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate('AddLeadScreen')}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeadsScreen;
