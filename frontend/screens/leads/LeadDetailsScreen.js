import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '../../components/SkeletonLoader';
import { BASE_URL } from '../../constants/constant';
import CustomHeader from '../../components/CustomHeader';
import { useVoice } from '../../context/VoiceContext';
import * as DocumentPicker from 'expo-document-picker'; // <-- add here
import AsyncStorage from '@react-native-async-storage/async-storage';


const LeadDetailsScreen = ({ route, navigation }) => {
  const lead = route.params?.lead;
  const leadId = lead?._id;

  const [leadDetails, setLeadDetails] = useState(lead || null);
  const [searchText, setSearchText] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  // For document picker
  const [attachedDocuments, setAttachedDocuments] = useState([]);
  const [tempAttachedDocuments, setTempAttachedDocuments] = useState([]);

  // Voice from context
  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording,
  } = useVoice();

  useEffect(() => {
    if (recognizedText) {
      setNewNote((prev) =>
        prev ? `${prev} ${recognizedText}` : recognizedText
      );
      setRecognizedText('');
    }
  }, [recognizedText]);

  useEffect(() => {
    if (leadId) fetchLeadDetails(leadId);
  }, [leadId]);

  const fetchLeadDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${id}`);
      const data = await response.json();
      setLeadDetails(data);
      if (Array.isArray(data.notes)) setFilteredNotes(data.notes);
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
  };

 // Load documents from AsyncStorage
 const loadDocuments = async () => {
  try {
    const storedDocuments = await AsyncStorage.getItem(`documents_${leadId}`);
    if (storedDocuments) {
      const documents = JSON.parse(storedDocuments);
      setAttachedDocuments(documents);
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
};

// Pick a document (temporary display)
const handlePickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      // Add document to temporary state
      setTempAttachedDocuments((prev) => [...prev, result]);

      // Show confirmation to the user
      Alert.alert('Success', `Document "${result.name}" added temporarily!`);
    }
  } catch (error) {
    console.warn('Document picking failed:', error);
    Alert.alert('Error', 'Failed to pick document');
  }
};

// Save both temporary and existing documents to AsyncStorage
const handleSaveDocuments = async () => {
  try {
    const updatedDocuments = [...attachedDocuments, ...tempAttachedDocuments];

    // Save to AsyncStorage
    await AsyncStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocuments));

    // Update persisted state and clear temporary state
    setAttachedDocuments(updatedDocuments);
    setTempAttachedDocuments([]);

    Alert.alert('Success', 'All documents saved successfully!');
  } catch (error) {
    console.error('Error saving documents:', error);
    Alert.alert('Error', 'Failed to save documents');
  }
};

// Remove a document from temporary or saved state
const handleRemoveDocument = (docIndex, isTemporary) => {
  if (isTemporary) {
    setTempAttachedDocuments((prev) => prev.filter((_, index) => index !== docIndex));
  } else {
    setAttachedDocuments((prev) => prev.filter((_, index) => index !== docIndex));
  }
};

// Load documents when the component mounts
useEffect(() => {
  if (leadId) {
    loadDocuments();
  }
}, [leadId]);


  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      // If you want to pass attachedDocument to your server along with the note,
      // you’ll need to handle that in your backend. For example:
      //  - Convert it to base64
      //  - Or send it as a multipart/form-data

      const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newNote.trim(),
          // docName: attachedDocument?.name,
          // docUri: attachedDocument?.uri,
        }),
      });
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setNewNote('');
      setAttachedDocument(null); // reset after saving if that's what you want

      if (Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedLead.notes);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add note.');
    }
  };

  const handleEditNote = (noteId, currentText) => {
    setEditNoteId(noteId);
    setEditNoteText(currentText);
  };

  const handleSaveEditedNote = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${editNoteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editNoteText }),
        }
      );
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setEditNoteId(null);
      setEditNoteText('');
      if (Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update note.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      );
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      if (Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note.');
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    filterNotes(text, leadDetails.notes || []);
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

  const handleShareNote = async (note) => {
    try {
      await Share.share({
        message: note.text,
        title: 'Share Note',
      });
    } catch (error) {
      console.error('Error sharing note:', error);
      Alert.alert('Error', 'Failed to share the note.');
    }
  };

  if (!leadDetails) {
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
        title="Lead Details"
        onSearchChange={handleSearchChange}
        showBackButton={true}
        navigation={navigation}
        enableVoice={false}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lead Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              Ms. {leadDetails.firstName} {leadDetails.lastName}
            </Text>
            <Text style={{ color: '#007BFF', marginTop: 4 }}>{leadDetails.email}</Text>
            <Text style={{ marginTop: 4 }}>{leadDetails.phone}</Text>
            {!!leadDetails.company && (
              <Text style={{ marginTop: 4 }}>{leadDetails.company}</Text>
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

        {/* Add Note Section */}
<View style={{ borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 8 }}>
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

  {/* Buttons: Save Note */}
  <View style={{ flexDirection: 'row', marginTop: 8 }}>
    <TouchableOpacity
      onPress={handleAddNote}
      style={{
        backgroundColor: '#007BFF',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: '#fff' }}>Save Note</Text>
    </TouchableOpacity>
  </View>
</View>

<View style={{ padding: 16 }}>
      {/* Attach Document Section */}
      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Attach Document</Text>
      <TouchableOpacity
        onPress={handlePickDocument}
        style={{
          backgroundColor: '#007BFF',
          borderRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Attach Document</Text>
      </TouchableOpacity>

      {/* Display Attached Documents */}
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Attached Documents</Text>
        {[...attachedDocuments, ...tempAttachedDocuments].map((doc, index) => {
          const isTemporary = index >= attachedDocuments.length; // Identify temporary docs
          return (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: '#eee',
                borderRadius: 4,
                padding: 8,
                marginTop: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ flex: 1 }} numberOfLines={1} ellipsizeMode="middle">
                {doc.name} {isTemporary ? '(Unsaved)' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(doc.uri)}
                style={{
                  backgroundColor: '#007BFF',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#fff' }}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemoveDocument(index, isTemporary)}
                style={{
                  backgroundColor: 'red',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: '#fff' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Save Documents Button */}
      {tempAttachedDocuments.length > 0 && (
        <TouchableOpacity
          onPress={handleSaveDocuments}
          style={{
            backgroundColor: '#007BFF',
            borderRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginTop: 16,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>Save Documents</Text>
        </TouchableOpacity>
      )}
    </View>

        {/* Notes List */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Notes</Text>
          {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
            [...filteredNotes].reverse().map((note) => (
              <View
                key={note._id}
                style={{
                  borderWidth: 1,
                  borderColor: '#eee',
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
                          paddingHorizontal: 12,
                          paddingVertical: 6,
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
                          backgroundColor: '#ccc',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ color: '#000' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14 }}>{note.text}</Text>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
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
                      <TouchableOpacity
                    onPress={() => handleShareNote(note)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="share-outline" size={16} color="green" />
                    <Text style={{ color: 'green', marginRight: 20 }}>Share</Text>
                  </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: '#999' }}>No notes available.</Text>
          )}
        </View>

      </ScrollView>

      <View
  style={{
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    justifyContent: 'space-around',
    paddingVertical: 8,
  }}
>
  {/* <TouchableOpacity
    onPress={() => {
      Alert.alert('Email', 'Email functionality not implemented yet.');
    }}
  >
    <Ionicons name="mail-outline" size={24} color="#666" />
  </TouchableOpacity> */}
  <TouchableOpacity
    onPress={async () => {
      try {
        await Share.share({
          message: `Lead Details:\nName: ${leadDetails.firstName} ${leadDetails.lastName}\nEmail: ${leadDetails.email}\nPhone: ${leadDetails.phone}`,
          title: 'Share Lead Details',
        });
      } catch (error) {
        console.error('Error sharing lead details:', error);
        Alert.alert('Error', 'Failed to share the lead details.');
      }
    }}
  >
    <Ionicons name="share-outline" size={24} color="#666" />
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => {
      if (leadDetails.phone) {
        Linking.openURL(`tel:${leadDetails.phone}`);
      } else {
        Alert.alert('Error', 'Phone number is not available.');
      }
    }}
  >
    <Ionicons name="call-outline" size={24} color="#666" />
  </TouchableOpacity>
</View>

    </View>
  );
};

export default LeadDetailsScreen;




//i updated the code as ypu said but here is the problem when i click on atch doc it opens my phonesstorage where i can select any pdf, once i select a pdf it redirects me to this page but the selected doc should appear on the add a note section and then i should be able to save it