import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/constant";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader"; // <-- Custom Header
import Voice from "@react-native-voice/voice"; // <-- Import Speech Recognition

const LeadDetailsScreen = ({ route, navigation }) => {
  // Extract lead and ID
  const lead = route.params?.lead;
  const leadId = lead?._id;

  // Local state
  const [leadDetails, setLeadDetails] = useState(lead || null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // ----------------------------------------
  // 🔹 FETCH LEAD DETAILS FROM SERVER
  // ----------------------------------------
  const fetchLeadDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch lead details");
      }
      const data = await response.json();
      setLeadDetails(data);
      if (data.notes && Array.isArray(data.notes)) {
        setFilteredNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails(leadId);
    }
  }, [leadId]);

  // ----------------------------------------
  // 🔹 AUDIO PERMISSION REQUEST
  // ----------------------------------------
  const requestAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Speech Recognition Permission",
          message: "This app needs access to your microphone for speech recognition.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // ----------------------------------------
  // 🔹 SPEECH RECOGNITION HANDLERS
  // ----------------------------------------
  const onSpeechResults = (event) => {
    if (event.value && event.value.length > 0) {
      setNewNote(event.value[0]); // Set recognized text in input field
    }
  };

  const onSpeechError = (event) => {
    Alert.alert("Speech Error", event.error.message || "An error occurred");
    setIsRecording(false);
  };

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    const permissionGranted = await requestAudioPermission();
    if (!permissionGranted) {
      Alert.alert("Permission Denied", "Microphone access is required for speech recognition.");
      return;
    }

    try {
      setIsRecording(true);
      await Voice.start("en-US");
    } catch (error) {
      console.error("startRecording error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error("stopRecording error:", error);
      setIsRecording(false);
    }
  };

  // ----------------------------------------
  // 🔹 NOTE HANDLING FUNCTIONS
  // ----------------------------------------
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) {
        throw new Error("Failed to add note");
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setNewNote("");
      setFilteredNotes(updatedLead.notes);
    } catch (error) {
      Alert.alert("Error", "Failed to add note.");
      console.error(error);
    }
  };

  // ----------------------------------------
  // 🔹 SEARCH NOTES FUNCTIONALITY
  // ----------------------------------------
  const handleSearchChange = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredNotes(leadDetails.notes || []);
      return;
    }
    const lowerText = text.toLowerCase();
    const matched = leadDetails.notes.filter((note) =>
      note.text?.toLowerCase().includes(lowerText)
    );
    setFilteredNotes(matched);
  };

  // ----------------------------------------
  // 🔹 UI RENDERING
  // ----------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Custom Header */}
      <CustomHeader
        navigation={navigation}
        title="Lead Details"
        onSearchChange={handleSearchChange}
        showBackButton={true}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 🔹 Lead Information */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {leadDetails.firstName} {leadDetails.lastName}
            </Text>
            <Text style={{ color: "#007BFF", marginTop: 4 }}>{leadDetails.email}</Text>
            <Text style={{ marginTop: 4 }}>{leadDetails.phone}</Text>
          </View>
          <Image source={{ uri: "https://via.placeholder.com/60" }} style={{ width: 60, height: 60, borderRadius: 30 }} />
        </View>

        {/* 🔹 Add New Note Section */}
        <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 8 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Add a New Note</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, minHeight: 60, flex: 1 }}
              placeholder="Type or speak your note here..."
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
            {/* 🎤 Microphone Button */}
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={{ marginLeft: 10, backgroundColor: isRecording ? "#FF0000" : "#007BFF", padding: 10, borderRadius: 50 }}
            >
              <Ionicons name={isRecording ? "mic-off" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleAddNote} style={{ backgroundColor: "#007BFF", borderRadius: 4, padding: 10, marginTop: 8 }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LeadDetailsScreen;
