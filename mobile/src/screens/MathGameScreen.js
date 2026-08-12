import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AdBannerMobile from '../components/AdBannerMobile';
import { generateMathQuestionMobile, recordQuestionAnswered } from '../utils/mobileQuestionEngine';
import { playMobileCorrect, playMobileError, playMobileTap } from '../utils/mobileSoundManager';

export default function MathGameScreen({ route, navigation }) {
  const mode = route.params?.mode || 'addition';
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadQuestion = async () => {
    setSelected(null);
    setFeedback(null);
    const q = await generateMathQuestionMobile(mode, Math.min(3, Math.floor(round / 3) + 1));
    setQuestion(q);
  };

  useEffect(() => {
    loadQuestion();
  }, [round, mode]);

  const handleSelect = async (opt) => {
    if (feedback || !question) return;
    playMobileTap();
    setSelected(opt);
    const isCorrect = opt === question.answer;

    if (isCorrect) {
      playMobileCorrect();
      setFeedback('correct');
      setScore(s => s + 1);
      await recordQuestionAnswered(mode, question.id);
    } else {
      playMobileError();
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (round >= 10) {
        navigation.navigate('Main', { screen: 'Progress', params: { game: mode, score: isCorrect ? score + 1 : score } });
      } else {
        setRound(r => r + 1);
      }
    }, 900);
  };

  return (
    <View style={styles.container}>
      <Header title={`Math Master ➕ (${mode.toUpperCase()})`} subtitle={`Question ${round} of 10 • ⭐ Score: ${score}`} />

      {question && (
        <View style={styles.card}>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsGrid}>
            {question.options.map(opt => {
              let btnStyle = [styles.optionBtn];
              if (selected === opt) {
                btnStyle.push(feedback === 'correct' ? styles.correctBtn : styles.wrongBtn);
              } else if (feedback === 'wrong' && opt === question.answer) {
                btnStyle.push(styles.correctBtn);
              }
              return (
                <TouchableOpacity key={opt} style={btnStyle} onPress={() => handleSelect(opt)}>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <AdBannerMobile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 16,
  },
  questionText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionBtn: {
    width: '45%',
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  correctBtn: { backgroundColor: '#4CD964' },
  wrongBtn: { backgroundColor: '#FF3B30' },
  optionText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
});
