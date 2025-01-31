import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import AddLeadScreen from '../screens/leads/AddLeadScreen';
import CustomHeader from '../components/CustomHeader';
import EditLeadDetails from '../screens/leads/EditLeadDetails';
import LeadDetailsScreen from '../screens/leads/LeadDetailsScreen';
import ReusableLoginScreen from '../screens/auth/LogIn';

// Create Stack Navigator
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      {/* <Stack.Screen
          name="LogIn"
          component={ReusableLoginScreen}
          options={{ headerShown: false }}
        /> */}
        {/* Main Tab Navigation */}
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* Home Screen, uses default header */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        {/* AddLeadScreen with custom header and back button enabled */}
        <Stack.Screen
          name="AddLeadScreen"
          component={AddLeadScreen}
          options={{
            header: (props) => (
              <CustomHeader
                {...props}
                title="Add Screen"
                showBackButton={true} // <-- only set this prop for AddLeadScreen
              />
            ),
          }}
        />
         <Stack.Screen
          name="LeadDetailsScreen"
          component={LeadDetailsScreen}
          // The title is also overridden in the screen with useLayoutEffect
          options={{ title: 'Leads' }}
        />
        
        <Stack.Screen
          name="EditLeadDetails"
          component={EditLeadDetails}
          options={{ title: 'Edit Lead' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
