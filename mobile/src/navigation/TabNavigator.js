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
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderTopWidth: 2,
          borderTopColor: 'rgba(255, 255, 255, 0.4)',
          height: 80,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 40,
          elevation: 0,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: { fontWeight: '900', fontSize: 10 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text style={{fontSize: 24}}>🏠</Text> }} />
      <Tab.Screen name="Learn" component={SubjectScreen} options={{ tabBarLabel: 'Learn', tabBarIcon: () => <Text style={{fontSize: 24}}>📚</Text> }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress', tabBarIcon: () => <Text style={{fontSize: 24}}>📊</Text> }} />
      <Tab.Screen name="Settings" component={ParentZoneScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: () => <Text style={{fontSize: 24}}>⚙️</Text> }} />
    </Tab.Navigator>
  );
}
