import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { randomInt, generateMultipleChoices } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const TOTAL = 10;

function generateQuestion(cfg) {
  const a = randomInt(1, cfg.maxTable);
  const b = randomInt(1, cfg.maxMultiplier);
  const answer = a * b;
  const choices = generateMultipleChoices(answer, Math.max(1, answer - 20), answer + 20, cfg.choiceCount);
  return { a, b, answer, choices };
}

export default function TimesTablesGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const startGame = (lvl) => {
    const cfg = getLevelConfig('times-tables', lvl);
    setLevel(lvl);
    const qs = Array.from({ length: TOTAL }, () => generateQuestion(cfg));
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
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
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      const newScore = score + (correct ? 1 : 0);
      if (current + 1 >= TOTAL) {
        saveScore('times-tables', level, newScore, TOTAL);
        setScore(newScore);
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, questions, current, score, level]);

  if (phase === 'pick') {
    return <LevelPicker gameName="times-tables" gameTitle="Times Tables" gameEmoji="✖️" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Times Tables"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];
  const showDots = q.a <= 5 && q.b <= 5;
  const cfg = getLevelConfig('times-tables', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Times Tables ✖️</h2>
      <div className="question-display card">
        <p className="question-text">{q.a} × {q.b} = ?</p>
        {showDots ? (
          <div className="dot-groups">
            {Array.from({ length: q.a }, (_, i) => (
              <div key={i} className="dot-group">
                {Array.from({ length: q.b }, (_, j) => (
                  <span key={j} className="dot">●</span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 32, marginTop: 8 }}>🧮</p>
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
    </div>
  );
}
