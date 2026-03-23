import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { shuffle, randomInt } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const TOTAL = 10;

function formatTime(hours, minutes) {
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

function generateQuestion(level) {
  const cfg = getLevelConfig('clock', level);
  const step = cfg.minuteStep;
  const totalSteps = 60 / step;
  const minuteIndex = randomInt(0, totalSteps - 1);
  const minutes = minuteIndex * step;
  const hours = randomInt(1, 12);

  const answer = formatTime(hours, minutes);

  // Generate wrong choices (different times)
  const choices = [answer];
  while (choices.length < cfg.choiceCount) {
    const wHours = randomInt(1, 12);
    const wMinuteIndex = randomInt(0, totalSteps - 1);
    const wMinutes = wMinuteIndex * step;
    const candidate = formatTime(wHours, wMinutes);
    if (!choices.includes(candidate)) {
      choices.push(candidate);
    }
  }

  return { hours, minutes, answer, choices: shuffle(choices) };
}

// SVG Analog Clock component
function AnalogClock({ hours, minutes }) {
  const cx = 100, cy = 100, r = 90;
  // Angles: 0 = 12 o'clock, clockwise
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  function handCoords(angle, length) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * length,
      y: cy + Math.sin(rad) * length,
    };
  }

  const hourTip = handCoords(hourAngle, 50);
  const minuteTip = handCoords(minuteAngle, 70);

  return (
    <svg viewBox="0 0 200 200" width="180" height="180" style={{ display: 'block', margin: '0 auto' }}>
      {/* Clock face */}
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#333" strokeWidth="4" />
      {/* Hour markers & numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        const angle = (num / 12) * 360;
        const rad = ((angle - 90) * Math.PI) / 180;
        const mx = cx + Math.cos(rad) * 76;
        const my = cy + Math.sin(rad) * 76;
        return (
          <text
            key={num}
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
            fontFamily="'Fredoka One', cursive"
          >
            {num}
          </text>
        );
      })}
      {/* Minute tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * 360;
        const rad = ((angle - 90) * Math.PI) / 180;
        const isHour = i % 5 === 0;
        const inner = isHour ? 80 : 84;
        const outer = 90;
        return (
          <line
            key={i}
            x1={cx + Math.cos(rad) * inner}
            y1={cy + Math.sin(rad) * inner}
            x2={cx + Math.cos(rad) * outer}
            y2={cy + Math.sin(rad) * outer}
            stroke={isHour ? '#333' : '#aaa'}
            strokeWidth={isHour ? 2 : 1}
          />
        );
      })}
      {/* Hour hand */}
      <line
        x1={cx} y1={cy}
        x2={hourTip.x} y2={hourTip.y}
        stroke="#222" strokeWidth="6" strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1={cx} y1={cy}
        x2={minuteTip.x} y2={minuteTip.y}
        stroke="#555" strokeWidth="3" strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill="#e74c3c" />
    </svg>
  );
}

export default function ClockGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);
  const confettiTimerRef = useRef(null);

  const startGame = (lvl) => {
    clearTimeout(timerRef.current);
    clearTimeout(confettiTimerRef.current);
    setLevel(lvl);
    setQuestions(Array.from({ length: TOTAL }, () => generateQuestion(lvl)));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setPhase('play');
  };

  const handleAnswer = useCallback((choice) => {
    if (feedback) return;
    const q = questions[current];
    const correct = choice === q.answer;
    setSelected(choice);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      playCorrect();
      setShowConfetti(true);
      clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 1200);
    } else {
      playWrong();
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score + (correct ? 1 : 0);
      if (current + 1 >= TOTAL) {
        saveScore('clock', level, newScore, TOTAL);
        setScore(newScore);
        playGameComplete();
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, questions, current, score, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="clock" gameTitle="Clock Reading" gameEmoji="🕐" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Clock Reading"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];
  const cfg = getLevelConfig('clock', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Clock Reading 🕐</h2>

      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 12 }}>What time does the clock show?</p>
        <AnalogClock hours={q.hours} minutes={q.minutes} />
      </div>

      <div className={gridClass}>
        {q.choices.map(choice => {
          let cls = 'btn choice-btn';
          if (selected === choice) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && choice === q.answer) cls += ' correct-answer';
          return (
            <button key={choice} className={cls} onClick={() => handleAnswer(choice)}>
              {choice}
            </button>
          );
        })}
      </div>

      <p className="score-display-inline">Score: {score}</p>
      <AdBanner />
    </div>
  );
}
