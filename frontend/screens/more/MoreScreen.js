import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch user data');
      }

      const data = await response.json();
      setUsername(data.username || '');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updateProfile = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Both username and password are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userId');
  
              navigation.reset({
                index: 0,
                routes: [{ name: 'LogIn' }],
              });
            } catch (error) {
              Alert.alert('Error', 'An error occurred during logout.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6">
      <View className="items-center mb-6">
        <View className="w-26 h-26 items-center justify-center mb-2">
          <Ionicons name="person-circle" size={96} color="#ccc" />
        </View>
        <Text className="text-lg font-semibold text-gray-800">
          Edit Profile
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-semibold mb-1">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-semibold mb-1">New Password</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-md py-3 items-center mt-4"
        onPress={updateProfile}
      >
        <Text className="text-white font-semibold text-base">
          Save Settings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-red-500 rounded-md py-3 items-center mt-4"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-semibold text-base">
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
