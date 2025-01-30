import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const leadsData = [
  { id: '1', name: 'Aadit Kj', email: 'arissa-kidman@noemail.invalid' },
  { id: '2', name: 'Christopher Maclead (Sample)', email: 'christopher-maclead@noemail.invalid' },
  { id: '3', name: 'Carissa Kidman (Sample)', email: 'carissa-kidman@noemail.invalid' },
  { id: '4', name: 'James Merced (Sample)', email: 'james-merced@noemail.invalid' },
  { id: '5', name: 'Tresa Sweely (Sample)', email: 'tresa-sweely@noemail.invalid' },
  { id: '6', name: 'Felix Hirpara (Sample)', email: 'felix-hirpara@noemail.invalid' },
  { id: '7', name: 'Kayleigh Lace (Sample)', email: 'kayleigh-lace@noemail.invalid' },
];

const LeadsScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">

      {/* ——————————— Filter Bar ——————————— */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-300">
        {/* Left side: “All Leads” + Down Arrow */}
        <View className="flex-row items-center">
          <Text className="text-blue-500 text-base font-bold">All Contacts</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#4285F4"
            style={{ marginLeft: 4 }}
          />
        </View>

        {/* Right side: Search, Settings, 3-dots */}
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Ionicons name="search" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Ionicons name="settings" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ——————————— Leads List ——————————— */}
      <FlatList
        data={leadsData}
        keyExtractor={(item) => item.id}
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
              <Text className="text-black text-base font-semibold">{item.name}</Text>
              <Text className="text-gray-600">{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ——————————— Single FAB ——————————— */}
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
