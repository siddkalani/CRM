// SearchModal.js
import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchModal = ({
  visible,
  onClose,
  searchQuery,
  leads,
  contacts,
  notes,
  onItemPress, // if you want to handle item clicks
}) => {
  // Simple filtering logic as an example (you can refine as needed)
  const filteredLeads = leads.filter(item =>
    `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredContacts = contacts.filter(item =>
    `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredNotes = notes.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) // or whatever note property
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header Row inside Modal */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Search Results</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Show search query */}
        <Text style={styles.subTitle}>
          Showing results for: "<Text style={{ fontWeight: '600' }}>{searchQuery}</Text>"
        </Text>

        {/* Leads Section */}
        <Text style={styles.sectionTitle}>Leads</Text>
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => onItemPress?.(item, 'lead')}
            >
              <Ionicons name="people" size={24} color="#555" style={{ marginRight: 10 }} />
              <Text>{item.firstName} {item.lastName}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Contacts Section */}
        <Text style={styles.sectionTitle}>Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => onItemPress?.(item, 'contact')}
            >
              <Ionicons name="person" size={24} color="#555" style={{ marginRight: 10 }} />
              <Text>{item.firstName} {item.lastName}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Notes Section */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => onItemPress?.(item, 'note')}
            >
              <Ionicons name="document-text" size={24} color="#555" style={{ marginRight: 10 }} />
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subTitle: {
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 14,
    color: '#777',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});

export default SearchModal;
