import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import KidButton from '../components/KidButton';

const steps = [
  { title: '1. Count apples 🍎', body: 'There are 3 apples in the basket. Add 2 more.' },
  { title: '2. Solve it 🧠', body: '3 + 2 = 5. Great job!' },
  { title: '3. Practice ✍️', body: 'Try making your own addition story.' },
];

export default function LessonScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const item = useMemo(() => steps[index], [index]);

  return (
    <View style={styles.container}>
      <Header title="Interactive Lesson 📖" subtitle="Swipe-style step cards with smooth transitions" />
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.audio}>🔊 Tap for audio narration</Text>
      </View>
      <View style={styles.buttons}>
        <KidButton title="Previous" colors={['#4FACFE', '#00F2FE']} onPress={() => setIndex(Math.max(0, index - 1))} />
        {index < steps.length - 1 ? (
          <KidButton title="Next" colors={['#FF6B9D', '#C06FF8']} onPress={() => setIndex(index + 1)} />
        ) : (
          <KidButton title="Finish 🎉" colors={['#00D9A3', '#4FACFE']} onPress={() => navigation.navigate('Quiz')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.28)', borderColor: 'rgba(255,255,255,0.48)', borderWidth: 1, borderRadius: 24, padding: 18 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  body: { color: '#fff', fontSize: 17, lineHeight: 26, fontWeight: '600' },
  audio: { marginTop: 14, color: '#fff', fontWeight: '800' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});
