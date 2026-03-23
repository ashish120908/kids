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

const EMOJI_PAIRS = [
  ['🔴', '🔵'], ['🟡', '🟢'], ['⭐', '🌙'], ['🍎', '🍊'], ['🐱', '🐶'],
  ['🌸', '🌻'], ['🏀', '⚽'], ['🚀', '🌍'], ['🦁', '🐯'], ['🎵', '🎸'],
];

const EMOJI_TRIPLES = [
  ['🍎', '🍊', '🍋'], ['🔴', '🟡', '🔵'], ['🐱', '🐶', '🐸'],
  ['🌸', '🌻', '🌺'], ['🏀', '⚽', '🎾'], ['🚗', '🚕', '🚙'],
];

function generateEmojiPattern(emojis, repeat, showCount) {
  // e.g., emojis=[A,B], showCount=5 → [A,B,A,B,A], answer=B
  const sequence = [];
  for (let i = 0; i < showCount; i++) {
    sequence.push(emojis[i % emojis.length]);
  }
  const answer = emojis[showCount % emojis.length];
  return { sequence, answer };
}

function generateNumberSequence(type, choiceCount) {
  let start, step, operation, seqLen;
  switch (type) {
    case 'numAdd1':
      start = randomInt(1, 20);
      step = 1;
      seqLen = 5;
      operation = n => n + step;
      break;
    case 'numAdd2':
      start = randomInt(1, 15);
      step = 2;
      seqLen = 5;
      operation = n => n + step;
      break;
    case 'numAdd3':
      start = randomInt(1, 10);
      step = randomInt(3, 5);
      seqLen = 5;
      operation = n => n + step;
      break;
    case 'numMul2':
      start = randomInt(1, 3);
      seqLen = 5;
      operation = n => n * 2;
      break;
    case 'numMul3':
      start = randomInt(1, 2);
      seqLen = 4;
      operation = n => n * 3;
      break;
    case 'fibonacci': {
      const a = randomInt(1, 3);
      const b = randomInt(a + 1, a + 3);
      const seq = [a, b];
      while (seq.length < 6) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      const answer = seq[seq.length - 1];
      const sequence = seq.slice(0, seq.length - 1);
      const distractors = new Set();
      while (distractors.size < choiceCount - 1) {
        // Generate distractors near the answer (±1 to ±6) to make the game challenging
        const offset = randomInt(1, 6) * (Math.random() < 0.5 ? 1 : -1);
        const candidate = answer + offset;
        if (candidate !== answer && candidate > 0) distractors.add(candidate);
      }
      return { sequence, answer, choices: shuffle([answer, ...distractors]) };
    }
    default:
      start = randomInt(1, 10);
      step = 1;
      seqLen = 5;
      operation = n => n + step;
  }

  const sequence = [start];
  for (let i = 1; i < seqLen; i++) {
    sequence.push(operation(sequence[i - 1]));
  }
  const answer = operation(sequence[sequence.length - 1]);
  const distractors = new Set();
  while (distractors.size < choiceCount - 1) {
    const d = answer + randomInt(-4, 4) * randomInt(1, 2);
    if (d !== answer && d > 0) distractors.add(d);
  }
  return { sequence, answer, choices: shuffle([answer, ...distractors]) };
}

function generateQuestion(level) {
  const cfg = getLevelConfig('pattern', level);
  const type = cfg.type;

  if (type === 'emoji2') {
    const emojis = EMOJI_PAIRS[randomInt(0, EMOJI_PAIRS.length - 1)];
    const { sequence, answer } = generateEmojiPattern(emojis, 2, 5);
    const distractors = [];
    for (const pair of EMOJI_PAIRS) {
      for (const e of pair) {
        if (e !== answer && distractors.length < cfg.choiceCount - 1) {
          distractors.push(e);
        }
      }
    }
    return { sequence, answer, choices: shuffle([answer, ...distractors.slice(0, cfg.choiceCount - 1)]), type: 'emoji' };
  }

  if (type === 'emoji3') {
    const emojis = EMOJI_TRIPLES[randomInt(0, EMOJI_TRIPLES.length - 1)];
    const { sequence, answer } = generateEmojiPattern(emojis, 3, 6);
    const distractors = [];
    for (const triple of EMOJI_TRIPLES) {
      for (const e of triple) {
        if (e !== answer && distractors.length < cfg.choiceCount - 1) {
          distractors.push(e);
        }
      }
    }
    return { sequence, answer, choices: shuffle([answer, ...distractors.slice(0, cfg.choiceCount - 1)]), type: 'emoji' };
  }

  const { sequence, answer, choices } = generateNumberSequence(type, cfg.choiceCount);
  return { sequence, answer, choices, type: 'number' };
}

export default function PatternGame() {
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
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];
  const cfg = getLevelConfig('pattern', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid';
  const isEmoji = q.type === 'emoji';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Pattern Game 🔁</h2>

      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 12 }}>What comes next?</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {q.sequence.map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: isEmoji ? 36 : 28,
                background: '#f0f4ff',
                borderRadius: 10,
                padding: isEmoji ? '4px 8px' : '6px 14px',
                fontWeight: 'bold',
                color: '#333',
                fontFamily: "'Fredoka One', cursive",
              }}
            >
              {item}
            </span>
          ))}
          <span style={{ fontSize: 36, fontWeight: 'bold', color: '#aaa' }}>?</span>
        </div>
      </div>

      <div className={gridClass}>
        {q.choices.map(choice => {
          let cls = 'btn choice-btn';
          if (selected === choice) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && choice === q.answer) cls += ' correct-answer';
          return (
            <button
              key={choice}
              className={cls}
              onClick={() => handleAnswer(choice)}
              style={isEmoji ? { fontSize: 32 } : {}}
            >
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
