import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SubjectScreen from '../screens/SubjectScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ParentZoneScreen from '../screens/ParentZoneScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(36, 18, 58, 0.9)',
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '🏠 Home' }} />
      <Tab.Screen name="Learn" component={SubjectScreen} options={{ tabBarLabel: '📚 Learn' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: '🏆 Progress' }} />
      <Tab.Screen name="Settings" component={ParentZoneScreen} options={{ tabBarLabel: '⚙️ Settings' }} />
    </Tab.Navigator>
  );
}
