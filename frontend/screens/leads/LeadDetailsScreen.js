// LeadDetailsScreen.js
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { updateLeadNotes } from '../../store/LeadSlice'; 
import { BASE_URL } from '../../constants/constant';

const LeadDetailsScreen = ({ route, navigation }) => {
  // Retrieve lead data (make sure the lead includes an _id field if coming from your backend)
  const lead = route.params?.lead || {
    _id: '123456', // sample id; in production this should come from your backend
    firstName: 'Carissa',
    lastName: 'Kidman (Sample)',
    email: 'carissa-kidman@noemail.invalid',
    phone: '555-555-5555',
    owner: 'siddharth kalani',
    notes: ''
  };

  // Tab state (RELATED, EMAILS, DETAILS)
  const [activeTab, setActiveTab] = useState('RELATED');

  // Notes state (typed only, no voice)
  const [notes, setNotes] = useState(lead.notes || '');

  const dispatch = useDispatch();

  // Pencil icon in header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Leads',
      headerRight: () => (
        <Ionicons
          name="pencil"
          size={24}
          color="#fff"
          style={{ marginRight: 16 }}
          onPress={() => {
            navigation.navigate('EditLeadDetails', { lead });
          }}
        />
      ),
    });
  }, [navigation, lead]);

  // Render top tabs
  const renderTabs = () => {
    const tabs = ['RELATED', 'EMAILS', 'DETAILS'];
    return (
      <View className="flex-row bg-blue-500">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`py-3 px-4 ${isActive ? 'border-b-2 border-white' : ''}`}
            >
              <Text className={`text-white ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Handler for saving notes
  const handleSaveNotes = async() => {
    try {
      // Backend URL (replace with your API endpoint)
      const apiUrl = `${BASE_URL}/api/lead/${lead._id}/notes`;

      // Make API call to update notes
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notes");
      }

      const data = await response.json();

      // Optionally, dispatch an action or update the local state with the response
      dispatch({ type: "UPDATE_LEAD_NOTES_SUCCESS", payload: data });

      alert("Notes updated successfully!");
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Failed to update notes. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {renderTabs()}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lead Info Row */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold">
              Ms. {lead.firstName} {lead.lastName}
            </Text>
            <Text className="text-blue-500 mt-1">{lead.email}</Text>
            <Text className="mt-1">{lead.phone}</Text>

            {/* Tag Button */}
            <TouchableOpacity className="border border-blue-500 rounded px-2 py-1 mt-2 self-start">
              <Text className="text-blue-500">+ Tag</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Lead Image */}
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            className="w-[60px] h-[60px] rounded-full"
          />
        </View>

        {/* NOTES area */}
        <View className="mt-4 border-t border-gray-300 py-3">
          <Text className="font-semibold mb-2">Add Notes</Text>

          {/* Text input for typed notes */}
          <TextInput
            className="border border-gray-300 rounded p-2 min-h-[60px] text-base"
            placeholder="Type your notes here..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* Save Notes Button */}
          <TouchableOpacity
            onPress={handleSaveNotes}
            className="bg-blue-500 rounded px-4 py-2 mt-2 self-start"
          >
            <Text className="text-white">Save Notes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom navigation bar */}
      <View className="flex-row border-t border-gray-300 justify-around py-2">
        <Ionicons name="mail-outline" size={24} color="#666" />
        <Ionicons name="checkmark-done-outline" size={24} color="#666" />
        <Ionicons name="map-outline" size={24} color="#666" />
        <Ionicons name="call-outline" size={24} color="#666" />
      </View>
    </View>
  );
};

export default LeadDetailsScreen;
