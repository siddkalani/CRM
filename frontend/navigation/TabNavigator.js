import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import LeadsScreen from '../screens/leads/LeadsScreen';
import ContactScreen from '../screens/contacts/ContactScreen';
import MoreScreen from '../screens/more/MoreScreen';
import { textcolors } from '../theme/Theme';
import CustomHeader from '../components/CustomHeader';
import AddLeadScreen from '../screens/leads/AddLeadScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leads') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: textcolors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: textcolors.primary },
        headerTitleStyle: { color: '#fff' },
      })}
    >
      {/* <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ header: (props) => <CustomHeader {...props} title="Home" /> }}
      /> */}
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactScreen}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={MoreScreen}
        options={{ header: (props) => <CustomHeader {...props} title="Profile" /> }}
      /> */}
    </Tab.Navigator>
  );
}
