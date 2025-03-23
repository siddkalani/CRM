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
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SkeletonLoader from "../../components/SkeletonLoader";
import { BASE_URL } from "../../constants/constant";
import CustomHeader from "../../components/CustomHeader";
import { useVoice } from "../../context/VoiceContext";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const LeadDetailsScreen = ({ route, navigation }) => {
//   const lead = route.params?.lead;
//   const leadId = lead?._id;

//   const [leadDetails, setLeadDetails] = useState(lead || null);
//   const [searchText, setSearchText] = useState("");
//   const [filteredNotes, setFilteredNotes] = useState([]);
//   const [newNote, setNewNote] = useState("");
//   const [editNoteId, setEditNoteId] = useState(null);
//   const [editNoteText, setEditNoteText] = useState("");
//   const [attachedDocument, setAttachedDocument] = useState(null);

//   // Voice from context
//   const {
//     isRecording,
//     recognizedText,
//     setRecognizedText,
//     startRecording,
//     stopRecording,
//   } = useVoice();

//   useEffect(() => {
//     if (recognizedText) {
//       setNewNote((prev) =>
//         prev ? `${prev} ${recognizedText}` : recognizedText
//       );
//       setRecognizedText("");
//     }
//   }, [recognizedText]);

//   useEffect(() => {
//     if (leadId) fetchLeadDetails(leadId);
//   }, [leadId]);

//   const fetchLeadDetails = async (id) => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/lead/one/${id}`);
//       const data = await response.json();
//       setLeadDetails(data);
//       if (Array.isArray(data.notes)) setFilteredNotes(data.notes);
//     } catch (error) {
//       console.error("Error fetching lead:", error);
//     }
//   };

//   // Document picker handler
//   const handlePickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         copyToCacheDirectory: true,
//         multiple: false, // just to be safe
//       });
  
//       console.log("🎯 PICKED DOCUMENT RESULT:", JSON.stringify(result, null, 2));
  
//       if (!result.canceled && result.assets?.length) {
//         const doc = result.assets[0];
  
//         // Fallback name if needed
//         if (!doc.name) {
//           doc.name = doc.uri.split("/").pop();
//         }
  
//         setAttachedDocument(doc); // 👈 this was the missing piece
//       }
//     } catch (error) {
//       console.warn("📛 Document picking failed:", error);
//     }
//   };

//   const handleAddNote = async () => {
//     if (!newNote.trim()) return;

//     try {
//       const response = await fetch(`${BASE_URL}/api/lead/one/${leadId}/notes`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: newNote.trim(),
//         }),
//       });
//       const updatedLead = await response.json();
//       setLeadDetails(updatedLead);
//       setNewNote("");
//       setAttachedDocument(null);

//       if (Array.isArray(updatedLead.notes)) {
//         setFilteredNotes(updatedLead.notes);
//         if (searchText.trim()) {
//           filterNotes(searchText, updatedLead.notes);
//         }
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to add note.");
//     }
//   };

//   const handleEditNote = (noteId, currentText) => {
//     setEditNoteId(noteId);
//     setEditNoteText(currentText);
//   };

//   const handleSaveEditedNote = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/api/lead/one/${leadId}/notes/${editNoteId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ text: editNoteText }),
//         }
//       );
//       const updatedLead = await response.json();
//       setLeadDetails(updatedLead);
//       setEditNoteId(null);
//       setEditNoteText("");
//       if (Array.isArray(updatedLead.notes)) {
//         setFilteredNotes(updatedLead.notes);
//         if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to update note.");
//     }
//   };

//   const handleDeleteNote = async (noteId) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/api/lead/one/${leadId}/notes/${noteId}`,
//         {
//           method: "DELETE",
//         }
//       );
//       const updatedLead = await response.json();
//       setLeadDetails(updatedLead);
//       if (Array.isArray(updatedLead.notes)) {
//         setFilteredNotes(updatedLead.notes);
//         if (searchText.trim()) filterNotes(searchText, updatedLead.notes);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to delete note.");
//     }
//   };

//   const handleSearchChange = (text) => {
//     setSearchText(text);
//     filterNotes(text, leadDetails.notes || []);
//   };

//   const filterNotes = (searchValue, notesArray) => {
//     if (!searchValue.trim()) {
//       setFilteredNotes(notesArray);
//       return;
//     }
//     const lowerText = searchValue.toLowerCase();
//     const matched = notesArray.filter((note) =>
//       note.text?.toLowerCase().includes(lowerText)
//     );
//     setFilteredNotes(matched);
//   };

//   const handleShareNote = async (note) => {
//     try {
//       await Share.share({
//         message: note.text,
//         title: "Share Note",
//       });
//     } catch (error) {
//       console.error("Error sharing note:", error);
//       Alert.alert("Error", "Failed to share the note.");
//     }
//   };

//   if (!leadDetails) {
//     return (
//       <View className="flex-1 p-4 bg-white">
//         <SkeletonLoader width="60%" height={20} />
//         <SkeletonLoader width="40%" height={16} />
//         <SkeletonLoader width="50%" height={16} />
//         <SkeletonLoader width="100%" height={60} borderRadius={8} />
//         <SkeletonLoader width="30%" height={40} />
//         <SkeletonLoader width="100%" height={100} borderRadius={8} />
//         <SkeletonLoader width="100%" height={100} borderRadius={8} />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <CustomHeader
//         title="Lead Details"
//         onSearchChange={handleSearchChange}
//         showBackButton={true}
//         navigation={navigation}
//         enableVoice={false}
//       />

//       <ScrollView className="flex-1">
//         <View className="p-4">
//           {/* Lead Info Card */}
//           <View className="bg-blue-50 rounded-xl p-4 mb-4 shadow-sm">
//             <View className="flex-row">
//               <View className="flex-1 pr-3">
//                 <Text className="text-lg font-bold text-gray-800">
//                   {leadDetails.firstName} {leadDetails.lastName}
//                 </Text>
//                 <Text className="text-blue-600 mt-1">
//                   {leadDetails.email}
//                 </Text>
//                 <Text className="text-gray-600 mt-1">{leadDetails.phone}</Text>
//                 {!!leadDetails.company && (
//                   <Text className="text-gray-600 mt-1">{leadDetails.company}</Text>
//                 )}
                
//                 <View className="flex-row mt-3">
                 
//                   <TouchableOpacity className="bg-gray-300 py-1 px-3 rounded-full">
//                     <Text className="text-gray-600 text-sm">Status: Lead</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <Image
//                 source={{ uri: "https://via.placeholder.com/60" }}
//                 className="w-16 h-16 rounded-full bg-gray-200"
//               />
//             </View>
//           </View>

//           {/* Quick Actions */}
//           <View className="flex-row justify-between mb-6">
//             <TouchableOpacity 
//               className="bg-blue-500 rounded-lg py-2 px-4 flex-row items-center"
//               onPress={() => {
//                 if (leadDetails.phone) {
//                   Linking.openURL(`tel:${leadDetails.phone}`);
//                 } else {
//                   Alert.alert("Error", "Phone number is not available.");
//                 }
//               }}
//             >
//               <Ionicons name="call-outline" size={18} color="#fff" />
//               <Text className="text-white ml-2">Call</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               className="bg-green-500 rounded-lg py-2 px-4 flex-row items-center"
//               onPress={() => {
//                 if (leadDetails.email) {
//                   Linking.openURL(`mailto:${leadDetails.email}`);
//                 } else {
//                   Alert.alert("Error", "Email is not available.");
//                 }
//               }}
//             >
//               <Ionicons name="mail-outline" size={18} color="#fff" />
//               <Text className="text-white ml-2">Email</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               className="bg-purple-500 rounded-lg py-2 px-4 flex-row items-center"
//               onPress={async () => {
//                 try {
//                   await Share.share({
//                     message: `Lead Details:\nName: ${leadDetails.firstName} ${leadDetails.lastName}\nEmail: ${leadDetails.email}\nPhone: ${leadDetails.phone}`,
//                     title: "Share Lead Details",
//                   });
//                 } catch (error) {
//                   Alert.alert("Error", "Failed to share the lead details.");
//                 }
//               }}
//             >
//               <Ionicons name="share-social-outline" size={18} color="#fff" />
//               <Text className="text-white ml-2">Share</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Add Note Section */}
//           <View className="bg-gray-50 rounded-xl p-4 mb-6 shadow-sm">
//             <Text className="font-bold text-gray-800 mb-2">Add Leads</Text>
//             <View className="flex-row items-start">
//               <TextInput
//                 className="bg-white border border-gray-200 rounded-lg p-3 min-h-16 flex-1 text-gray-800"
//                 placeholder="Type your new note here..."
//                 multiline
//                 value={newNote}
//                 onChangeText={setNewNote}
//                 placeholderTextColor="#9CA3AF"
//               />
//               <TouchableOpacity
//                 onPress={isRecording ? stopRecording : startRecording}
//                 className={`ml-2 p-3 rounded-lg ${isRecording ? "bg-red-500" : "bg-blue-500"}`}
//               >
//                 <Ionicons
//                   name={isRecording ? "mic-off" : "mic"}
//                   size={24}
//                   color="#fff"
//                 />
//               </TouchableOpacity>
//             </View>

//             {/* Document attachment & buttons */}
//             <View className="mt-3">
//             {attachedDocument && (
//   <View className="bg-blue-50 p-3 rounded-lg mb-4">
//     <View className="flex-row items-center justify-between">
//       <Ionicons name="document-attach" size={18} color="#3B82F6" />
//       <Text className="text-blue-600 ml-2 flex-1 truncate">
//         {attachedDocument.name || 'Unnamed Document'}
//       </Text>
//       <TouchableOpacity onPress={() => setAttachedDocument(null)}>
//         <Ionicons name="close-circle" size={20} color="#6B7280" />
//       </TouchableOpacity>
//     </View>

//     {/* Show preview if it's an image */}
//     {attachedDocument.mimeType?.startsWith("image/") && (
//       <Image
//         source={{ uri: attachedDocument.uri }}
//         className="w-24 h-24 mt-3 rounded-md bg-gray-200"
//         resizeMode="cover"
//       />
//     )}
//   </View>
// )}

              
//               <View className="flex-row">
//                 <TouchableOpacity
//                   onPress={handleAddNote}
//                   className="bg-blue-500 rounded-lg py-2 px-4 flex-1 mr-2"
//                 >
//                   <Text className="text-white text-center font-medium">Save Note</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={handlePickDocument}
//                   className="bg-gray-700 rounded-lg py-2 px-4 flex-row justify-center items-center"
//                 >
//                   <Ionicons name="attach" size={18} color="#fff" />
//                   <Text className="text-white ml-2">Attach</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>

//           {/* Notes List */}
//           <View>
//             <View className="flex-row justify-between items-center mb-3">
//               <Text className="text-lg font-bold text-gray-800">Notes</Text>
//               <Text className="text-gray-500 text-sm">{filteredNotes.length} notes</Text>
//             </View>
            
//             {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
//               [...filteredNotes].reverse().map((note) => (
//                 <View
//                   key={note._id}
//                   className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
//                 >
//                   {editNoteId === note._id ? (
//                     <>
//                       <TextInput
//                         className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-16 text-gray-800"
//                         multiline
//                         value={editNoteText}
//                         onChangeText={setEditNoteText}
//                       />
//                       <View className="flex-row mt-3">
//                         <TouchableOpacity
//                           onPress={handleSaveEditedNote}
//                           className="bg-green-500 py-2 px-4 rounded-lg mr-2"
//                         >
//                           <Text className="text-white font-medium">Save</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => {
//                             setEditNoteId(null);
//                             setEditNoteText("");
//                           }}
//                           className="bg-gray-300 py-2 px-4 rounded-lg"
//                         >
//                           <Text className="text-gray-700 font-medium">Cancel</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </>
//                   ) : (
//                     <>
//                       <Text className="text-gray-800 leading-relaxed">{note.text}</Text>
//                       <Text className="text-gray-500 text-xs mt-2">
//                         {new Date(note.createdAt).toLocaleString()}
//                       </Text>
//                       <View className="flex-row mt-3 pt-2 border-t border-gray-100">
//                         <TouchableOpacity
//                           onPress={() => handleEditNote(note._id, note.text)}
//                           className="flex-row items-center mr-4"
//                         >
//                           <Ionicons name="create-outline" size={16} color="#3B82F6" />
//                           <Text className="text-blue-500 ml-1 text-sm">Edit</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleDeleteNote(note._id)}
//                           className="flex-row items-center mr-4"
//                         >
//                           <Ionicons name="trash-outline" size={16} color="#EF4444" />
//                           <Text className="text-red-500 ml-1 text-sm">Delete</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleShareNote(note)}
//                           className="flex-row items-center"
//                         >
//                           <Ionicons name="share-outline" size={16} color="#10B981" />
//                           <Text className="text-green-500 ml-1 text-sm">Share</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </>
//                   )}
//                 </View>
//               ))
//             ) : (
//               <View className="bg-gray-50 p-8 rounded-lg items-center justify-center">
//                 <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
//                 <Text className="text-gray-500 mt-2 text-center">
//                   No notes available. Add your first note above.
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default LeadDetailsScreen;



const LeadDetailsScreen = ({ route, navigation }) => {
  const lead = route.params?.lead;
  const leadId = lead?._id;

  const [leadDetails, setLeadDetails] = useState(lead || null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [attachedDocument, setAttachedDocument] = useState(null);

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
      setRecognizedText("");
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
      console.error("Error fetching lead:", error);
    }
  };

 // Document Picker and Form Data handling

const handlePickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    console.log(
      "🎯 PICKED DOCUMENT RESULT:",
      JSON.stringify(result, null, 2)
    );

    if (!result.canceled && result.assets?.length) {
      const doc = result.assets[0];

      // Ensure we have all required properties
      const fileInfo = {
        uri: Platform.OS === 'ios' ? doc.uri.replace('file://', '') : doc.uri,
        name: doc.name || doc.uri.split('/').pop() || 'document.pdf',
        type: doc.mimeType || getMimeType(doc.uri) || 'application/octet-stream',
        size: doc.size
      };

      console.log("📄 Formatted document info:", JSON.stringify(fileInfo, null, 2));
      setAttachedDocument(fileInfo);
    }
  } catch (error) {
    console.warn("📛 Document picking failed:", error);
    Alert.alert("Error", "Failed to pick document: " + error.message);
  }
};

// Helper function to guess MIME type from file extension
const getMimeType = (uri) => {
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const handleAddNote = async () => {
  if (!newNote.trim() && !attachedDocument) {
    console.log("No note text or attachment provided");
    return;
  }

  try {
    setIsSubmitting(true); // Add a loading state if you haven't already

    // Create FormData object
    const formData = new FormData();
    
    // Add text if provided
    if (newNote.trim()) {
      formData.append('text', newNote.trim());
    }
    
    // Add file if available
    if (attachedDocument) {
      console.log("📤 Attaching document to FormData:", JSON.stringify(attachedDocument, null, 2));
      
      // Append the file with the correct field name 'file'
      formData.append('file', {
        uri: attachedDocument.uri,
        type: attachedDocument.type,
        name: attachedDocument.name
      });

      // Log the structure of formData (limited visibility in RN)
      console.log("FormData entries:");
      for (let pair of Object.entries(formData)) {
        console.log(pair[0], pair[1]);
      }
    }
    
    // Send request with FormData
    const endpoint = `${BASE_URL}/api/lead/one/${leadId}/notes`;
    console.log("📡 Sending request to:", endpoint);
    
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Do NOT set 'Content-Type': 'multipart/form-data' manually
      }
    });
    
    // Log the entire response for debugging
    const responseText = await response.text();
    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response headers:`, response.headers);
    console.log(`📥 Response body:`, responseText);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${responseText}`);
    }
    
    // Parse the JSON response only if it's valid JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.warn("Response was not valid JSON:", responseText);
      throw new Error("Invalid response from server");
    }
    
    // Update UI state
    setLeadDetails(responseData.lead || responseData);
    setNewNote("");
    setAttachedDocument(null);

    // Update notes list
    if (Array.isArray(responseData.lead?.notes || responseData.notes)) {
      const notes = responseData.lead?.notes || responseData.notes;
      setFilteredNotes(notes);
      if (searchText.trim()) {
        filterNotes(searchText, notes);
      }
    }
    
    // Show success message
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
        {
          method: "DELETE",
        }
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
        title: "Share Note",
      });
    } catch (error) {
      console.error("Error sharing note:", error);
      Alert.alert("Error", "Failed to share the note.");
    }
  };

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
          {/* Lead Info Card */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center">
              {/* Left: Details */}
              <View className="flex-1 pr-4">
                <Text className="text-lg font-semibold text-gray-800">
                  {leadDetails.firstName} {leadDetails.lastName}
                </Text>
                <Text className="text-blue-600 mt-1">{leadDetails.email}</Text>
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

              {/* Right: Avatar/Initials */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center"
              >
                <Text className="text-blue-700 font-bold text-xl">
                  {`${leadDetails.firstName?.[0] || ''}${leadDetails.lastName?.[0] || ''}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
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

          {/* Add Note Section */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6 shadow-sm">
            <Text className="font-bold text-gray-800 mb-2">Add Leads</Text>
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
                className={`absolute right-3 bottom-3 p-3 rounded-full ${isRecording ? "bg-red-500" : "bg-blue-500"
                  }`}
              >
                <Ionicons
                  name={isRecording ? "mic-off" : "mic"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Document attachment & buttons */}
            <View className="mt-3">
              {attachedDocument && (
                <View className="bg-blue-50 p-3 rounded-lg mb-4">
                  <View className="flex-row items-center justify-between">
                    <Ionicons
                      name="document-attach"
                      size={18}
                      color="#3B82F6"
                    />
                    <Text className="text-blue-600 ml-2 flex-1 truncate">
                      {attachedDocument.name || "Unnamed Document"}
                    </Text>
                    <TouchableOpacity onPress={() => setAttachedDocument(null)}>
                      <Ionicons name="close-circle" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Show preview if it's an image */}
                  {attachedDocument.mimeType?.startsWith("image/") && (
                    <Image
                      source={{ uri: attachedDocument.uri }}
                      className="w-24 h-24 mt-3 rounded-md bg-gray-200"
                      resizeMode="cover"
                    />
                  )}
                </View>
              )}

              <View className="flex-row">
                <TouchableOpacity
                  onPress={handleAddNote}
                  className="bg-blue-500 rounded-lg py-2 px-4 flex-1 mr-2"
                >
                  <Text className="text-white text-center font-medium">
                    Save Note
                  </Text>
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

          {/* Notes List */}
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-800">Notes</Text>
              <Text className="text-gray-500 text-sm">
                {filteredNotes.length} notes
              </Text>
            </View>

            {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
              [...filteredNotes].reverse().map((note) => (
                <View
                  key={note._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
                >
                  {editNoteId === note._id ? (
                    <>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-16 text-gray-800"
                        multiline
                        value={editNoteText}
                        onChangeText={setEditNoteText}
                      />
                      <View className="flex-row mt-3">
                        <TouchableOpacity
                          onPress={handleSaveEditedNote}
                          className="bg-green-500 py-2 px-4 rounded-lg mr-2"
                        >
                          <Text className="text-white font-medium">Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setEditNoteId(null);
                            setEditNoteText("");
                          }}
                          className="bg-gray-300 py-2 px-4 rounded-lg"
                        >
                          <Text className="text-gray-700 font-medium">
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      {note.text && (
                        <Text className="text-gray-800 leading-relaxed">
                          {note.text}
                        </Text>
                      )}
                      
                      {note.fileUrl && (
                        <View className="mt-2 mb-2">
                          <TouchableOpacity 
                            className="flex-row items-center bg-blue-50 p-2 rounded-lg"
                            onPress={() => Linking.openURL(note.fileUrl)}
                          >
                            <Ionicons
                              name={note.fileType?.startsWith('image/') ? "image-outline" : "document-outline"}
                              size={18}
                              color="#3B82F6"
                            />
                            <Text className="text-blue-600 ml-2 flex-1 truncate">
                              {note.fileName || "Attached File"}
                            </Text>
                          </TouchableOpacity>
                          
                          {note.fileType?.startsWith('image/') && (
                            <Image
                              source={{ uri: note.fileUrl }}
                              className="w-24 h-24 mt-2 rounded-md bg-gray-200"
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      )}
                      
                      <Text className="text-gray-500 text-xs mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </Text>
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
                          <Text className="text-blue-500 ml-1 text-sm">
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteNote(note._id)}
                          className="flex-row items-center mr-4"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#EF4444"
                          />
                          <Text className="text-red-500 ml-1 text-sm">
                            Delete
                          </Text>
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
              ))
            ) : (
              <View className="bg-gray-50 p-8 rounded-lg items-center justify-center">
                <Ionicons
                  name="document-text-outline"
                  size={40}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 mt-2 text-center">
                  No notes available. Add your first note above.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LeadDetailsScreen;