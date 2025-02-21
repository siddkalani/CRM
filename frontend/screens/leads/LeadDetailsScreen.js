import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';

const LeadDetailsScreen = ({ route, navigation }) => {
  // 1) Extract the lead from navigation params
  const lead = route.params?.lead;
  // 2) The lead's actual Mongo _id
  const leadId = lead?._id;

  // 3) Our local state to store the “fresh” details from server
  const [leadDetails, setLeadDetails] = useState(lead || null);

  // 4) State for new note creation, plus editing
  const [newNote, setNewNote] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  // -------------------------------------------
  // (A) FETCH / REFRESH THE SINGLE LEAD
  // -------------------------------------------
  const fetchLeadDetails = async (id) => {
    try {
      // Use the "one/:leadId" endpoint
      const response = await fetch(`${BASE_URL}/api/lead/one/${id}`, {
        headers: {
          // Helps avoid 304 responses if you were seeing that issue
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }
      const data = await response.json();
      setLeadDetails(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
  };

  // (B) EFFECT: On mount (and when leadId changes), fetch the lead
  useEffect(() => {
    if (leadId) {
      fetchLeadDetails(leadId);
    }
  }, [leadId]);

  // (C) OPTIONAL POLLING via useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      let intervalId;
      if (leadId) {
        // Example: poll every 30 seconds
        // intervalId = setInterval(() => fetchLeadDetails(leadId), 30000);
      }
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [leadId])
  );

  // -------------------------------------------
  // (D) NOTES: CREATE, EDIT, DELETE
  // -------------------------------------------
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      // POST /api/lead/one/:leadId/notes
      const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setNewNote('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note.');
      console.error(error);
    }
  };

  const handleEditNote = (noteId, currentText) => {
    setEditNoteId(noteId);
    setEditNoteText(currentText);
  };

  const handleSaveEditedNote = async () => {
    try {
      // PUT /api/lead/one/:leadId/notes/:noteId
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${editNoteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editNoteText }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setEditNoteId(null);
      setEditNoteText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update note.');
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      // DELETE /api/lead/one/:leadId/notes/:noteId
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note.');
      console.error(error);
    }
  };

  // -------------------------------------------
  // (E) RENDER
  // -------------------------------------------
  if (!leadDetails) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading lead details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lead Info */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold">
              Ms. {leadDetails.firstName} {leadDetails.lastName}
            </Text>
            <Text className="text-blue-500 mt-1">{leadDetails.email}</Text>
            <Text className="mt-1">{leadDetails.phone}</Text>
            {!!leadDetails.company && (
              <Text className="mt-1">{leadDetails.company}</Text>
            )}

            <TouchableOpacity className="border border-blue-500 rounded px-2 py-1 mt-2 self-start">
              <Text className="text-blue-500">+ Tag</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            className="w-[60px] h-[60px] rounded-full"
          />
        </View>

        {/* Add New Note */}
        <View className="mt-4 border-t border-gray-300 py-3">
          <Text className="font-semibold mb-2">Add a New Note</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 min-h-[60px] text-base"
            placeholder="Type your new note here..."
            multiline
            value={newNote}
            onChangeText={setNewNote}
          />
          <TouchableOpacity
            onPress={handleAddNote}
            className="bg-blue-500 rounded px-4 py-2 mt-2 self-start"
          >
            <Text className="text-white">Save Note</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Notes */}
        <View className="mt-4">
          <Text className="font-semibold text-lg">Notes</Text>
          {Array.isArray(leadDetails.notes) && leadDetails.notes.length > 0 ? (
            leadDetails.notes.map((note) => (
              <View
                key={note._id}
                className="border border-gray-200 rounded p-3 mt-2"
              >
                {editNoteId === note._id ? (
                  <>
                    <TextInput
                      className="border border-gray-300 rounded p-2 min-h-[40px] text-base"
                      multiline
                      value={editNoteText}
                      onChangeText={setEditNoteText}
                    />
                    <View className="flex-row mt-2">
                      <TouchableOpacity
                        onPress={handleSaveEditedNote}
                        className="bg-green-600 px-3 py-1 rounded mr-2"
                      >
                        <Text className="text-white">Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditNoteId(null);
                          setEditNoteText('');
                        }}
                        className="bg-gray-400 px-3 py-1 rounded"
                      >
                        <Text className="text-white">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="text-base">{note.text}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </Text>
                    <View className="flex-row mt-2">
                      <TouchableOpacity
                        onPress={() => handleEditNote(note._id, note.text)}
                        className="flex-row items-center mr-4"
                      >
                        <Ionicons name="create-outline" size={16} color="blue" />
                        <Text className="text-blue-500 ml-1">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note._id)}
                        className="flex-row items-center"
                      >
                        <Ionicons name="trash-outline" size={16} color="red" />
                        <Text className="text-red-500 ml-1">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <Text className="mt-2 text-gray-500">No notes available.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
