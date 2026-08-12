import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LessonScreen from '../screens/LessonScreen';
import QuizScreen from '../screens/QuizScreen';
import MathGameScreen from '../screens/MathGameScreen';
import ColorShapeScreen from '../screens/ColorShapeScreen';
import MemoryFlipScreen from '../screens/MemoryFlipScreen';
import SpellingScreen from '../screens/SpellingScreen';
import CountingPatternScreen from '../screens/CountingPatternScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="MathGame" component={MathGameScreen} />
        <Stack.Screen name="ColorShape" component={ColorShapeScreen} />
        <Stack.Screen name="MemoryFlip" component={MemoryFlipScreen} />
        <Stack.Screen name="Spelling" component={SpellingScreen} />
        <Stack.Screen name="CountingPattern" component={CountingPatternScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
