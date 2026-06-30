import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import KidCard from '../components/KidCard';
import StarRating from '../components/StarRating';
import lessons from '../data/lessons.json';

export default function SubjectScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Math Mission Map 🗺️" subtitle="Complete topics to unlock new adventures" />
      {lessons.filter(item => item.subject === 'math').map((lesson, index) => {
        const unlocked = index < 2;
        return (
          <View key={lesson.id} style={styles.row}>
            <View style={[styles.pathDot, unlocked ? styles.pathOn : styles.pathOff]} />
            <View style={styles.cardWrap}>
              <KidCard
                title={lesson.title}
                subtitle={unlocked ? 'Ready to play' : 'Locked - finish previous lesson'}
                icon={unlocked ? '🔓' : '🔒'}
                gradient={unlocked ? ['#FF6B9D', '#C06FF8'] : ['#8B8B9E', '#666679']}
                rightNode={<Text style={styles.percent}>{unlocked ? '80%' : '0%'}</Text>}
              />
              <StarRating rating={unlocked ? 2 : 0} />
            </View>
          </View>
        );
      })}
      <Text onPress={() => navigation.navigate('Lesson')} style={styles.openLesson}>Start lesson ➜</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  pathDot: { width: 12, height: 12, borderRadius: 999, marginTop: 22 },
  pathOn: { backgroundColor: '#00D9A3' },
  pathOff: { backgroundColor: '#B8B8D5' },
  percent: { color: '#fff', fontWeight: '900' },
  cardWrap: { flex: 1 },
  openLesson: { marginTop: 14, color: '#fff', fontWeight: '900', fontSize: 18, textDecorationLine: 'underline' },
});
