import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import AddLeadScreen from '../screens/leads/AddLeadScreen';
import CustomHeader from '../components/CustomHeader';

// Create Stack Navigator
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Main Tab Navigation */}
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />

        {/* Additional Stack Screens */}
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="AddLeadScreen" component={AddLeadScreen} options={{ header: (props) => <CustomHeader {...props} title="Add Screen" /> }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
