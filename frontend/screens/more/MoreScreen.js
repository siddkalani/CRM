import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SkeletonLoader from '../../components/SkeletonLoader';
import { StatusBar } from 'expo-status-bar';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // Local states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'LogIn' }],
        });
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
      
      // Animate the content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required.');
      return false;
    }
    
    if (password && password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return false;
    }
    
    if (password && password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const updateProfile = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        return;
      }

      // Only include password in the request if it has been changed
      const payload = { username };
      if (password) {
        payload.password = password;
      }

      const response = await fetch(`${BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      // Reset password fields after successful update
      setPassword('');
      setConfirmPassword('');
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <ScrollView className="flex-1 px-5 pt-12">
          {/* Skeleton Profile Icon + Title */}
          <View className="items-center mb-8">
            <SkeletonLoader width={100} height={100} borderRadius={50} />
            <SkeletonLoader width={120} height={24} borderRadius={4} style={{ marginTop: 12 }} />
          </View>

          {/* Username skeleton */}
          <View className="mb-6">
            <SkeletonLoader width={80} height={18} borderRadius={4} />
            <SkeletonLoader width="100%" height={48} borderRadius={8} style={{ marginTop: 8 }} />
          </View>

          {/* Password skeleton */}
          <View className="mb-6">
            <SkeletonLoader width={100} height={18} borderRadius={4} />
            <SkeletonLoader width="100%" height={48} borderRadius={8} style={{ marginTop: 8 }} />
          </View>

          {/* Confirm Password skeleton */}
          <View className="mb-6">
            <SkeletonLoader width={120} height={18} borderRadius={4} />
            <SkeletonLoader width="100%" height={48} borderRadius={8} style={{ marginTop: 8 }} />
          </View>

          {/* "Save Settings" button placeholder */}
          <SkeletonLoader width="100%" height={52} borderRadius={8} />

          {/* "Logout" button placeholder */}
          <SkeletonLoader width="100%" height={52} borderRadius={8} style={{ marginTop: 16 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <StatusBar style="dark" />
      <ScrollView className="flex-1 bg-gray-50">
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="px-5 pt-6 pb-8"
        >
          
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-3">
              <Text className="text-4xl font-bold text-blue-600">
                {username ? username[0].toUpperCase() : '?'}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {username || 'User Profile'}
            </Text>
            <Text className="text-gray-500">
              Manage your account details
            </Text>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <Text className="text-sm font-medium text-gray-500 uppercase mb-4">
              Account Information
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Username</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 py-2"
                  placeholder="Enter username"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">New Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 py-2"
                  placeholder="Enter new password (optional)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Ionicons name="checkmark-circle-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 py-2"
                  placeholder="Confirm new password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 items-center mb-4 ${
              isSaving ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            onPress={updateProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <View className="flex-row items-center">
                <Ionicons name="refresh" size={20} color="#fff" className="animate-spin" />
                <Text className="text-white font-bold text-base ml-2">
                  Saving...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-red-500 rounded-lg py-4 items-center mb-6"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-bold text-base ml-2">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text className="text-center text-gray-400 text-xs mb-2">
            Version 1.0.3
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;