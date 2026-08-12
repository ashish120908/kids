import React from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import ProfileHeader from '../components/ProfileHeader';
import AppTitle from '../components/AppTitle';
import GameCard from '../components/GameCard';
import PromoBanner from '../components/PromoBanner';
import { gradients } from '../theme/tokens';

const GAMES = [
  { id: 'math', title: 'Math Master', icon: '➕', subtitle: 'Fun Math Challenges!', gradient: gradients.cardMath, screen: 'MathGame' },
  { id: 'colors', title: 'Color & Shape', icon: '🎨', subtitle: 'Match & Draw!', gradient: gradients.cardColors, screen: 'ColorShape' },
  { id: 'memory', title: 'Memory Flip', icon: '🃏', subtitle: 'Boost Your Memory!', gradient: gradients.cardMemory, screen: 'MemoryFlip' },
  { id: 'spelling', title: 'Spelling Bee', icon: '🐝', subtitle: 'Learn New Words!', gradient: gradients.cardSpelling, screen: 'Spelling' },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProfileHeader />
        <AppTitle />

        <View style={styles.grid}>
          {GAMES.map(game => (
            <GameCard
              key={game.id}
              title={game.title}
              subtitle={game.subtitle}
              icon={game.icon}
              gradient={game.gradient}
              onPress={() => navigation.navigate(game.screen)}
            />
          ))}
        </View>

        <PromoBanner />

        {/* Padding for the floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
