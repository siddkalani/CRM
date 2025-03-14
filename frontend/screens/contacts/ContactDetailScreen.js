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

const ContactDetailsScreen = ({ route, navigation }) => {
  // 1) Extract the contact object from navigation params
  const contactParam = route.params?.contact;
  // 2) The contact's MongoDB _id
  const contactId = contactParam?._id;

  // 3) Local state to store the “fresh” contact details from server
  const [contactDetails, setContactDetails] = useState(contactParam || null);

  // 4) State for new note creation
  const [newNote, setNewNote] = useState('');

  // Editing note states
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  // -------------------------------------------
  // (A) FETCH / REFRESH THE SINGLE CONTACT
  // -------------------------------------------
  const fetchContactDetails = async (id) => {
    try {
      // GET /api/contact/one/:contactId
      const response = await fetch(`${BASE_URL}/api/contacts/one/${id}`, {
        headers: {
          // Helps avoid 304 responses
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch contact details');
      }
      const data = await response.json();
      setContactDetails(data);
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  };

  // (B) EFFECT: On mount (and when contactId changes), fetch the contact
  useEffect(() => {
    if (contactId) {
      fetchContactDetails(contactId);
    }
  }, [contactId]);

  // (C) OPTIONAL POLLING via useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      let intervalId;
      if (contactId) {
        // Example: poll every 30 seconds
        // intervalId = setInterval(() => fetchContactDetails(contactId), 30000);
      }
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [contactId])
  );

  // -------------------------------------------
  // (D) NOTES: CREATE, EDIT, DELETE
  // -------------------------------------------
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      // POST /api/contact/one/:contactId/notes
      const response = await fetch(`${BASE_URL}/api/contacts/one/${contactId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
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
      // PUT /api/contact/one/:contactId/notes/:noteId
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${editNoteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editNoteText }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      setEditNoteId(null);
      setEditNoteText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update note.');
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      // DELETE /api/contact/one/:contactId/notes/:noteId
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note.');
      console.error(error);
    }
  };

  // -------------------------------------------
  // (E) RENDER
  // -------------------------------------------
  if (!contactDetails) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading contact details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Contact Info */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              {contactDetails.firstName} {contactDetails.lastName}
            </Text>
            <Text style={{ color: '#007BFF', marginTop: 4 }}>{contactDetails.email}</Text>
            <Text style={{ marginTop: 4 }}>{contactDetails.phone}</Text>
            {!!contactDetails.company && (
              <Text style={{ marginTop: 4 }}>{contactDetails.company}</Text>
            )}

            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#007BFF',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginTop: 8,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ color: '#007BFF' }}>+ Tag</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
        </View>

        {/* Add New Note */}
        <View style={{ borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 12 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Add a New Note</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
              padding: 8,
              minHeight: 60,
              textAlignVertical: 'top',
            }}
            placeholder="Type your new note here..."
            multiline
            value={newNote}
            onChangeText={setNewNote}
          />
          <TouchableOpacity
            onPress={handleAddNote}
            style={{
              backgroundColor: '#007BFF',
              borderRadius: 4,
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginTop: 8,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: '#fff' }}>Save Note</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Notes */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>Notes</Text>
          {Array.isArray(contactDetails.notes) && contactDetails.notes.length > 0 ? (
            contactDetails.notes.map((note) => (
              <View
                key={note._id}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 4,
                  padding: 8,
                  marginTop: 8,
                }}
              >
                {editNoteId === note._id ? (
                  <>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 4,
                        padding: 8,
                        minHeight: 40,
                        textAlignVertical: 'top',
                      }}
                      multiline
                      value={editNoteText}
                      onChangeText={setEditNoteText}
                    />
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={handleSaveEditedNote}
                        style={{
                          backgroundColor: 'green',
                          paddingVertical: 4,
                          paddingHorizontal: 12,
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: '#fff' }}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditNoteId(null);
                          setEditNoteText('');
                        }}
                        style={{
                          backgroundColor: '#999',
                          paddingVertical: 4,
                          paddingHorizontal: 12,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ color: '#fff' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14 }}>{note.text}</Text>
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                      {new Date(note.createdAt).toLocaleString()}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleEditNote(note._id, note.text)}
                        style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                      >
                        <Ionicons name="create-outline" size={16} color="blue" />
                        <Text style={{ color: 'blue', marginLeft: 4 }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note._id)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Ionicons name="trash-outline" size={16} color="red" />
                        <Text style={{ color: 'red', marginLeft: 4 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: '#666' }}>No notes available.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        justifyContent: 'space-around',
        paddingVertical: 8,
      }}>
        <Ionicons name="mail-outline" size={24} color="#666" />
        <Ionicons name="checkmark-done-outline" size={24} color="#666" />
        <Ionicons name="map-outline" size={24} color="#666" />
        <Ionicons name="call-outline" size={24} color="#666" />
      </View>
    </View>
  );
};

export default ContactDetailsScreen;
