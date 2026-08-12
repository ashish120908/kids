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

const EMOJI_PAIRS = [
  ['🔴', '🔵'], ['🟡', '🟢'], ['⭐', '🌙'], ['🍎', '🍊'], ['🐱', '🐶'],
  ['🌸', '🌻'], ['🚀', '🌍'], ['🦁', '🐯'], ['🎵', '🎸'],
];

function generateEmojiPattern(emojis, showCount) {
  const sequence = [];
  for (let i = 0; i < showCount; i++) {
    sequence.push(emojis[i % emojis.length]);
  }
  const answer = emojis[showCount % emojis.length];
  return { sequence, answer };
}

function generateQuestion(level) {
  const cfg = getLevelConfig('pattern', level);
  const type = cfg.type;

  if (type === 'emoji2' || type === 'emoji3' || !type) {
    const emojis = EMOJI_PAIRS[randomInt(0, EMOJI_PAIRS.length - 1)];
    const { sequence, answer } = generateEmojiPattern(emojis, 5);
    const distractors = [];
    for (const pair of EMOJI_PAIRS) {
      for (const e of pair) {
        if (e !== answer && distractors.length < 3) {
          distractors.push(e);
        }
      }
    }
    return { sequence, answer, choices: shuffle([answer, ...distractors.slice(0, 3)]), type: 'emoji' };
  }

  const start = randomInt(1, 10);
  const step = 2;
  const sequence = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;
  const choices = shuffle([answer, answer + 1, answer - 1, answer + 2]);
  return { sequence, answer, choices, type: 'number' };
}

export default function PatternGame() {
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
    setQuestions(generateUniqueItems(TOTAL, () => generateQuestion(lvl), q => `${q.type}:${q.sequence.join('|')}`));
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
        saveScore('pattern', level, newScore, TOTAL);
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
    return <LevelPicker gameName="pattern" gameTitle="Pattern Game" gameEmoji="🔁" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Pattern Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', choices: ['🔴', '🔵', '🟡', '🟢'] };

  return (
    <SpaceGameLayout
      gameTitle="Pattern Game"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText="What comes next in pattern?"
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {q.sequence.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: 36,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: '6px 14px',
              border: '2px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              fontFamily: "'Fredoka One', cursive",
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
            }}
          >
            {item}
          </span>
        ))}
        <span style={{ fontSize: 40, fontWeight: 'bold', color: '#00E676' }}>?</span>
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
