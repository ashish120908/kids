import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const COLORS = [
  { name: 'Red', hex: '#FF4D4D' },
  { name: 'Blue', hex: '#4D79FF' },
  { name: 'Green', hex: '#2ECC71' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Cyan', hex: '#00CED1' }
];

const TOTAL = 10;

export default function ColorMatchGame() {
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

    const generatedList = [];
    for (let i = 0; i < TOTAL; i++) {
      const target = COLORS[Math.floor(Math.random() * COLORS.length)];
      const others = COLORS.filter(c => c.name !== target.name);
      const choices = shuffle([target, ...shuffle(others).slice(0, 3)]);
      generatedList.push({ target, choices });
    }

    setQuestions(generatedList);
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

    const correct = choice.name === q.target.name;
    setSelected(choice.name);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      playCorrect();
      setShowConfetti(true);
      setScore(s => s + 1);
      clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 1400);
    } else {
      playWrong();
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (current + 1 >= TOTAL) {
        saveScore('color-match', level, score + (correct ? 1 : 0), TOTAL);
        playGameComplete();
        setPhase('done');
      } else {
        setCurrent(c => c + 1);
      }
    }, 1100);
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
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { target: COLORS[0], choices: COLORS.slice(0, 4) };

  return (
    <SpaceGameLayout
      gameTitle="Color Match"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText={`Which color is ${q.target.name}?`}
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{
        width: 140, height: 140, borderRadius: 36, background: q.target.hex,
        boxShadow: `0 12px 32px ${q.target.hex}88, inset 0 3px 0 rgba(255,255,255,0.4)`,
        margin: '0 auto 28px', border: '3px solid rgba(255,255,255,0.5)'
      }} />

      <div className="candy-buttons-container">
        {q.choices.map((choice, idx) => {
          let status = null;
          if (selected === choice.name) {
            status = feedback === 'correct' ? 'correct' : 'wrong';
          } else if (feedback === 'wrong' && choice.name === q.target.name) {
            status = 'correct';
          }

          return (
            <CandyButton
              key={choice.name}
              value={choice.name}
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
