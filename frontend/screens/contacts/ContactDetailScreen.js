import React, { useState, useEffect, useCallback } from 'react';
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
import CustomHeader from '../../components/CustomHeader';
import { useVoice } from '../../context/VoiceContext'; // <-- Voice Context
import SkeletonLoader from '../../components/SkeletonLoader';

const ContactDetailsScreen = ({ route, navigation }) => {
  const contactParam = route.params?.contact;
  const contactId = contactParam?._id;

  const [contactDetails, setContactDetails] = useState(contactParam || null);
  const [searchText, setSearchText] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  // Voice input
  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording,
  } = useVoice();

  // Append recognized voice text to newNote
  useEffect(() => {
    if (recognizedText) {
      setNewNote((prev) => (prev ? `${prev} ${recognizedText}` : recognizedText));
      setRecognizedText('');
    }
  }, [recognizedText]);

  const fetchContactDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/contacts/one/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch contact details');
      const data = await response.json();
      setContactDetails(data);
      if (data.notes && Array.isArray(data.notes)) {
        setFilteredNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  };

  useEffect(() => {
    if (contactId) fetchContactDetails(contactId);
  }, [contactId]);

  useFocusEffect(
    useCallback(() => {
      let intervalId;
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [contactId])
  );

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/contacts/one/${contactId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      setNewNote('');
      if (updatedContact.notes && Array.isArray(updatedContact.notes)) {
        setFilteredNotes(updatedContact.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedContact.notes);
        }
      }
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
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${editNoteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editNoteText }),
        }
      );
      if (!response.ok) throw new Error('Failed to update note');
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      setEditNoteId(null);
      setEditNoteText('');
      if (updatedContact.notes && Array.isArray(updatedContact.notes)) {
        setFilteredNotes(updatedContact.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedContact.notes);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update note.');
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${noteId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete note');
      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      if (updatedContact.notes && Array.isArray(updatedContact.notes)) {
        setFilteredNotes(updatedContact.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedContact.notes);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note.');
      console.error(error);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    filterNotes(text, contactDetails.notes || []);
  };

  const filterNotes = (searchValue, notesArray) => {
    if (!searchValue.trim()) {
      setFilteredNotes(notesArray);
      return;
    }
    const lowerText = searchValue.toLowerCase();
    const matched = notesArray.filter((note) =>
      note.text?.toLowerCase().includes(lowerText)
    );
    setFilteredNotes(matched);
  };

  if (!contactDetails) {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="40%" height={16} />
        <SkeletonLoader width="50%" height={16} />
        <SkeletonLoader width="100%" height={60} borderRadius={8} />
        <SkeletonLoader width="30%" height={40} />
        <SkeletonLoader width="100%" height={100} borderRadius={8} />
        <SkeletonLoader width="100%" height={100} borderRadius={8} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader
        navigation={navigation}
        title="Contact Details"
        showBackButton={true}
        showSearchButton={true}
        onSearchChange={handleSearchChange}
        enableVoice={false} // Disable voice in header, since we're using it in notes
      />

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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 4,
                padding: 8,
                minHeight: 60,
                flex: 1,
                textAlignVertical: 'top',
              }}
              placeholder="Type your new note here..."
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={{
                marginLeft: 8,
                backgroundColor: isRecording ? 'red' : '#007BFF',
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Ionicons
                name={isRecording ? 'mic-off' : 'mic'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
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

        {/* Notes */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>Notes</Text>
          {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
            [...filteredNotes].reverse().map((note) => (
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
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginRight: 16,
                        }}
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

      {/* Bottom Icons */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: '#ccc',
          justifyContent: 'space-around',
          paddingVertical: 8,
        }}
      >
        <Ionicons name="mail-outline" size={24} color="#666" />
        <Ionicons name="checkmark-done-outline" size={24} color="#666" />
        <Ionicons name="map-outline" size={24} color="#666" />
        <Ionicons name="call-outline" size={24} color="#666" />
      </View>
    </View>
  );
};

export default ContactDetailsScreen;
