import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import '../styles/Games.css'

const EMOJIS = ['🐱', '🐶', '🐸', '🐻', '🦊', '🐷', '🦁', '🐮'];
const TOTAL_PAIRS = EMOJIS.length;

function buildCards() {
  const pairs = [...EMOJIS, ...EMOJIS];
  return shuffle(pairs).map((value, i) => ({
    id: i,
    value,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryFlipGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(buildCards);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState('play');
  const timerRef = useRef(null);

  const resetGame = () => {
    clearTimeout(timerRef.current);
    setCards(buildCards());
    setFlippedIds([]);
    setMatchedCount(0);
    setMoves(0);
    setLocked(false);
    setShowConfetti(false);
    setPhase('play');
  };

  const handleCardClick = useCallback((card) => {
    if (locked || card.flipped || card.matched) return;

    const newCards = cards.map(c =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    const newFlipped = [...flippedIds, card.id];
    setCards(newCards);
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = newCards.find(c => c.id === firstId);
      const second = newCards.find(c => c.id === secondId);

      if (first.value === second.value) {
        const matched = newCards.map(c =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        );
        const newMatchedCount = matchedCount + 1;
        setCards(matched);
        setFlippedIds([]);
        setMatchedCount(newMatchedCount);
        setShowConfetti(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowConfetti(false), 1000);
        setLocked(false);
        if (newMatchedCount >= TOTAL_PAIRS) {
          saveScore('memory', newMatchedCount, TOTAL_PAIRS);
          setPhase('done');
        }
      } else {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setLocked(false);
        }, 1000);
      }
    }
  }, [locked, cards, flippedIds, matchedCount]);

  if (phase === 'done') {
    const stars = moves <= TOTAL_PAIRS + 2 ? 3 : moves <= TOTAL_PAIRS * 2 ? 2 : 1;
    return (
      <div className="game-container">
        <Confetti active />
        <div className="card" style={{ width: '100%', textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 72, margin: 0 }}>🏆</p>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: '#333', margin: '16px 0 8px' }}>
            You found all pairs!
          </h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, color: '#666', margin: '0 0 8px' }}>
            Completed in <strong>{moves}</strong> moves
          </p>
          <p style={{ fontSize: 40, margin: '12px 0' }}>
            {Array.from({ length: stars }, (_, i) => <span key={i}>⭐</span>)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={resetGame}>🔄 Play Again</button>
            <button className="btn btn-success" onClick={() => navigate('/')}>🏠 Home</button>
          </div>
        </div>
        <AdBanner />
      </div>
    );
  }

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <h2 className="game-title">Memory Flip 🃏</h2>
      <p className="game-subtitle">Find all matching pairs!</p>

      <div style={{
        display: 'flex', justifyContent: 'space-between', width: '100%',
        maxWidth: 380, marginBottom: 4
      }}>
        <span style={{ color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>
          🎯 Pairs: {matchedCount}/{TOTAL_PAIRS}
        </span>
        <span style={{ color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>
          🔢 Moves: {moves}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        width: '100%',
        maxWidth: 380,
      }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            aria-label={card.flipped || card.matched ? card.value : 'hidden card'}
            style={{
              aspectRatio: '1',
              borderRadius: 14,
              border: 'none',
              fontSize: card.flipped || card.matched ? 36 : 28,
              background: card.matched
                ? 'linear-gradient(135deg, #4ECDC4, #45B7D1)'
                : card.flipped
                  ? 'white'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: card.matched ? 'white' : card.flipped ? '#333' : 'white',
              cursor: card.matched || card.flipped ? 'default' : 'pointer',
              boxShadow: card.matched ? '0 2px 8px rgba(78,205,196,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
              transform: card.flipped || card.matched ? 'rotateY(0deg) scale(1)' : 'scale(1)',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {card.flipped || card.matched ? card.value : '❓'}
          </button>
        ))}
      </div>

      <AdBanner />
    </div>
  );
}
