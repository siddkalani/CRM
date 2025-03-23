import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import SkeletonLoader from '../../components/SkeletonLoader';

const LeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchLeads = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/lead/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch leads.');
        return;
      }

      const data = await response.json();
      const allLeads = data.leads || [];
      setLeads(allLeads);
      setFilteredLeads(allLeads);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching leads.');
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [])
  );

  const handleSearchChange = (text) => {
    setSearchText(text);

    if (!text.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const lowerText = text.toLowerCase();

    const matchedLeads = leads.reduce((acc, lead) => {
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
      const email = (lead.email || '').toLowerCase();

      const matchedNotes = Array.isArray(lead.notes)
        ? lead.notes.filter((note) => note.text && note.text.toLowerCase().includes(lowerText))
        : [];

      const leadMatches = fullName.includes(lowerText) || email.includes(lowerText);

      if (leadMatches || matchedNotes.length > 0) {
        acc.push({ ...lead, matchedNotes });
      }

      return acc;
    }, []);

    setFilteredLeads(matchedLeads);
  };
  if (!leads.length) {
    return (
      <View style={{ flex: 1 }}>
        {/* Skeleton Header */}
        <View style={{ backgroundColor: '#007BFF', paddingTop: 40 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 56,
              paddingHorizontal: 12,
            }}
          >
            {/* Left icon placeholder (e.g. back button or menu) */}
            <SkeletonLoader width={24} height={24} borderRadius={4} style={{ marginRight: 10 }} />
  
            {/* Title placeholder */}
            <SkeletonLoader width={100} height={16} borderRadius={4} />
  
            {/* Flex filler */}
            <View style={{ flex: 1 }} />
  
            {/* Right icon placeholder (e.g. search icon) */}
            <SkeletonLoader width={24} height={24} borderRadius={4} />
          </View>
        </View>
  
        {/* Skeleton List Items */}
        <View style={{ flex: 1, padding: 16 }}>
          {[...Array(5)].map((_, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              {/* Circular avatar placeholder */}
              <SkeletonLoader width={40} height={40} borderRadius={20} />
  
              {/* Text lines placeholder */}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="60%" height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
  

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header with Search */}
      <CustomHeader
        navigation={navigation}
        title="Leads"
        onSearchChange={handleSearchChange}
      />

      {/* Filter Bar (exactly as in ContactScreen) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
        }}
      >
        <Text style={{ fontWeight: 'bold', color: '#007BFF' }}>
          All Leads
        </Text>
        
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('LeadDetailsScreen', { lead: item })}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="person-circle"
                size={40}
                color="#999"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={{ color: '#666' }}>{item.email}</Text>
              </View>
            </View>

            {item.matchedNotes && item.matchedNotes.length > 0 && (
              <View style={{ marginTop: 6, marginLeft: 52 }}>
                {item.matchedNotes.map((note) => (
                  <Text key={note._id} style={{ color: '#555', fontSize: 14 }}>
                    • {note.text}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button (exactly as in ContactScreen) */}
      <View style={{ position: 'absolute', bottom: 40, right: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007BFF',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={() => navigation.navigate('AddLeadScreen')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeadsScreen;
