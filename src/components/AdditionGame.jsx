import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { randomInt, generateMultipleChoices } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const TOTAL = 10;
const EMOJI_SETS = ['🍎', '⭐', '🌸', '🎈', '🐠', '🍪', '🦋', '🏀'];

function generateQuestion(level) {
  const cfg = getLevelConfig('addition', level);
  const a = randomInt(1, cfg.maxNum);
  const b = randomInt(1, cfg.maxNum);
  const answer = a + b;
  const choices = generateMultipleChoices(answer, Math.max(1, answer - 10), answer + 10, cfg.choiceCount);
  const emoji = EMOJI_SETS[randomInt(0, EMOJI_SETS.length - 1)];
  return { a, b, answer, choices, emoji };
}

export default function AdditionGame() {
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
      setShowConfetti(true);
      clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 1200);
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score + (correct ? 1 : 0);
      if (current + 1 >= TOTAL) {
        saveScore('addition', level, newScore, TOTAL);
        setScore(newScore);
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, questions, current, score, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="addition" gameTitle="Addition Game" gameEmoji="➕" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Addition Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];
  const showDots = q.a <= 5 && q.b <= 5;
  const cfg = getLevelConfig('addition', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Addition Game ➕</h2>

      <div className="question-display card">
        <p className="question-text">{q.a} + {q.b} = ?</p>
        {showDots && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 120, justifyContent: 'center' }}>
              {Array.from({ length: q.a }, (_, i) => (
                <span key={i} style={{ fontSize: 22 }}>{q.emoji}</span>
              ))}
            </div>
            <span style={{ fontSize: 32, alignSelf: 'center' }}>+</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 120, justifyContent: 'center' }}>
              {Array.from({ length: q.b }, (_, i) => (
                <span key={i} style={{ fontSize: 22 }}>{q.emoji}</span>
              ))}
            </div>
          </div>
        )}
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
