import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import { saveScore } from '../utils/scoreManager'
import { randomInt, generateMultipleChoices } from '../utils/gameHelpers'
import '../styles/Games.css'

const TOTAL = 10;

function generateQuestion(table) {
  const b = randomInt(1, 12);
  const answer = table * b;
  const choices = generateMultipleChoices(answer, Math.max(1, answer - 20), answer + 20, 4);
  return { a: table, b, answer, choices };
}

export default function TimesTablesGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [table, setTable] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const startGame = (num) => {
    setTable(num);
    const qs = Array.from({ length: TOTAL }, () => generateQuestion(num));
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
        saveScore('times-tables', newScore, TOTAL);
        setScore(newScore);
        setPhase('done');
      } else {
        setScore(newScore);
        setCurrent(c => c + 1);
      }
    }, 900);
  }, [feedback, questions, current, score]);

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Times Tables"
        onPlayAgain={() => startGame(table)}
        onHome={() => navigate('/')}
      />
    );
  }

  if (phase === 'pick') {
    return (
      <div className="game-container">
        <h2 className="game-title">Times Tables ✖️</h2>
        <p className="game-subtitle">Pick a number to practice!</p>
        <div className="number-picker-grid">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className="number-picker-btn btn"
              onClick={() => startGame(n)}
              style={{ background: `hsl(${n * 28}, 70%, 60%)`, color: 'white', fontSize: 28 }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const showDots = q.a <= 5 && q.b <= 5;

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
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
      <div className="choices-grid">
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
