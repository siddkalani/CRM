import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Share,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SkeletonLoader from "../../components/SkeletonLoader";
import { BASE_URL } from "../../constants/constant";
import CustomHeader from "../../components/CustomHeader";
import { useVoice } from "../../context/VoiceContext";
import * as DocumentPicker from "expo-document-picker";
import { GestureHandlerRootView, PanGestureHandler, Swipeable } from "react-native-gesture-handler";

const ContactDetailsScreen = ({ route, navigation }) => {
  // Expecting `contact` from route params
  const contact = route.params?.contact;
  const contactId = contact?._id;

  const [contactDetails, setContactDetails] = useState(contact || null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [attachedDocument, setAttachedDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice context
  const { isRecording, recognizedText, setRecognizedText, startRecording, stopRecording } = useVoice();

  // Append recognized text to newNote
  useEffect(() => {
    if (recognizedText) {
      setNewNote((prev) => (prev ? `${prev} ${recognizedText}` : recognizedText));
      setRecognizedText("");
    }
  }, [recognizedText]);

  // Fetch contact details on mount
  useEffect(() => {
    if (contactId) fetchContactDetails(contactId);
  }, [contactId]);

  const fetchContactDetails = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/contacts/one/${id}`);
      const data = await response.json();
      setContactDetails(data);
      if (Array.isArray(data.notes)) {
        setFilteredNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
    }
  };

  // Document Picker handler
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log("🎯 PICKED DOCUMENT RESULT:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets?.length) {
        const doc = result.assets[0];
        const fileInfo = {
          uri: Platform.OS === "ios" ? doc.uri.replace("file://", "") : doc.uri,
          name: doc.name || doc.uri.split("/").pop() || "document.pdf",
          type: doc.mimeType || getMimeType(doc.uri) || "application/octet-stream",
          size: doc.size,
        };

        console.log("📄 Formatted document info:", JSON.stringify(fileInfo, null, 2));
        setAttachedDocument(fileInfo);
      }
    } catch (error) {
      console.warn("Document picking failed:", error);
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  // Helper to guess MIME type from file extension
  const getMimeType = (uri) => {
    const extension = uri.split(".").pop()?.toLowerCase();
    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    return mimeTypes[extension] || "application/octet-stream";
  };

  // handleAddNote using FormData
  const handleAddNote = async () => {
    if (isSubmitting) return;
    if (!newNote.trim() && !attachedDocument) {
      console.log("No note text or attachment provided");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (newNote.trim()) {
        formData.append("text", newNote.trim());
      }
      if (attachedDocument) {
        const fileObject = {
          uri: attachedDocument.uri,
          type: attachedDocument.type,
          name: attachedDocument.name,
        };
        console.log("📤 Attaching document to FormData:", JSON.stringify(fileObject, null, 2));
        formData.append("file", fileObject);
      }

      const endpoint = `${BASE_URL}/api/contacts/one/${contactId}/notes`;
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

      setContactDetails(responseData.contact || responseData);
      setNewNote("");
      setAttachedDocument(null);

      if (Array.isArray(responseData.contact?.notes || responseData.notes)) {
        const notes = responseData.contact?.notes || responseData.notes;
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

  // Edit note
  const handleEditNote = (noteId, currentText) => {
    setEditNoteId(noteId);
    setEditNoteText(currentText);
  };

  const handleSaveEditedNote = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${editNoteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editNoteText }),
        }
      );

      if (!response.ok) throw new Error("Failed to update note");

      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      setEditNoteId(null);
      setEditNoteText("");

      if (Array.isArray(updatedContact.notes)) {
        setFilteredNotes(updatedContact.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedContact.notes);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update note.");
    }
  };

  // We want to wrap each note in a <Swipeable> and remove the inline delete.

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete note");

      const updatedContact = await response.json();
      setContactDetails(updatedContact);

      if (Array.isArray(updatedContact.notes)) {
        setFilteredNotes(updatedContact.notes);
        if (searchText.trim()) {
          filterNotes(searchText, updatedContact.notes);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete note.");
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

  const handleShareNote = async (note) => {
    try {
      await Share.share({
        message: note.text,
        title: "Share Note",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the note.");
    }
  };

  if (!contactDetails) {
    return (
      <GestureHandlerRootView className='flex-1'>
      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="40%" height={16} />
        <SkeletonLoader width="50%" height={16} />
        <SkeletonLoader width="100%" height={60} borderRadius={8} />
        <SkeletonLoader width="30%" height={40} />
        <SkeletonLoader width="100%" height={100} borderRadius={8} />
        <SkeletonLoader width="100%" height={100} borderRadius={8} />
      </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView className='flex-1'>
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader
        navigation={navigation}
        title="Contact Details"
        showBackButton
        onSearchChange={handleSearchChange}
        enableVoice={false}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Contact Info Card */}
        <View style={{
          backgroundColor: "#E0F2FE",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Left: Contact Details */}
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#0F172A" }}>
                {contactDetails.firstName} {contactDetails.lastName}
              </Text>
              <Text style={{ color: "#0284C7", marginTop: 4 }}>
                {contactDetails.email}
              </Text>
              {contactDetails.phone && (
                <Text style={{ marginTop: 4, color: "#475569" }}>
                  {contactDetails.phone}
                </Text>
              )}
              {contactDetails.company && (
                <Text style={{ marginTop: 4, color: "#475569" }}>
                  {contactDetails.company}
                </Text>
              )}

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TouchableOpacity style={{
                  backgroundColor: "#FFF",
                  borderWidth: 1,
                  borderColor: "#CCC",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: "#475569", fontSize: 12 }}>
                    Status: Contact
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right: Initials Avatar */}
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#BAE6FD",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{ color: "#0284C7", fontSize: 20, fontWeight: "700" }}>
                {`${contactDetails.firstName?.[0] || ""}${contactDetails.lastName?.[0] || ""}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          {/* Call Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              if (contactDetails.phone) {
                Linking.openURL(`tel:${contactDetails.phone}`);
              } else {
                Alert.alert("Error", "Phone number is not available.");
              }
            }}
          >
            <Ionicons name="call-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>Call</Text>
          </TouchableOpacity>

          {/* Email Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#10B981",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              if (contactDetails.email) {
                Linking.openURL(`mailto:${contactDetails.email}`);
              } else {
                Alert.alert("Error", "Email is not available.");
              }
            }}
          >
            <Ionicons name="mail-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>Email</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={async () => {
              try {
                await Share.share({
                  message: `Contact Details:\nName: ${contactDetails.firstName} ${contactDetails.lastName}\nEmail: ${contactDetails.email}\nPhone: ${contactDetails.phone}`,
                  title: "Share Contact Details",
                });
              } catch (error) {
                Alert.alert("Error", "Failed to share the contact details.");
              }
            }}
          >
            <Ionicons name="share-social-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Add Note Section */}
        <View style={{
          backgroundColor: "#E0F2FE",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }}>
          <Text style={{ fontWeight: "600", fontSize: 16, color: "#0F172A", marginBottom: 8 }}>
            Add a Note
          </Text>

          {/* Note Input + Mic */}
          <View style={{ position: "relative", marginBottom: 12 }}>
            <TextInput
              style={{
                backgroundColor: "#fff",
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                minHeight: 60,
                paddingHorizontal: 16,
                paddingRight: 48,
                paddingVertical: 8,
                color: "#0F172A",
              }}
              multiline
              placeholder="Start typing here..."
              placeholderTextColor="#9CA3AF"
              value={newNote}
              onChangeText={setNewNote}
            />
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={{
                position: "absolute",
                right: 8,
                bottom: 8,
                padding: 10,
                borderRadius: 20,
                backgroundColor: isRecording ? "red" : "#3B82F6",
              }}
            >
              <Ionicons
                name={isRecording ? "mic-off" : "mic"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Document Attachment & Buttons */}
          <View style={{ marginBottom: 8 }}>
            {attachedDocument && (
              <View style={{
                backgroundColor: "#FEF9C3",
                padding: 8,
                borderRadius: 8,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Ionicons name="document-attach" size={18} color="#CA8A04" />
                <Text style={{ marginLeft: 8, flex: 1, color: "#CA8A04" }}>
                  {attachedDocument.name || "Unnamed Document"}
                </Text>
                <TouchableOpacity onPress={() => setAttachedDocument(null)}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={handleAddNote}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#3B82F6",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {isSubmitting ? (
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Saving...
                  </Text>
                ) : (
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Save Note
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickDocument}
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="attach" size={18} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 6 }}>Attach</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes List with SWIPE-TO-DELETE */}
        <View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#0F172A" }}>
              Notes
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {filteredNotes.length} notes
            </Text>
          </View>

          {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
            [...filteredNotes].reverse().map((note) => (
              // 2) Wrap each note in a Swipeable
              <Swipeable
                key={note._id}
                friction={2}
                overshootRight={false}
                rightThreshold={40}
                containerStyle={{
                  borderRadius: 8,
                  marginBottom: 12,
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
                    <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderColor: "#E5E7EB",
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  {editNoteId === note._id ? (
                    <>
                      <TextInput
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderWidth: 1,
                          borderColor: "#D1D5DB",
                          borderRadius: 6,
                          padding: 8,
                          minHeight: 60,
                          color: "#111827",
                        }}
                        multiline
                        value={editNoteText}
                        onChangeText={setEditNoteText}
                      />
                      <View style={{ flexDirection: "row", marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={handleSaveEditedNote}
                          style={{
                            backgroundColor: "#10B981",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Save
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setEditNoteId(null);
                            setEditNoteText("");
                          }}
                          style={{
                            backgroundColor: "#9CA3AF",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      {note.text && (
                        <Text style={{ color: "#111827", marginBottom: 4 }}>
                          {note.text}
                        </Text>
                      )}
                      {note.fileUrl && (
                        <View style={{ marginVertical: 4 }}>
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: "#EFF6FF",
                              padding: 8,
                              borderRadius: 6,
                            }}
                            onPress={() => Linking.openURL(note.fileUrl)}
                          >
                            <Ionicons
                              name={
                                note.fileType?.startsWith("image/")
                                  ? "image-outline"
                                  : "document-outline"
                              }
                              size={18}
                              color="#3B82F6"
                            />
                            <Text style={{ color: "#3B82F6", marginLeft: 8, flex: 1, fontSize: 13 }}>
                              {note.fileName || "Attached File"}
                            </Text>
                          </TouchableOpacity>
                          {note.fileType?.startsWith("image/") && (
                            <Image
                              source={{ uri: note.fileUrl }}
                              style={{
                                width: 96,
                                height: 96,
                                marginTop: 4,
                                borderRadius: 6,
                                backgroundColor: "#E5E7EB",
                              }}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      )}
                      <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: "#F3F4F6",
                        }}
                      >
                        {/* Only Edit & Share now (Delete is on swipe) */}
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
                            color="#3B82F6"
                          />
                          <Text style={{ color: "#3B82F6", marginLeft: 4, fontSize: 13 }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleShareNote(note)}
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="share-outline"
                            size={16}
                            color="#10B981"
                          />
                          <Text style={{ color: "#10B981", marginLeft: 4, fontSize: 13 }}>
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
            <View style={{
              backgroundColor: "#F9FAFB",
              padding: 20,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
              <Text style={{ color: "#6B7280", marginTop: 8, textAlign: "center" }}>
                No notes available. Add your first note above.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </GestureHandlerRootView>
  );
};

export default ContactDetailsScreen;
