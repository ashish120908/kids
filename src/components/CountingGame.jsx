import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { randomInt, generateMultipleChoices } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const EMOJIS = ['🍎', '🌟', '🎈', '🐶', '🦋', '🌸', '🍕', '🚗', '⚽', '🎵', '🐱', '🦄'];
const TOTAL = 10;

function generateRound(level) {
  const cfg = getLevelConfig('counting', level);
  const count = randomInt(1, cfg.maxCount);
  const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
  const choices = generateMultipleChoices(count, Math.max(1, count - 5), Math.min(cfg.maxCount, count + 5), cfg.choiceCount);
  return { count, emoji, choices };
}

export default function CountingGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const startGame = (lvl) => {
    setLevel(lvl);
    setRounds(Array.from({ length: TOTAL }, () => generateRound(lvl)));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setPhase('play');
  };

  const handleAnswer = useCallback((num) => {
    if (feedback) return;
    const correct = num === rounds[current].count;
    setSelected(num);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      playCorrect();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      playWrong();
    }
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score + (correct ? 1 : 0);
      if (current + 1 >= TOTAL) {
        saveScore('counting', level, newScore, TOTAL);
        setScore(newScore);
        playGameComplete();
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, rounds, current, score, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="counting" gameTitle="Counting Game" gameEmoji="🔢" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Counting Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const round = rounds[current];
  const cfg = getLevelConfig('counting', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid choices-grid-2x2';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Counting Game 🔢</h2>
      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>How many are there?</p>
        <div className="emoji-grid">
          {Array.from({ length: round.count }, (_, i) => (
            <span key={i} className="counting-emoji">{round.emoji}</span>
          ))}
        </div>
      </div>
      <div className={gridClass}>
        {round.choices.map(num => {
          let cls = 'btn choice-btn';
          if (selected === num) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && num === round.count) cls += ' correct-answer';
          return (
            <button key={num} className={cls} onClick={() => handleAnswer(num)} style={{ fontSize: 32 }}>
              {num}
            </button>
          );
        })}
      </div>
      <p className="score-display-inline">Score: {score}</p>
    </div>
  );
}
