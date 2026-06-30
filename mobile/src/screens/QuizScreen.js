import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import KidButton from '../components/KidButton';
import quizzes from '../data/quizzes.json';
import { hapticError, hapticSuccess, hapticTap } from '../utils/haptics';

export default function QuizScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const item = useMemo(() => quizzes[index], [index]);

  const choose = option => {
    hapticTap();
    const correct = option === item.answer;
    if (correct) {
      setScore(v => v + 1);
      hapticSuccess();
    } else {
      setLives(v => Math.max(0, v - 1));
      hapticError();
    }

    if (index >= 4 || lives === 1 && !correct) {
      navigation.navigate('Main', { screen: 'Progress', params: { score: correct ? score + 1 : score } });
      return;
    }

    setIndex(v => v + 1);
  };

  return (
    <View style={styles.container}>
      <Header title="Quiz Time 🧠" subtitle={`Lives: ${'❤️'.repeat(lives)}${'🤍'.repeat(3 - lives)}  •  Score: ${score}`} />
      <View style={styles.card}>
        <Text style={styles.question}>{item.question}</Text>
        <View style={styles.answers}>
          {item.options.map(option => (
            <KidButton key={option} title={option} colors={['#FFA500', '#FF6347']} onPress={() => choose(option)} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', padding: 16 },
  question: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 34, marginBottom: 16 },
  answers: { gap: 10 },
});
