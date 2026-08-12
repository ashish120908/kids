import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AdBannerMobile from '../components/AdBannerMobile';
import { generateColorShapeQuestionMobile, recordQuestionAnswered } from '../utils/mobileQuestionEngine';
import { playMobileCorrect, playMobileError, playMobileTap } from '../utils/mobileSoundManager';

export default function ColorShapeScreen({ navigation }) {
  const [qData, setQData] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadQuestion = async () => {
    setSelected(null);
    setFeedback(null);
    const q = await generateColorShapeQuestionMobile();
    setQData(q);
  };

  useEffect(() => {
    loadQuestion();
  }, [round]);

  const handleSelect = async (item) => {
    if (feedback || !qData) return;
    playMobileTap();
    setSelected(item.id);
    const isCorrect = item.id === qData.target.id;

    if (isCorrect) {
      playMobileCorrect();
      setFeedback('correct');
      setScore(s => s + 1);
      await recordQuestionAnswered('colorshape', qData.target.id);
    } else {
      playMobileError();
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (round >= 8) {
        navigation.navigate('Main', { screen: 'Progress', params: { game: 'color-shape', score: isCorrect ? score + 1 : score } });
      } else {
        setRound(r => r + 1);
      }
    }, 900);
  };

  return (
    <View style={styles.container}>
      <Header title="Color & Shape Match 🎨" subtitle={`Round ${round} of 8 • ⭐ Score: ${score}`} />

      {qData && (
        <View style={styles.card}>
          <Text style={styles.targetLabel}>Tap the {qData.target.name}:</Text>
          <View style={[styles.targetBox, { backgroundColor: qData.target.hex }]}>
            <Text style={styles.targetIcon}>{qData.target.icon}</Text>
          </View>

          <View style={styles.optionsGrid}>
            {qData.options.map(item => {
              let btnStyle = [styles.optionBtn];
              if (selected === item.id) {
                btnStyle.push(feedback === 'correct' ? styles.correctBtn : styles.wrongBtn);
              } else if (feedback === 'wrong' && item.id === qData.target.id) {
                btnStyle.push(styles.correctBtn);
              }
              return (
                <TouchableOpacity key={item.id} style={btnStyle} onPress={() => handleSelect(item)}>
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <Text style={styles.optionName}>{item.name}</Text>
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
  targetLabel: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 10 },
  targetBox: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
  },
  targetIcon: { fontSize: 48 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionBtn: {
    width: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  correctBtn: { backgroundColor: '#4CD964' },
  wrongBtn: { backgroundColor: '#FF3B30' },
  optionIcon: { fontSize: 32 },
  optionName: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
});
