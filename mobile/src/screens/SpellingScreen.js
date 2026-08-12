import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AdBannerMobile from '../components/AdBannerMobile';
import { playMobileCorrect, playMobileError, playMobileTap } from '../utils/mobileSoundManager';

const SPELLING_DATA = [
  { word: 'CAT', hint: '🐱 Meow animal', letters: ['C', 'A', 'T', 'O', 'B'] },
  { word: 'DOG', hint: '🐶 Barking pet', letters: ['D', 'O', 'G', 'S', 'P'] },
  { word: 'SUN', hint: '☀️ Bright star', letters: ['S', 'U', 'N', 'A', 'T'] },
  { word: 'STAR', hint: '⭐ Night sky', letters: ['S', 'T', 'A', 'R', 'E'] },
  { word: 'FISH', hint: '🐟 Swimmer', letters: ['F', 'I', 'S', 'H', 'L'] },
];

export default function SpellingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [userLetters, setUserLetters] = useState([]);
  const [score, setScore] = useState(0);
  const current = SPELLING_DATA[index];

  const handleLetterTap = (letter) => {
    playMobileTap();
    if (userLetters.length < current.word.length) {
      setUserLetters([...userLetters, letter]);
    }
  };

  const handleClear = () => {
    playMobileTap();
    setUserLetters([]);
  };

  const handleCheck = () => {
    const attempt = userLetters.join('');
    if (attempt === current.word) {
      playMobileCorrect();
      setScore(s => s + 1);
      setTimeout(() => {
        if (index + 1 >= SPELLING_DATA.length) {
          navigation.navigate('Main', { screen: 'Progress', params: { game: 'spelling', score: score + 1 } });
        } else {
          setIndex(i => i + 1);
          setUserLetters([]);
        }
      }, 700);
    } else {
      playMobileError();
      setUserLetters([]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Spelling Bee 🐝" subtitle={`Word ${index + 1} of ${SPELLING_DATA.length}  •  ⭐ Score: ${score}`} />

      <View style={styles.card}>
        <Text style={styles.hintText}>{current.hint}</Text>

        <View style={styles.wordSlots}>
          {Array.from({ length: current.word.length }).map((_, i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotText}>{userLetters[i] || '_'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tilesGrid}>
          {current.letters.map((letter, i) => (
            <TouchableOpacity key={i} style={styles.tileBtn} onPress={() => handleLetterTap(letter)}>
              <Text style={styles.tileText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.actionText}>Clear ❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
            <Text style={styles.actionText}>Check ✅</Text>
          </TouchableOpacity>
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
  hintText: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  wordSlots: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  slot: {
    width: 48,
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  slotText: { color: '#333', fontSize: 28, fontWeight: '900' },
  tilesGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  tileBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  tileText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  actionsRow: { flexDirection: 'row', gap: 16 },
  clearBtn: { backgroundColor: '#E53935', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  checkBtn: { backgroundColor: '#43A047', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
