import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import '../styles/Games.css'

const TOTAL_ROUNDS = 10;
const LETTERS_PER_ROUND = 6;
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function generateRound() {
  const start = Math.floor(Math.random() * (ALL_LETTERS.length - LETTERS_PER_ROUND));
  const letters = ALL_LETTERS.slice(start, start + LETTERS_PER_ROUND);
  return { letters, shuffled: shuffle([...letters]), placed: [] };
}

export default function AlphabetMatchGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('play');
  const [round, setRound] = useState(generateRound);
  const [roundNum, setRoundNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [wrongLetter, setWrongLetter] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const resetGame = () => {
    setPhase('play');
    setRound(generateRound());
    setRoundNum(0);
    setScore(0);
    setFeedback(null);
    setWrongLetter(null);
  };

  const handleTap = useCallback((letter) => {
    if (feedback) return;
    const nextExpected = round.letters[round.placed.length];
    if (letter === nextExpected) {
      const newPlaced = [...round.placed, letter];
      setRound(r => ({ ...r, placed: newPlaced }));
      setFeedback('correct');
      setShowConfetti(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setFeedback(null);
        if (newPlaced.length === round.letters.length) {
          const newScore = score + 1;
          const newRound = roundNum + 1;
          if (newRound >= TOTAL_ROUNDS) {
            saveScore('alphabet', newScore, TOTAL_ROUNDS);
            setScore(newScore);
            setPhase('done');
          } else {
            setScore(newScore);
            setRoundNum(newRound);
            setRound(generateRound());
          }
        }
      }, 700);
    } else {
      setWrongLetter(letter);
      setFeedback('wrong');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setWrongLetter(null);
      }, 700);
    }
  }, [feedback, round, score, roundNum]);

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL_ROUNDS}
        gameName="Alphabet Match"
        onPlayAgain={resetGame}
        onHome={() => navigate('/')}
      />
    );
  }

  const remaining = round.shuffled.filter(l => !round.placed.includes(l));

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(roundNum / TOTAL_ROUNDS) * 100}%` }} />
      </div>
      <p className="progress-text">{roundNum + 1} / {TOTAL_ROUNDS}</p>
      <h2 className="game-title">Alphabet Match 🔤</h2>
      <p className="game-subtitle">Tap the letters in A–Z order!</p>

      <div className="card" style={{ width: '100%', padding: '20px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px', fontFamily: "'Nunito', sans-serif" }}>
          Place in order:
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', minHeight: 56 }}>
          {round.placed.map((l, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 12,
              background: '#4ECDC4', color: 'white',
              fontFamily: "'Fredoka One', cursive", fontSize: 26,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>{l}</span>
          ))}
          {round.placed.length < round.letters.length && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 12,
              border: '3px dashed #4ECDC4', color: '#4ECDC4',
              fontFamily: "'Fredoka One', cursive", fontSize: 26
            }}>?</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 420 }}>
        {remaining.map((letter) => {
          const isWrong = wrongLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => handleTap(letter)}
              aria-label={`Letter ${letter}`}
              style={{
                width: 68, height: 68,
                borderRadius: 16,
                border: 'none',
                background: isWrong ? '#FF6B6B' : 'white',
                color: isWrong ? 'white' : '#333',
                fontFamily: "'Fredoka One', cursive",
                fontSize: 30,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transform: isWrong ? 'scale(0.88)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <p className="score-display-inline">Score: {score}</p>
      <AdBanner />
    </div>
  );
}
