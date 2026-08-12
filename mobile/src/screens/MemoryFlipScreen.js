import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AdBannerMobile from '../components/AdBannerMobile';
import { playMobileCorrect, playMobileError, playMobileTap, playMobileLevelUp } from '../utils/mobileSoundManager';

const CARDS_DATA = ['🐶', '🐱', '🦁', '🐸', '🍎', '⭐'];

export default function MemoryFlipScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const deck = [...CARDS_DATA, ...CARDS_DATA]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardPress = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    playMobileTap();

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].emoji === cards[secondId].emoji) {
        playMobileCorrect();
        const newMatched = [...matched, firstId, secondId];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length === cards.length) {
          playMobileLevelUp();
          setTimeout(() => {
            navigation.navigate('Main', { screen: 'Progress', params: { game: 'memory-flip', score: 3 } });
          }, 1200);
        }
      } else {
        playMobileError();
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Memory Flip 🃏" subtitle={`Matches: ${matched.length / 2} of 6  •  Moves: ${moves}`} />

      <View style={styles.grid}>
        {cards.map(card => {
          const isOpen = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.cardBtn, isOpen && styles.cardOpen]}
              onPress={() => handleCardPress(card.id)}
            >
              <Text style={styles.cardText}>{isOpen ? card.emoji : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <AdBannerMobile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 20,
  },
  cardBtn: {
    width: '28%',
    height: 90,
    backgroundColor: '#8E24AA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 2,
    borderColor: '#AB47BC',
  },
  cardOpen: {
    backgroundColor: '#FFF',
    borderColor: '#FFD700',
  },
  cardText: { fontSize: 36 },
});
