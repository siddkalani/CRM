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
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

/* -------------------------------------------------------------------------- */
/*                            ContactDetailsScreen                            */
/* -------------------------------------------------------------------------- */

const ContactDetailsScreen = ({ route, navigation }) => {
  /* -------------------------------- State -------------------------------- */
  const contact = route.params?.contact;
  const contactId = contact?._id;

  const [contactDetails, setContactDetails] = useState(contact || null);

  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [newNote, setNewNote] = useState("");

  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");

  /** Attachment list is ALWAYS an array */
  const [attachments, setAttachments] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  // Voice context
  const {
    isRecording,
    recognizedText,
    setRecognizedText,
    startRecording,
    stopRecording,
  } = useVoice();

  /* -------------------------- Voice autofill note -------------------------- */
  useEffect(() => {
    if (recognizedText) {
      setNewNote((prev) => (prev ? `${prev} ${recognizedText}` : recognizedText));
      setRecognizedText("");
    }
  }, [recognizedText]);

  /* --------------------------- Fetch contact data -------------------------- */
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

  /* ----------------------------- Doc picker -------------------------------- */
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets?.length) {
        const newlyPicked = result.assets.map((doc) => ({
          uri: Platform.OS === "ios" ? doc.uri.replace("file://", "") : doc.uri,
          name: doc.name ?? doc.uri.split("/").pop() ?? "document",
          type: doc.mimeType ?? "application/octet-stream",
          size: doc.size,
        }));
        setAttachments((prev) => [...prev, ...newlyPicked]);
      }
    } catch (error) {
      console.warn("Document picking failed:", error);
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  /* ----------------------------- Add note ---------------------------------- */
  const handleAddNote = async () => {
    if (isSubmitting) return;
    if (!newNote.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (newNote.trim()) formData.append("text", newNote.trim());

      attachments.forEach((doc) => {
        formData.append("files", {
          uri: doc.uri,
          type: doc.type,
          name: doc.name,
        });
      });

      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes`,
        {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }
      );

      const raw = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw}`);

      const data = JSON.parse(raw);
      const notes = data.contact?.notes ?? data.notes ?? [];

      setContactDetails(data.contact ?? data);
      setFilteredNotes(notes);
      if (searchText.trim()) filterNotes(searchText, notes);

      setNewNote("");
      setAttachments([]);

      Alert.alert("Success", "Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Error", "Failed to add note: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------- Edit / delete / share notes ---------------------- */
  const handleEditNote = (id, text) => {
    setEditNoteId(id);
    setEditNoteText(text);
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
      setFilteredNotes(updatedContact.notes);
      if (searchText.trim()) filterNotes(searchText, updatedContact.notes);
    } catch (err) {
      Alert.alert("Error", "Failed to update note.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/contacts/one/${contactId}/notes/${noteId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete note");

      const updatedContact = await response.json();
      setContactDetails(updatedContact);
      setFilteredNotes(updatedContact.notes);
      if (searchText.trim()) filterNotes(searchText, updatedContact.notes);
    } catch (err) {
      Alert.alert("Error", "Failed to delete note.");
    }
  };

  const handleShareNote = async (note) => {
    try {
      const when = new Date(note.createdAt).toLocaleString();
      const shareMessage = `Contact Details:
Name: ${contactDetails.firstName} ${contactDetails.lastName}
Email: ${contactDetails.email}
Phone: ${contactDetails.phone}

Note Details:
Date: ${when}
Note: ${note.text ?? "No text"}

${
  note.fileUrl
    ? `Attachment:
File Name: ${note.fileName ?? "Unnamed"}
File URL: ${note.fileUrl}`
    : ""
}`;

      await Share.share({
        title: `Note for ${contactDetails.firstName}`,
        message: shareMessage,
        url: note.fileUrl,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to share the note.");
    }
  };

  /* ------------------------------ Search ---------------------------------- */
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterNotes(text, contactDetails.notes ?? []);
  };

  const filterNotes = (value, notes) => {
    if (!value.trim()) return setFilteredNotes(notes);
    const lower = value.toLowerCase();
    setFilteredNotes(notes.filter((n) => n.text?.toLowerCase().includes(lower)));
  };

  /* ------------------------------ Render ---------------------------------- */
  if (!contactDetails) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <CustomHeader
          navigation={navigation}
          title="Contact Details"
          showBackButton
          onSearchChange={handleSearchChange}
          enableVoice={false}
        />

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* ---------------------- Contact card ---------------------- */}
          <View
            style={{
              backgroundColor: "#E0F2FE",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
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
              </View>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#BAE6FD",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#0284C7" }}>
                  {(contactDetails.firstName?.[0] ?? "") +
                    (contactDetails.lastName?.[0] ?? "")}
                </Text>
              </View>
            </View>
          </View>

          {/* --------------------- Quick actions --------------------- */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {/* Call */}
            <TouchableOpacity
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() =>
                contactDetails.phone
                  ? Linking.openURL(`tel:${contactDetails.phone}`)
                  : Alert.alert("Error", "Phone number is not available.")
              }
            >
              <Ionicons name="call-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>Call</Text>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={{
                backgroundColor: "#10B981",
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() =>
                contactDetails.email
                  ? Linking.openURL(`mailto:${contactDetails.email}`)
                  : Alert.alert("Error", "Email is not available.")
              }
            >
              <Ionicons name="mail-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>Email</Text>
            </TouchableOpacity>

            {/* Share */}
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
                    title: "Share Contact Details",
                    message: `Contact Details:
Name: ${contactDetails.firstName} ${contactDetails.lastName}
Email: ${contactDetails.email}
Phone: ${contactDetails.phone}`,
                  });
                } catch (err) {
                  Alert.alert("Error", "Failed to share the contact details.");
                }
              }}
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* ----------------------- Add note ----------------------- */}
          <View
            style={{
              backgroundColor: "#E0F2FE",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
              Add a Note
            </Text>

            {/* Note input */}
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

            {/* Attachment preview */}
            {attachments.map((doc, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: "#FEF9C3",
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Ionicons name="document-attach" size={18} color="#CA8A04" />
                <Text style={{ marginLeft: 8, flex: 1, color: "#CA8A04" }}>
                  {doc.name}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setAttachments((arr) => arr.filter((_, i) => i !== idx))
                  }
                >
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Buttons */}
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
                <Text
                  style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
                >
                  {isSubmitting ? "Saving..." : "Save Note"}
                </Text>
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

          {/* ----------------------- Notes list ---------------------- */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Notes</Text>
              <Text style={{ color: "#6B7280" }}>{filteredNotes.length} notes</Text>
            </View>

            {filteredNotes.length > 0 ? (
              [...filteredNotes].reverse().map((note) => (
                <Swipeable
                  key={note._id}
                  friction={2}
                  overshootRight={false}
                  rightThreshold={40}
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
                      <Text style={{ color: "#fff", fontSize: 12 }}>Delete</Text>
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
                      marginBottom: 12,
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
                          <Text style={{ marginBottom: 4 }}>{note.text}</Text>
                        )}

                        {/* Single-file or multi-file notes */}
                        {Array.isArray(note.files)
                          ? note.files.map((f, i) => (
                              <AttachmentRow key={i} file={f} />
                            ))
                          : note.fileUrl && <AttachmentRow file={note} />}

                        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                          {new Date(note.createdAt).toLocaleString()}
                        </Text>

                        {/* Actions */}
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: "#F3F4F6",
                          }}
                        >
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
                            <Text style={{ color: "#3B82F6", marginLeft: 4 }}>
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
                            <Text style={{ color: "#10B981", marginLeft: 4 }}>
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
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: 20,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
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

/* ---------------------- Small helper component ----------------------- */
const AttachmentRow = ({ file }) => (
  <View style={{ marginVertical: 4 }}>
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        padding: 8,
        borderRadius: 6,
      }}
      onPress={() => Linking.openURL(file.fileUrl)}
    >
      <Ionicons
        name={file.fileType?.startsWith("image/") ? "image-outline" : "document-outline"}
        size={18}
        color="#3B82F6"
      />
      <Text style={{ marginLeft: 8, color: "#3B82F6", flex: 1 }}>
        {file.fileName ?? "Attached File"}
      </Text>
    </TouchableOpacity>

    {file.fileType?.startsWith("image/") && (
      <Image
        source={{ uri: file.fileUrl }}
        style={{
          width: 96,
          height: 96,
          marginTop: 4,
          borderRadius: 6,
          backgroundColor: "#E5E7EB",
        }}
      />
    )}
  </View>
);

export default ContactDetailsScreen;
