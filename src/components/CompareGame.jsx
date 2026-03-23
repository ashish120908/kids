import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { randomInt } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const TOTAL = 10;

function generateQuestion(level) {
  const cfg = getLevelConfig('compare', level);
  let a = randomInt(1, cfg.maxNum);
  let b;
  if (cfg.allowEqual && Math.random() < 0.2) {
    b = a;
  } else {
    do {
      b = randomInt(1, cfg.maxNum);
    } while (b === a);
  }
  const answer = a > b ? '>' : a < b ? '<' : '=';
  return { a, b, answer };
}

export default function CompareGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const startGame = (lvl) => {
    clearTimeout(timerRef.current);
    clearTimeout(confettiTimerRef.current);
    clearInterval(countdownRef.current);
    setLevel(lvl);
    setQuestions(Array.from({ length: TOTAL }, () => generateQuestion(lvl)));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setTimeLeft(null);
    setPhase('play');
  };

  const cfg = level ? getLevelConfig('compare', level) : null;

  // Countdown timer for level 10
  useEffect(() => {
    if (phase !== 'play' || !cfg || cfg.timeLimit <= 0) return;
    setTimeLeft(cfg.timeLimit);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [phase, current, cfg]);

  // Auto-wrong when time runs out
  useEffect(() => {
    if (timeLeft !== 0 || feedback) return;
    const q = questions[current];
    if (!q) return;
    setFeedback('wrong');
    setSelected('timeout');
    playWrong();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score;
      if (current + 1 >= TOTAL) {
        saveScore('compare', level, newScore, TOTAL);
        setScore(newScore);
        playGameComplete();
        setPhase('done');
      } else {
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [timeLeft, feedback, questions, current, score, level]);

  const handleAnswer = useCallback((choice) => {
    if (feedback) return;
    clearInterval(countdownRef.current);
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
        saveScore('compare', level, newScore, TOTAL);
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
    return <LevelPicker gameName="compare" gameTitle="Compare Numbers" gameEmoji="⚖️" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Compare Numbers"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Compare Numbers ⚖️</h2>

      {cfg && cfg.timeLimit > 0 && timeLeft !== null && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: timeLeft <= 1 ? '#e74c3c' : '#f39c12',
            fontFamily: "'Fredoka One', cursive",
          }}>
            ⏱️ {timeLeft}s
          </span>
        </div>
      )}

      <div className="question-display card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <span style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#6c63ff',
            fontFamily: "'Fredoka One', cursive",
            minWidth: 90,
            textAlign: 'center',
          }}>
            {q.a}
          </span>
          <span style={{ fontSize: 48, color: '#aaa', fontWeight: 'bold' }}>?</span>
          <span style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#e74c3c',
            fontFamily: "'Fredoka One', cursive",
            minWidth: 90,
            textAlign: 'center',
          }}>
            {q.b}
          </span>
        </div>
      </div>

      <div className="choices-grid" style={{ maxWidth: 400, margin: '0 auto' }}>
        {['>', '<', '='].map(sym => {
          let cls = 'btn choice-btn';
          if (selected === sym) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && sym === q.answer) cls += ' correct-answer';
          return (
            <button
              key={sym}
              className={cls}
              onClick={() => handleAnswer(sym)}
              style={{ fontSize: 40, minWidth: 80, padding: '16px 24px', fontFamily: "'Fredoka One', cursive" }}
            >
              {sym}
            </button>
          );
        })}
      </div>

      <p className="score-display-inline">Score: {score}</p>
      <AdBanner />
    </div>
  );
}
