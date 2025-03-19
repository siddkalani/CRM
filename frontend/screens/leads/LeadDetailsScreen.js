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
import { BASE_URL } from "../../constants/constant";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader"; // <-- import your custom header

const LeadDetailsScreen = ({ route, navigation }) => {
  // Extract lead and its id
  const lead = route.params?.lead;
  const leadId = lead?._id;

  // Local state
  const [leadDetails, setLeadDetails] = useState(lead || null);

  // ----> NEW: For Searching Notes
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Fetch lead details from the server
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
      // Update filteredNotes as soon as we fetch new data
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

  // Optional polling in focus effect
  useFocusEffect(
    useCallback(() => {
      let intervalId;
      if (leadId) {
        // e.g. intervalId = setInterval(() => fetchLeadDetails(leadId), 30000);
      }
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [leadId])
  );

  // ---------------
  // NOTE HANDLERS
  // ---------------
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

      // Reset newNote and re-filter
      setNewNote("");
      if (updatedLead.notes && Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        // Also re-apply search filter if needed
        if (searchText.trim()) {
          filterNotes(searchText, updatedLead.notes);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add note.");
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
        `${BASE_URL}/api/lead/one/${leadId}/notes/${editNoteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editNoteText }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update note");
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);

      // Reset editing
      setEditNoteId(null);
      setEditNoteText("");

      // Also re-filter if needed
      if (updatedLead.notes && Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedLead.notes);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update note.");
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);

      // Re-filter if needed
      if (updatedLead.notes && Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedLead.notes);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete note.");
      console.error(error);
    }
  };

  // ---------------
  // SEARCH HANDLER
  // ---------------
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterNotes(text, leadDetails.notes || []);
  };

  const filterNotes = (searchValue, notesArray) => {
    if (!searchValue.trim()) {
      // If search is empty, show all notes
      setFilteredNotes(notesArray);
      return;
    }
    const lowerText = searchValue.toLowerCase();
    const matched = notesArray.filter((note) =>
      note.text?.toLowerCase().includes(lowerText)
    );
    setFilteredNotes(matched);
  };

  // Render loading state if lead details are not yet available
  if (!leadDetails) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading lead details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 1) Custom Header with search input */}
      <CustomHeader
        navigation={navigation} // <-- Ensure you pass navigation
        title="Lead Details"
        onSearchChange={handleSearchChange}
        showBackButton={true}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Lead Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              Ms. {leadDetails.firstName} {leadDetails.lastName}
            </Text>
            <Text style={{ color: "#007BFF", marginTop: 4 }}>
              {leadDetails.email}
            </Text>
            <Text style={{ marginTop: 4 }}>{leadDetails.phone}</Text>
            {!!leadDetails.company && (
              <Text style={{ marginTop: 4 }}>{leadDetails.company}</Text>
            )}
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#007BFF",
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginTop: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#007BFF" }}>+ Tag</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: "https://via.placeholder.com/60" }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
        </View>

        {/* Add New Note */}
        <View
          style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            paddingTop: 8,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            Add a New Note
          </Text>
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
              placeholder="Type your new note here..."
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
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

        {/* Filtered Notes */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Notes</Text>
          {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <View
                key={note._id}
                style={{
                  borderWidth: 1,
                  borderColor: "#eee",
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
                        borderColor: "#ccc",
                        borderRadius: 4,
                        padding: 8,
                        minHeight: 40,
                        textAlignVertical: "top",
                      }}
                      multiline
                      value={editNoteText}
                      onChangeText={setEditNoteText}
                    />
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={handleSaveEditedNote}
                        style={{
                          backgroundColor: "green",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditNoteId(null);
                          setEditNoteText("");
                        }}
                        style={{
                          backgroundColor: "#ccc",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ color: "#000" }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14 }}>{note.text}</Text>
                    <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {new Date(note.createdAt).toLocaleString()}
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleEditNote(note._id, note.text)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color="blue"
                        />
                        <Text style={{ color: "blue", marginLeft: 4 }}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note._id)}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="trash-outline" size={16} color="red" />
                        <Text style={{ color: "red", marginLeft: 4 }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 8, color: "#999" }}>
              No notes available.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation / Actions */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
          justifyContent: "space-around",
          paddingVertical: 8,
        }}
      >
        <Ionicons name="mail-outline" size={24} color="#666" />
        <Ionicons name="share-outline" size={24} color="#666" />
        <Ionicons name="call-outline" size={24} color="#666" />
      </View>
    </View>
  );
};

export default LeadDetailsScreen;
