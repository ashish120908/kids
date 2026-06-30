import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Header from '../components/Header';
import KidCard from '../components/KidCard';
import ProgressBar from '../components/ProgressBar';
import subjects from '../data/subjects.json';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Welcome back, Superstar! ✨" subtitle="🔥 5-day streak • 22 stars today" />
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>⏱️ 34 min today</Text>
        <Text style={styles.statsText}>🏆 12 badges</Text>
      </View>
      <Text style={styles.sectionTitle}>Pick a subject</Text>
      <View style={styles.subjectListWrap}>
        <FlashList
          numColumns={2}
          data={subjects}
          estimatedItemSize={160}
          renderItem={({ item }) => (
            <View style={styles.subjectItem}>
              <KidCard
                title={item.title}
                subtitle="Tap to continue"
                icon={item.icon}
                gradient={item.gradient}
                rightNode={<Text style={styles.progressBadge}>{item.progress}%</Text>}
              />
              <ProgressBar progress={item.progress} />
            </View>
          )}
        />
      </View>
      <Text style={styles.sectionTitle}>Continue learning 📘</Text>
      <KidCard
        title="Addition Basics"
        subtitle="Last visited 2h ago"
        icon="🚀"
        gradient={['#4FACFE', '#00F2FE']}
        rightNode={<Text style={styles.link} onPress={() => navigation.navigate('Lesson')}>Open</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statsText: { color: '#fff', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8, marginTop: 12 },
  subjectListWrap: { height: 420 },
  subjectItem: { flex: 1, margin: 6 },
  progressBadge: { color: '#fff', fontWeight: '900', fontSize: 14 },
  link: { color: '#fff', fontWeight: '900', textDecorationLine: 'underline' },
});
