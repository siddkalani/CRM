import React, { useState, useEffect } from "react";
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
  Platform,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import SkeletonLoader from "../../components/SkeletonLoader";
import { BASE_URL } from "../../constants/constant";
import CustomHeader from "../../components/CustomHeader";
import { useVoice } from "../../context/VoiceContext";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LeadDetailsScreen = ({ route, navigation }) => {
  const lead = route.params?.lead;
  const leadId = lead?._id;

  const [leadDetails, setLeadDetails] = useState(lead || null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  
  // Store multiple attachments
  const [attachedDocuments, setAttachedDocuments] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // For editing the lead's own details (name, phone, etc.)
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  // Voice from context
  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording,
  } = useVoice();

  // Append recognized text (if using speech-to-text) to newNote
  useEffect(() => {
    if (recognizedText) {
      setNewNote((prev) => (prev ? `${prev} ${recognizedText}` : recognizedText));
      setRecognizedText("");
    }
  }, [recognizedText]);

  // Fetch lead details on mount or lead change
  useEffect(() => {
    if (leadId) {
      fetchLeadDetails(leadId);
    }
  }, [leadId]);

  const fetchLeadDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lead/one/${id}`);
      const data = await response.json();
      setLeadDetails(data);
      if (Array.isArray(data.notes)) setFilteredNotes(data.notes);
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  // =======================
  // EDIT LEAD DETAILS LOGIC
  // =======================
  const handleEditLeadDetails = () => {
    if (!leadDetails) return;
    // Copy existing details to an "edit" object
    setEditedDetails({
      firstName: leadDetails.firstName || "",
      lastName: leadDetails.lastName || "",
      email: leadDetails.email || "",
      phone: leadDetails.phone || "",
      company: leadDetails.company || "",
    });
    setIsEditing(true);
  };

  const saveLeadDetails = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead details");
      }

      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setIsEditing(false);

      Alert.alert("Success", "Lead details updated successfully");
    } catch (error) {
      console.error("Error updating lead details:", error);
      Alert.alert("Error", "Failed to update lead details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing & revert
  const cancelEditingLead = () => {
    setIsEditing(false);
    setEditedDetails({});
  };

  // =======================
  // NOTE-RELATED LOGIC
  // =======================
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true, // allow multiple file selection
      });

      console.log("🎯 PICKED DOCUMENT RESULT:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets?.length) {
        const newlyPicked = result.assets.map((doc) => ({
          uri: Platform.OS === "ios" ? doc.uri.replace("file://", "") : doc.uri,
          name: doc.name || doc.uri.split("/").pop() || "document.pdf",
          type: doc.mimeType || "application/octet-stream",
          size: doc.size,
        }));
        setAttachedDocuments((prev) => [...prev, ...newlyPicked]);
      }
    } catch (error) {
      console.warn("Document picking failed:", error);
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  const handleAddNote = async () => {
    if (isSubmitting) return;
    if (!newNote.trim() && attachedDocuments.length === 0) {
      console.log("No note text or attachment provided");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (newNote.trim()) {
        formData.append("text", newNote.trim());
      }
      attachedDocuments.forEach((doc) => {
        const fileObject = {
          uri: doc.uri,
          type: doc.type,
          name: doc.name,
        };
        formData.append("files", fileObject);
      });

      const endpoint = `${BASE_URL}/api/lead/one/${leadId}/notes`;
      console.log("📡 Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();
      console.log(`📥 Response status: ${response.status}`);
      console.log("📥 Response body:", responseText);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn("Response was not valid JSON:", responseText);
        throw new Error("Invalid response from server");
      }

      // Clear note input & attachments
      setNewNote("");
      setAttachedDocuments([]);

      // Update lead details & notes
      setLeadDetails(responseData.lead || responseData);
      if (Array.isArray(responseData.lead?.notes || responseData.notes)) {
        const notes = responseData.lead?.notes || responseData.notes;
        setFilteredNotes(notes);
        if (searchText.trim()) {
          filterNotes(searchText, notes);
        }
      }

      Alert.alert("Success", "Note added successfully!");
    } catch (error) {
      console.error("❌ Error adding note:", error);
      Alert.alert("Error", "Failed to add note: " + error.message);
    } finally {
      setIsSubmitting(false);
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
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      setEditNoteId(null);
      setEditNoteText("");
      if (Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update note.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/lead/one/${leadId}/notes/${noteId}`,
        { method: "DELETE" }
      );
      const updatedLead = await response.json();
      setLeadDetails(updatedLead);
      if (Array.isArray(updatedLead.notes)) {
        setFilteredNotes(updatedLead.notes);
        if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete note.");
    }
  };

  // =======================
  // UTILITY FUNCTIONS
  // =======================
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
      const formattedDate = new Date(note.createdAt).toLocaleString();

      let shareMessage = `Lead Details:\n`;
      shareMessage += `Name: ${leadDetails.firstName} ${leadDetails.lastName}\n`;
      shareMessage += `Email: ${leadDetails.email}\n`;
      shareMessage += `Phone: ${leadDetails.phone}\n\n`;

      shareMessage += `Note Details:\n`;
      shareMessage += `Date: ${formattedDate}\n`;
      shareMessage += `Note: ${note.text || "No text"}\n\n`;

      if (Array.isArray(note.files) && note.files.length > 0) {
        shareMessage += `Attachments:\n`;
        note.files.forEach((f, i) => {
          shareMessage += `File #${i + 1} - Name: ${
            f.fileName || "Unnamed Document"
          }\nURL: ${f.fileUrl}\n\n`;
        });
      }

      await Share.share({
        message: shareMessage,
        title: `Note for ${leadDetails.firstName} ${leadDetails.lastName}`,
      });
    } catch (error) {
      console.error("Error sharing note:", error);
      Alert.alert("Error", "Failed to share the note.");
    }
  };

  // =======================
  // RENDER
  // =======================
  if (!leadDetails) {
    return (
      <View className="flex-1 p-4 bg-white">
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
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <CustomHeader
          title="Lead Details"
          onSearchChange={handleSearchChange}
          showBackButton={true}
          navigation={navigation}
          enableVoice={false}
        />

        <ScrollView className="flex-1">
          <View className="p-4">
            {/* LEAD INFO CARD */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4 shadow-sm">
              {isEditing ? (
                /* If we are editing, show text inputs for each field */
                <View>
                  <Text className="font-bold text-gray-800 mb-2">Edit Lead</Text>

                  <View className="mb-3">
                    <Text className="mb-1 font-medium text-gray-700">First Name</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                      value={editedDetails.firstName}
                      onChangeText={(val) =>
                        setEditedDetails((prev) => ({ ...prev, firstName: val }))
                      }
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="mb-1 font-medium text-gray-700">Last Name</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                      value={editedDetails.lastName}
                      onChangeText={(val) =>
                        setEditedDetails((prev) => ({ ...prev, lastName: val }))
                      }
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="mb-1 font-medium text-gray-700">Email</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                      value={editedDetails.email}
                      onChangeText={(val) =>
                        setEditedDetails((prev) => ({ ...prev, email: val }))
                      }
                      keyboardType="email-address"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="mb-1 font-medium text-gray-700">Phone</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                      value={editedDetails.phone}
                      onChangeText={(val) =>
                        setEditedDetails((prev) => ({ ...prev, phone: val }))
                      }
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="mb-1 font-medium text-gray-700">Company</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                      value={editedDetails.company}
                      onChangeText={(val) =>
                        setEditedDetails((prev) => ({ ...prev, company: val }))
                      }
                    />
                  </View>

                  {/* Buttons to save or cancel */}
                  <View className="flex-row mt-4">
                    <TouchableOpacity
                      onPress={saveLeadDetails}
                      disabled={isSubmitting}
                      className="bg-green-500 rounded-lg py-2 px-4 mr-2"
                    >
                      {isSubmitting ? (
                        <Text className="text-white">Saving...</Text>
                      ) : (
                        <Text className="text-white">Save</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelEditingLead}
                      className="bg-gray-300 rounded-lg py-2 px-4"
                    >
                      <Text className="text-gray-700">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* If NOT editing, show the lead details */
                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      {leadDetails.firstName} {leadDetails.lastName}
                    </Text>
                    {/* Button to edit lead */}
                    <TouchableOpacity
                      onPress={handleEditLeadDetails}
                      className="p-2"
                      style={{ alignSelf: "center" }}
                    >
                      <Ionicons name="create-outline" size={20} color="#4B5563" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-blue-600">{leadDetails.email}</Text>
                  <Text className="text-gray-600 mt-1">{leadDetails.phone}</Text>
                  {!!leadDetails.company && (
                    <Text className="text-gray-600 mt-1">{leadDetails.company}</Text>
                  )}
                  <View className="flex-row mt-3">
                    <TouchableOpacity className="bg-white border border-gray-300 px-3 py-1 rounded-full">
                      <Text className="text-gray-600 text-sm">Status: Lead</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* QUICK ACTIONS */}
            {!isEditing && (
              <View className="flex-row justify-between mb-6">
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg py-2 px-4 flex-row items-center"
                  onPress={() => {
                    if (leadDetails.phone) {
                      Linking.openURL(`tel:${leadDetails.phone}`);
                    } else {
                      Alert.alert("Error", "Phone number is not available.");
                    }
                  }}
                >
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text className="text-white ml-2">Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-500 rounded-lg py-2 px-4 flex-row items-center"
                  onPress={() => {
                    if (leadDetails.email) {
                      Linking.openURL(`mailto:${leadDetails.email}`);
                    } else {
                      Alert.alert("Error", "Email is not available.");
                    }
                  }}
                >
                  <Ionicons name="mail-outline" size={18} color="#fff" />
                  <Text className="text-white ml-2">Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-purple-500 rounded-lg py-2 px-4 flex-row items-center"
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `Lead Details:\nName: ${leadDetails.firstName} ${leadDetails.lastName}\nEmail: ${leadDetails.email}\nPhone: ${leadDetails.phone}`,
                        title: "Share Lead Details",
                      });
                    } catch (error) {
                      Alert.alert("Error", "Failed to share the lead details.");
                    }
                  }}
                >
                  <Ionicons name="share-social-outline" size={18} color="#fff" />
                  <Text className="text-white ml-2">Share</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ADD NOTE SECTION (only if not in the middle of editing lead details) */}
            {!isEditing && (
              <View className="bg-blue-50 rounded-xl p-4 mb-6 shadow-sm">
                <Text className="font-bold text-gray-800 mb-2">Add Notes</Text>
                <View className="relative mb-3">
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-4 pr-14 text-gray-800 min-h-[64px]"
                    placeholder="Start typing here..."
                    multiline
                    value={newNote}
                    onChangeText={setNewNote}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                    className={`absolute right-3 bottom-3 p-3 rounded-full ${
                      isRecording ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    <Ionicons
                      name={isRecording ? "mic-off" : "mic"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                {/* MULTIPLE FILE ATTACHMENTS */}
                <View className="mt-3">
                  {attachedDocuments.length > 0 && (
                    <View className="bg-blue-50 rounded-lg mb-4 p-3">
                      {attachedDocuments.map((doc, index) => (
                        <View
                          key={index}
                          className="flex-row items-center justify-between mb-2"
                        >
                          <Ionicons name="document-attach" size={18} color="#3B82F6" />
                          <Text className="text-blue-600 ml-2 flex-1 truncate">
                            {doc.name || "Unnamed Document"}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setAttachedDocuments((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={handleAddNote}
                      disabled={isSubmitting}
                      className="bg-blue-500 rounded-lg py-2 px-4 flex-1 mr-2"
                    >
                      {isSubmitting ? (
                        <Text className="text-white text-center font-medium">
                          Saving...
                        </Text>
                      ) : (
                        <Text className="text-white text-center font-medium">
                          Save Note
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlePickDocument}
                      className="bg-gray-700 rounded-lg py-2 px-4 flex-row justify-center items-center"
                    >
                      <Ionicons name="attach" size={18} color="#fff" />
                      <Text className="text-white ml-2">Attach</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* NOTES LIST */}
            {!isEditing && (
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold text-gray-800">Notes</Text>
                  <Text className="text-gray-500 text-sm">
                    {filteredNotes.length} notes
                  </Text>
                </View>

                {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
                  [...filteredNotes].reverse().map((note) => (
                    <Swipeable
                      key={note._id}
                      friction={2}
                      overshootRight={false}
                      rightThreshold={40}
                      containerStyle={{
                        borderRadius: 8,
                        marginBottom: 8,
                        overflow: "hidden",
                      }}
                      renderRightActions={() => (
                        <TouchableOpacity
                          style={{
                            width: 64,
                            backgroundColor: "#EF4444",
                            justifyContent: "center",
                            alignItems: "center",
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                          }}
                          onPress={() => handleDeleteNote(note._id)}
                        >
                          <Ionicons name="trash-outline" size={24} color="#fff" />
                          <Text
                            style={{ color: "#fff", fontSize: 12, marginTop: 4 }}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      )}
                    >
                      <View
                        className="bg-white border border-gray-200 p-4"
                        style={{ borderRadius: 8 }}
                      >
                        {/* EDITING THIS SPECIFIC NOTE? */}
                        {editNoteId === note._id ? (
                          <>
                            <TextInput
                              className="bg-gray-50 border border-gray-300 rounded-md p-3 min-h-16 text-gray-800"
                              multiline
                              value={editNoteText}
                              onChangeText={setEditNoteText}
                            />
                            <View className="flex-row mt-3">
                              <TouchableOpacity
                                onPress={handleSaveEditedNote}
                                className="bg-green-500 py-2 px-4 rounded-md mr-2"
                              >
                                <Text className="text-white font-medium">Save</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  setEditNoteId(null);
                                  setEditNoteText("");
                                }}
                                className="bg-gray-300 py-2 px-4 rounded-md"
                              >
                                <Text className="text-gray-700 font-medium">Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          <>
                            {/* Note text */}
                            {note.text && (
                              <Text className="text-gray-800 leading-relaxed">
                              {"\u2022"}{" "}{note.text}
                           </Text>
                           
                            )}

                            {/* Files array */}
                            {Array.isArray(note.files) &&
                              note.files.map((f, idx) => (
                                <View className="mt-2" key={idx}>
                                  <TouchableOpacity
                                    className="flex-row items-center bg-blue-50 p-2 rounded-md"
                                    onPress={() => Linking.openURL(f.fileUrl)}
                                  >
                                    <Ionicons
                                      name={
                                        f.fileType?.startsWith("image/")
                                          ? "image-outline"
                                          : "document-outline"
                                      }
                                      size={18}
                                      color="#3B82F6"
                                    />
                                    <Text className="text-blue-600 ml-2 flex-1 truncate">
                                      {f.fileName || "Attached File"}
                                    </Text>
                                  </TouchableOpacity>

                                  {f.fileType?.startsWith("image/") && (
                                    <Image
                                      source={{ uri: f.fileUrl }}
                                      className="w-24 h-24 mt-2 rounded-md bg-gray-200"
                                      resizeMode="cover"
                                    />
                                  )}
                                </View>
                              ))}

                            {/* Date */}
                            <Text className="text-gray-500 text-xs mt-2">
                              {new Date(note.createdAt).toLocaleString()}
                            </Text>

                            {/* Action row */}
                            <View className="flex-row mt-3 pt-2 border-t border-gray-100">
                              <TouchableOpacity
                                onPress={() => handleEditNote(note._id, note.text)}
                                className="flex-row items-center mr-4"
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={16}
                                  color="#3B82F6"
                                />
                                <Text className="text-blue-500 ml-1 text-sm">Edit</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleShareNote(note)}
                                className="flex-row items-center"
                              >
                                <Ionicons
                                  name="share-outline"
                                  size={16}
                                  color="#10B981"
                                />
                                <Text className="text-green-500 ml-1 text-sm">
                                  Share
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        )}
                      </View>
                    </Swipeable>
                  ))
                ) : (
                  <View className="bg-gray-50 p-8 rounded-md items-center justify-center">
                    <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-2 text-center">
                      No notes available. Add your first note above.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

export default LeadDetailsScreen;
