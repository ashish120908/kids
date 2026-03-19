import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import { saveScore } from '../utils/scoreManager'
import { shuffle, randomInt } from '../utils/gameHelpers'
import '../styles/Games.css'

const COLORS = [
  { name: 'RED', hex: '#FF4444' },
  { name: 'BLUE', hex: '#4444FF' },
  { name: 'GREEN', hex: '#22AA22' },
  { name: 'YELLOW', hex: '#FFCC00' },
  { name: 'PURPLE', hex: '#9944CC' },
  { name: 'ORANGE', hex: '#FF8800' },
  { name: 'PINK', hex: '#FF66AA' },
  { name: 'TEAL', hex: '#00AAAA' },
];

const TOTAL = 10;

function generateRound() {
  const correctIndex = randomInt(0, COLORS.length - 1);
  const correct = COLORS[correctIndex];
  const others = shuffle(COLORS.filter((_, i) => i !== correctIndex)).slice(0, 3);
  const options = shuffle([correct, ...others]);
  return { correct, options };
}

export default function ColorMatchGame() {
  const navigate = useNavigate();
  const [rounds] = useState(() => Array.from({ length: TOTAL }, generateRound));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAnswer = useCallback((color) => {
    if (feedback) return;
    const correct = rounds[current].correct.name === color.name;
    setSelected(color.name);
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
        saveScore('color-match', newScore, TOTAL);
        setScore(newScore);
        setDone(true);
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, rounds, current, score]);

  const restart = () => {
    window.location.reload();
  };

  if (done) {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Color Match"
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
        <p style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>Tap the color:</p>
        <p className="color-word" style={{ color: round.correct.hex }}>{round.correct.name}</p>
      </div>
      <div className="choices-grid choices-grid-2x2">
        {round.options.map(color => {
          let cls = 'color-circle-btn';
          if (selected === color.name) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && color.name === round.correct.name) cls += ' correct-answer';
          return (
            <button
              key={color.name}
              className={cls}
              style={{ background: color.hex }}
              onClick={() => handleAnswer(color)}
              aria-label={color.name}
            />
          );
        })}
      </div>
      <p className="score-display-inline">Score: {score}</p>
    </div>
  );
}
