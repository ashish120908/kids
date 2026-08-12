import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AdBannerMobile from '../components/AdBannerMobile';
import { playMobileCorrect, playMobileError, playMobileTap } from '../utils/mobileSoundManager';

const PATTERN_DATA = [
  { sequence: ['🍎', '🍌', '🍎', '❓'], answer: '🍌', options: ['🍎', '🍌', '🍇', '🍊'] },
  { sequence: ['⭐', '⭐', '🎈', '❓'], answer: '🎈', options: ['⭐', '🎈', '🌸', '🎁'] },
  { sequence: ['🐶', '🐱', '🐶', '❓'], answer: '🐱', options: ['🐶', '🐱', '🐰', '🦁'] },
  { sequence: ['🔴', '🔵', '🔴', '❓'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'] },
];

export default function CountingPatternScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const current = PATTERN_DATA[index];

  const handleSelect = (choice) => {
    playMobileTap();
    if (choice === current.answer) {
      playMobileCorrect();
      setScore(s => s + 1);
      setTimeout(() => {
        if (index + 1 >= PATTERN_DATA.length) {
          navigation.navigate('Main', { screen: 'Progress', params: { game: 'counting-pattern', score: score + 1 } });
        } else {
          setIndex(i => i + 1);
        }
      }, 700);
    } else {
      playMobileError();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Counting & Patterns 🔢" subtitle={`Pattern ${index + 1} of ${PATTERN_DATA.length}  •  ⭐ Score: ${score}`} />

      <View style={styles.card}>
        <Text style={styles.title}>What comes next in the pattern?</Text>

        <View style={styles.sequenceRow}>
          {current.sequence.map((item, i) => (
            <View key={i} style={styles.itemBox}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.optionsGrid}>
          {current.options.map(opt => (
            <TouchableOpacity key={opt} style={styles.optionBtn} onPress={() => handleSelect(opt)}>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  title: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  sequenceRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  itemBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  itemText: { fontSize: 32 },
  optionsGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  optionBtn: {
    width: '42%',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  optionText: { fontSize: 34 },
});
