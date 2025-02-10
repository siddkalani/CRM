import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';

const LeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }
      // Adjust the endpoint URL if necessary
      const response = await fetch(`${BASE_URL}/api/lead/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch leads.');
        return;
      }
      const data = await response.json();
      // Adjust according to your API response structure
      setLeads(data.leads || data);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching leads.');
      console.error(error);
    }
  };

  // useFocusEffect will run fetchLeads every time the screen is focused,
  // ensuring the list is always up-to-date.
  useFocusEffect(
    React.useCallback(() => {
      fetchLeads();
    }, [])
  );

  return (
    <View className="flex-1 bg-white">
      {/* ——————————— Filter Bar ——————————— */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-300">
        <View className="flex-row items-center">
          <Text className="text-blue-500 text-base font-bold">All Leads</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity>
            <Ionicons name="filter-circle-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ——————————— Leads List ——————————— */}
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('LeadDetailsScreen', { lead: item })}
            className="flex-row items-center p-4 border-b border-gray-200"
          >
            <Ionicons
              name="person-circle"
              size={40}
              color="#999"
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-black text-base font-semibold">
                {item.firstName} {item.lastName}
              </Text>
              <Text className="text-gray-600">{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ——————————— Floating Action Button ——————————— */}
      <View className="absolute bottom-10 right-10">
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
