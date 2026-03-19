import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import { saveScore } from '../utils/scoreManager'
import { randomInt, generateMultipleChoices } from '../utils/gameHelpers'
import '../styles/Games.css'

const EMOJIS = ['🍎', '🌟', '🎈', '🐶', '🦋', '🌸', '🍕', '🚗', '⚽', '🎵', '🐱', '🦄'];
const TOTAL = 10;

function generateRound() {
  const count = randomInt(1, 10);
  const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
  const choices = generateMultipleChoices(count, Math.max(1, count - 3), Math.min(10, count + 3), 4);
  return { count, emoji, choices };
}

export default function CountingGame() {
  const navigate = useNavigate();
  const [rounds] = useState(() => Array.from({ length: TOTAL }, generateRound));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAnswer = useCallback((num) => {
    if (feedback) return;
    const correct = num === rounds[current].count;
    setSelected(num);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score + (correct ? 1 : 0);
      if (current + 1 >= TOTAL) {
        saveScore('counting', newScore, TOTAL);
        setScore(newScore);
        setDone(true);
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, rounds, current, score]);

  const restart = () => window.location.reload();

  if (done) {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Counting Game"
        onPlayAgain={restart}
        onHome={() => navigate('/')}
      />
    );
  }

  const round = rounds[current];
  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>How many are there?</p>
        <div className="emoji-grid">
          {Array.from({ length: round.count }, (_, i) => (
            <span key={i} className="counting-emoji">{round.emoji}</span>
          ))}
        </div>
      </div>
      <div className="choices-grid choices-grid-2x2">
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
