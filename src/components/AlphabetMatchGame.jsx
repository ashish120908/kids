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
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
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

  // Clear any pending feedback timer if the child navigates away mid-round.
  useEffect(() => () => clearTimeout(timerRef.current), []);

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

  // Skipping used to restart the whole game on the last round, throwing away
  // the score. Now it finishes the round properly; the skipped one just
  // doesn't count.
  const handleNext = () => {
    clearTimeout(timerRef.current);
    setFeedback(null);
    setWrongLetter(null);
    setShowConfetti(false);
    if (roundNum + 1 < TOTAL_ROUNDS) {
      setRoundNum(r => r + 1);
      setRound(generateRound(level));
    } else {
      saveScore('alphabet', level, score, TOTAL_ROUNDS);
      playGameComplete();
      setPhase('done');
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
        onPickLevel={() => setPhase('pick')}
        onHome={() => navigate('/')}
      />
    );
  }

  const remaining = round.shuffled.filter(l => !round.placed.includes(l));

  return (
    <SpaceGameLayout
      gameTitle="Alphabet"
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
      <div className="placed-row">
        {round.placed.map((l, i) => (
          <span key={i} className="placed-tile">{l}</span>
        ))}
        {round.placed.length < round.letters.length && (
          <span className="placed-tile placed-tile-blank" aria-label="next letter">?</span>
        )}
      </div>

      <div className="tile-grid">
        {remaining.map((letter) => (
          <button
            key={letter}
            className={`letter-tile${wrongLetter === letter ? ' letter-tile-wrong' : ''}`}
            onClick={() => handleTap(letter)}
            aria-label={`Letter ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
    </SpaceGameLayout>
  );
}
