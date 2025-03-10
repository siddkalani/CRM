import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import AddLeadScreen from '../screens/leads/AddLeadScreen';
import CustomHeader from '../components/CustomHeader';
import EditLeadDetails from '../screens/leads/EditLeadDetails';
import LeadDetailsScreen from '../screens/leads/LeadDetailsScreen';
import ContactDetailsScreen from '../screens/contacts/ContactDetailScreen';
import ReusableLoginScreen from '../screens/auth/LogIn';
import SignUp from '../screens/auth/SignUp';
import AuthLoadingScreen from '../screens/inital/AuthLoadingScreen';
import AddContactScreen from '../screens/contacts/AddContactScreen';
// Create Stack Navigator
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen
          name="LogIn"
          component={ReusableLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        {/* Main Tab Navigation */}
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
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
          name="AddContactScreen"
          component={AddContactScreen}
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
          options={{
            header: (props) => (
              <CustomHeader
                {...props}
                title="Lead details"
                showBackButton={true} // <-- only set this prop for AddLeadScreen
              />
            ),
          }}
          // options={{ title: 'Leads' }}
        />
         <Stack.Screen
          name="ContactDetailsScreen"
          component={ContactDetailsScreen}
          // The title is also overridden in the screen with useLayoutEffect
          options={{
            header: (props) => (
              <CustomHeader
                {...props}
                title="Lead details"
                showBackButton={true} // <-- only set this prop for AddLeadScreen
              />
            ),
          }}
          // options={{ title: 'Leads' }}
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
