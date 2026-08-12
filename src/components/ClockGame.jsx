import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle, randomInt, generateUniqueItems } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

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

  const choices = [answer];
  while (choices.length < 4) {
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

function AnalogClock({ hours, minutes }) {
  const cx = 100, cy = 100, r = 85;
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  function handCoords(angle, length) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * length,
      y: cy + Math.sin(rad) * length,
    };
  }

  const hourTip = handCoords(hourAngle, 48);
  const minuteTip = handCoords(minuteAngle, 68);

  return (
    <svg viewBox="0 0 200 200" width="160" height="160" style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}>
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#7C4DFF" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        const angle = (num / 12) * 360;
        const rad = ((angle - 90) * Math.PI) / 180;
        const mx = cx + Math.cos(rad) * 68;
        const my = cy + Math.sin(rad) * 68;
        return (
          <text
            key={num}
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fontWeight="bold"
            fill="#251043"
            fontFamily="'Fredoka One', cursive"
          >
            {num}
          </text>
        );
      })}
      <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke="#251043" strokeWidth="7" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteTip.x} y2={minuteTip.y} stroke="#E040FB" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#FFD700" />
    </svg>
  );
}

export default function ClockGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('play');
  const [level, setLevel] = useState(1);
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
    setQuestions(generateUniqueItems(TOTAL, () => generateQuestion(lvl), q => `${q.hours}:${q.minutes}`));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setPhase('play');
  };

  useEffect(() => {
    startGame(1);
  }, []);

  const handleAnswer = useCallback((choice) => {
    if (feedback) return;
    const q = questions[current];
    if (!q) return;
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

  const handleNext = () => {
    if (current + 1 < TOTAL) {
      setSelected(null);
      setFeedback(null);
      setCurrent(c => c + 1);
    } else {
      startGame(level);
    }
  };

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
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { hours: 3, minutes: 0, answer: '3:00', choices: ['3:00', '4:15', '2:30', '1:00'] };

  return (
    <SpaceGameLayout
      gameTitle="Clock Reading"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText="What time does clock show?"
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ marginBottom: 20 }}>
        <AnalogClock hours={q.hours} minutes={q.minutes} />
      </div>

      <div className="candy-buttons-container">
        {q.choices.map((choice, idx) => {
          let status = null;
          if (selected === choice) {
            status = feedback === 'correct' ? 'correct' : 'wrong';
          } else if (feedback === 'wrong' && choice === q.answer) {
            status = 'correct';
          }

          return (
            <CandyButton
              key={choice}
              value={choice}
              index={idx}
              status={status}
              onClick={() => handleAnswer(choice)}
            />
          );
        })}
      </div>
    </SpaceGameLayout>
  );
}
