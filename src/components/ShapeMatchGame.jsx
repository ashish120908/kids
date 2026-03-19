import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import { saveScore } from '../utils/scoreManager'
import { shuffle, randomInt } from '../utils/gameHelpers'
import '../styles/Games.css'

const SHAPES = [
  { name: 'Circle', svg: <circle cx="60" cy="60" r="50" /> },
  { name: 'Square', svg: <rect x="10" y="10" width="100" height="100" /> },
  { name: 'Triangle', svg: <polygon points="60,10 110,110 10,110" /> },
  { name: 'Star', svg: <polygon points="60,5 72,40 110,40 80,62 92,98 60,75 28,98 40,62 10,40 48,40" /> },
  { name: 'Diamond', svg: <polygon points="60,5 110,60 60,115 10,60" /> },
  { name: 'Hexagon', svg: <polygon points="60,5 100,27.5 100,92.5 60,115 20,92.5 20,27.5" /> },
  { name: 'Pentagon', svg: <polygon points="60,5 110,42 92,100 28,100 10,42" /> },
  { name: 'Rectangle', svg: <rect x="5" y="25" width="110" height="70" /> },
];

const COLORS_LIST = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA07A'];
const TOTAL = 10;

function generateRound() {
  const correctIdx = randomInt(0, SHAPES.length - 1);
  const correct = SHAPES[correctIdx];
  const others = shuffle(SHAPES.filter((_, i) => i !== correctIdx)).slice(0, 3);
  const options = shuffle([correct, ...others]);
  const color = COLORS_LIST[randomInt(0, COLORS_LIST.length - 1)];
  return { correct, options, color };
}

export default function ShapeMatchGame() {
  const navigate = useNavigate();
  const [rounds] = useState(() => Array.from({ length: TOTAL }, generateRound));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAnswer = useCallback((shapeName) => {
    if (feedback) return;
    const correct = shapeName === rounds[current].correct.name;
    setSelected(shapeName);
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
        saveScore('shape-match', newScore, TOTAL);
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
        gameName="Shape Match"
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
        <p style={{ fontSize: 18, color: '#666', marginBottom: 12 }}>What shape is this?</p>
        <svg
          viewBox="0 0 120 120"
          width="140"
          height="140"
          style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.15))' }}
        >
          {React.cloneElement(round.correct.svg, { fill: round.color })}
        </svg>
      </div>
      <div className="choices-grid choices-grid-2x2">
        {round.options.map(shape => {
          let cls = 'btn choice-btn shape-choice-btn';
          if (selected === shape.name) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && shape.name === round.correct.name) cls += ' correct-answer';
          return (
            <button key={shape.name} className={cls} onClick={() => handleAnswer(shape.name)}>
              {shape.name}
            </button>
          );
        })}
      </div>
      <p className="score-display-inline">Score: {score}</p>
    </div>
  );
}
