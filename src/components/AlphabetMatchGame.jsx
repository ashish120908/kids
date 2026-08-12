import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const TOTAL_ROUNDS = 10;
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function generateRound(level) {
  const cfg = getLevelConfig('alphabet', level);
  const n = cfg.lettersPerRound;
  let letters;
  if (cfg.nonConsecutive) {
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
  const [phase, setPhase] = useState('play');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(generateRound(1));
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

  useEffect(() => {
    startGame(1);
  }, []);

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

  const handleNext = () => {
    if (roundNum + 1 < TOTAL_ROUNDS) {
      setRoundNum(r => r + 1);
      setRound(generateRound(level));
    } else {
      startGame(level);
    }
  };

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
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const remaining = round.shuffled.filter(l => !round.placed.includes(l));

  return (
    <SpaceGameLayout
      gameTitle="Alphabet Match"
      level={level}
      current={roundNum}
      total={TOTAL_ROUNDS}
      score={score}
      showConfetti={showConfetti}
      questionText="Tap letters in A–Z order!"
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', minHeight: 64, marginBottom: 28 }}>
        {round.placed.map((l, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #00E676, #00B0FF)', color: 'white',
            fontFamily: "'Fredoka One', cursive", fontSize: 32,
            boxShadow: '0 6px 18px rgba(0, 230, 118, 0.4)',
            border: '2px solid #ffffff'
          }}>{l}</span>
        ))}
        {round.placed.length < round.letters.length && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 18,
            border: '2px dashed rgba(255, 255, 255, 0.5)', color: '#00E676',
            fontFamily: "'Fredoka One', cursive", fontSize: 32
          }}>?</span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', maxWidth: 480 }}>
        {remaining.map((letter) => {
          const isWrong = wrongLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => handleTap(letter)}
              style={{
                width: 72, height: 72,
                borderRadius: 20,
                border: '2px solid rgba(255,255,255,0.4)',
                background: isWrong ? '#FF5252' : 'linear-gradient(135deg, #7C4DFF, #651FFF)',
                color: '#ffffff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: 34,
                boxShadow: '0 8px 20px rgba(101,31,255,0.4)',
                cursor: 'pointer',
                transform: isWrong ? 'scale(0.88)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </SpaceGameLayout>
  );
}
