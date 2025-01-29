import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1) Import react-native-voice
import Voice from '@react-native-community/voice';

const LeadDetailsScreen = ({ route, navigation }) => {
  // Retrieve lead data
  const lead = route.params?.lead || {
    firstName: 'Carissa',
    lastName: 'Kidman (Sample)',
    email: 'carissa-kidman@noemail.invalid',
    phone: '555-555-5555',
    owner: 'siddharth kalani',
  };

  // Tab state (RELATED, EMAILS, DETAILS)
  const [activeTab, setActiveTab] = useState('RELATED');

  // 2) Notes state
  const [notes, setNotes] = useState('');
  // Whether we’re currently recording voice input
  const [isRecording, setIsRecording] = useState(false);

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

  // 3) Setup Voice recognition callbacks
  useEffect(() => {
    // Called when speech is detected
    Voice.onSpeechStart = onSpeechStart;
    // Called when speech ends
    Voice.onSpeechEnd = onSpeechEnd;
    // Called when final text is recognized
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Cleanup listeners
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech recognition started');
  };

  const onSpeechEnd = () => {
    console.log('Speech recognition stopped');
    setIsRecording(false);
  };

  const onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      // Just append recognized text to existing notes
      const recognizedText = e.value[0];
      setNotes((prevNotes) => (prevNotes ? `${prevNotes} ${recognizedText}` : recognizedText));
    }
  };

  const onSpeechError = (e) => {
    console.log('Speech recognition error:', e.error);
    setIsRecording(false);
  };

  // 4) Functions to start/stop voice recognition
  const startRecording = async () => {
    setIsRecording(true);
    try {
      await Voice.start('en-US'); // specify language locale
    } catch (e) {
      console.error('startRecording error:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      await Voice.stop();
    } catch (e) {
      console.error('stopRecording error:', e);
    }
  };

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
              className={`
                py-3 px-4
                ${isActive ? 'border-b-2 border-white' : ''}
              `}
            >
              <Text
                className={`
                  text-white 
                  ${isActive ? 'font-bold' : 'font-semibold'}
                `}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
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

          {/* Voice record / stop buttons */}
          <View className="flex-row items-center mt-2">
            {/* Start recording (mic icon) */}
            {!isRecording && (
              <TouchableOpacity
                onPress={startRecording}
                className="flex-row items-center px-3 py-2 border border-blue-500 rounded mr-2"
              >
                <Ionicons name="mic-outline" size={18} color="#4285F4" />
                <Text className="text-blue-500 ml-1">Start Voice</Text>
              </TouchableOpacity>
            )}

            {/* Stop recording */}
            {isRecording && (
              <TouchableOpacity
                onPress={stopRecording}
                className="flex-row items-center px-3 py-2 border border-red-500 rounded"
              >
                <Ionicons name="square-outline" size={18} color="red" />
                <Text className="text-red-500 ml-1">Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Could add more sections (Closed Meetings, Attachments, etc.) here... */}
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
