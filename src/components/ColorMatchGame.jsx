import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { shuffle, randomInt } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const ALL_COLORS = [
  { name: 'RED', hex: '#FF4444' },
  { name: 'BLUE', hex: '#4444FF' },
  { name: 'GREEN', hex: '#22AA22' },
  { name: 'YELLOW', hex: '#FFCC00' },
  { name: 'PURPLE', hex: '#9944CC' },
  { name: 'ORANGE', hex: '#FF8800' },
  { name: 'PINK', hex: '#FF66AA' },
  { name: 'TEAL', hex: '#00AAAA' },
  { name: 'BROWN', hex: '#8B4513' },
  { name: 'GRAY', hex: '#888888' },
  { name: 'LIME', hex: '#88CC00' },
  { name: 'NAVY', hex: '#001F7A' },
  { name: 'MAROON', hex: '#800000' },
  { name: 'OLIVE', hex: '#808000' },
];

const TOTAL = 10;

function generateRound(level) {
  const cfg = getLevelConfig('color-match', level);
  const colors = ALL_COLORS.slice(0, cfg.colorCount);
  const correctIndex = randomInt(0, colors.length - 1);
  const correct = colors[correctIndex];
  const others = shuffle(colors.filter((_, i) => i !== correctIndex)).slice(0, cfg.choiceCount - 1);
  const options = shuffle([correct, ...others]);
  return { correct, options };
}

export default function ColorMatchGame() {
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
        saveScore('color-match', level, newScore, TOTAL);
        setScore(newScore);
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, rounds, current, score, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="color-match" gameTitle="Color Match" gameEmoji="🎨" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Color Match"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const round = rounds[current];
  const cfg = getLevelConfig('color-match', level);
  const colCount = cfg.choiceCount <= 2 ? 2 : cfg.choiceCount <= 4 ? 2 : 3;
  const gridStyle = { gridTemplateColumns: `repeat(${colCount}, 1fr)` };

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Color Match 🎨</h2>
      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>Tap the color:</p>
        <p className="color-word" style={{ color: round.correct.hex }}>{round.correct.name}</p>
      </div>
      <div className="choices-grid choices-grid-2x2" style={gridStyle}>
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
