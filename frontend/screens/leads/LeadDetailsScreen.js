import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice"; // Import Voice for speech recognition
import { BASE_URL } from "../../constants/constant";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";

const LeadDetailsScreen = ({ route, navigation }) => {
  // Extract lead and its id
  const lead = route.params?.lead;
  const leadId = lead?._id;

  // Local state
  const [leadDetails, setLeadDetails] = useState(lead || null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);

  // Fetch lead details from the server
  const fetchLeadDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error("Failed to fetch lead details");
      const data = await response.json();
      setLeadDetails(data);
      if (data.notes && Array.isArray(data.notes)) setFilteredNotes(data.notes);
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    if (leadId) fetchLeadDetails(leadId);
  }, [leadId]);

  // Set up Voice Recognition Listeners
  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechResults = (event) => {
      if (event.value) setNewNote(event.value[0]); // Set recognized text in input
    };
    Voice.onSpeechError = (event) => {
      console.error("Speech Error: ", event);
      setIsRecording(false);
      Alert.alert("Error", "Speech recognition failed, please try again.");
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Start Recording
  const startRecording = async () => {
    try {
      setIsRecording(true);
      await Voice.start("en-US"); // Set language to English (US)
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  };

  // Note Handlers
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) throw new Error("Failed to add note");
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setNewNote("");
      if (updatedLead.notes && Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add note.");
      console.error(error);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    filterNotes(text, leadDetails.notes || []);
  };

  const filterNotes = (searchValue, notesArray) => {
    if (!searchValue.trim()) return setFilteredNotes(notesArray);
    const lowerText = searchValue.toLowerCase();
    setFilteredNotes(
      notesArray.filter((note) => note.text?.toLowerCase().includes(lowerText))
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader
        navigation={navigation}
        title="Lead Details"
        onSearchChange={handleSearchChange}
        showBackButton={true}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lead Info */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              Ms. {leadDetails.firstName} {leadDetails.lastName}
            </Text>
            <Text style={{ color: "#007BFF", marginTop: 4 }}>{leadDetails.email}</Text>
            <Text style={{ marginTop: 4 }}>{leadDetails.phone}</Text>
            {!!leadDetails.company && <Text style={{ marginTop: 4 }}>{leadDetails.company}</Text>}
          </View>
          <Image source={{ uri: "https://via.placeholder.com/60" }} style={{ width: 60, height: 60, borderRadius: 30 }} />
        </View>

        {/* Add New Note with Speech-to-Text */}
        <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 8 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Add a New Note</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 4,
                padding: 8,
                minHeight: 60,
                flex: 1,
                textAlignVertical: "top",
              }}
              placeholder="Type or speak your note..."
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
            {/* Voice Button */}
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={{
                marginLeft: 10,
                padding: 10,
                borderRadius: 50,
                backgroundColor: isRecording ? "#FF4136" : "#007BFF",
              }}
            >
              <Ionicons name={isRecording ? "mic-off" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleAddNote}
            style={{
              backgroundColor: "#007BFF",
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff" }}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LeadDetailsScreen;
