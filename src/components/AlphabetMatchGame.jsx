import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const TOTAL_ROUNDS = 10;
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function generateRound(level) {
  const cfg = getLevelConfig('alphabet', level);
  const n = cfg.lettersPerRound;
  let letters;
  if (cfg.nonConsecutive) {
    // Pick n random letters from the alphabet, then sort them
    const pool = shuffle([...ALL_LETTERS]);
    letters = pool.slice(0, n).sort();
  } else {
    const start = Math.floor(Math.random() * (ALL_LETTERS.length - n));
    letters = ALL_LETTERS.slice(start, start + n);
  }
  return { letters, shuffled: shuffle([...letters]), placed: [] };
}

export default function AlphabetMatchGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(null);
  const [roundNum, setRoundNum] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [wrongLetter, setWrongLetter] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const startGame = (lvl) => {
    setLevel(lvl);
    setRound(generateRound(lvl));
    setRoundNum(0);
    setScore(0);
    setFeedback(null);
    setWrongLetter(null);
    setShowConfetti(false);
    setPhase('play');
  };

  const handleTap = useCallback((letter) => {
    if (feedback) return;
    const nextExpected = round.letters[round.placed.length];
    if (letter === nextExpected) {
      const newPlaced = [...round.placed, letter];
      setRound(r => ({ ...r, placed: newPlaced }));
      setFeedback('correct');
      playCorrect();
      setShowConfetti(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setFeedback(null);
        if (newPlaced.length === round.letters.length) {
          const newScore = score + 1;
          const newRound = roundNum + 1;
          if (newRound >= TOTAL_ROUNDS) {
            saveScore('alphabet', level, newScore, TOTAL_ROUNDS);
            setScore(newScore);
            playGameComplete();
            setPhase('done');
          } else {
            setScore(newScore);
            setRoundNum(newRound);
            setRound(generateRound(level));
          }
        }
      }, 700);
    } else {
      playWrong();
      setWrongLetter(letter);
      setFeedback('wrong');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setWrongLetter(null);
      }, 700);
    }
  }, [feedback, round, score, roundNum, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="alphabet" gameTitle="Alphabet Match" gameEmoji="🔤" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL_ROUNDS}
        gameName="Alphabet Match"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
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
      <h2 className="game-title">Level {level} — Alphabet Match 🔤</h2>
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
