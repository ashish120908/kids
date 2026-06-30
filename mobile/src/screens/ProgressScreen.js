import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import KidCard from '../components/KidCard';
import Badge from '../components/Badge';

export default function ProgressScreen({ route }) {
  const score = route?.params?.score ?? 0;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Progress Party 🏆" subtitle="Stars, streaks, and achievements" />
      <KidCard title="Total stars" subtitle={`${score * 10} stars`} icon="⭐" gradient={['#4FACFE', '#00F2FE']} />
      <KidCard title="Lessons completed" subtitle="18 lessons" icon="📘" gradient={['#FF6B9D', '#C06FF8']} />
      <KidCard title="Current streak" subtitle="5 days 🔥" icon="🔥" gradient={['#FFA500', '#FF6347']} />
      <Text style={styles.heading}>Badge Gallery</Text>
      <View style={styles.badges}>
        <Badge title="Math Hero" unlocked />
        <Badge title="Science Star" unlocked />
        <Badge title="Reading Rocket" />
      </View>
      <Text style={styles.timeline}>🎉 Achievement unlocked: Quiz Challenger!</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30 },
  heading: { color: '#fff', fontSize: 20, fontWeight: '900', marginVertical: 12 },
  badges: { flexDirection: 'row', gap: 10 },
  timeline: { marginTop: 14, color: '#fff', fontWeight: '800', fontSize: 16 },
});
