// LeadsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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

  // Updated search function: returns leads and matched notes
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

      // Check for notes match
      const matchedNotes = Array.isArray(lead.notes)
        ? lead.notes.filter((note) =>
            note.text && note.text.toLowerCase().includes(lowerText)
          )
        : [];

      // Check if lead name/email matches
      const leadMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (leadMatches || matchedNotes.length > 0) {
        acc.push({
          ...lead,
          matchedNotes, // <-- Add matched notes
        });
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

            {/* Show matched notes if any */}
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
    </View>
  );
};

export default LeadsScreen;
