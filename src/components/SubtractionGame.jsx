import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { generateMathQuestion, recordQuestionAnswered } from '../utils/questionEngine'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const TOTAL = 10;

export default function SubtractionGame() {
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
      const q = generateMathQuestion('subtraction', lvl);
      const parsed = q.question.match(/(\d+)\s*-\s*(\d+)/);
      const a = parsed ? parseInt(parsed[1], 10) : 8;
      const b = parsed ? parseInt(parsed[2], 10) : 3;
      generatedList.push({
        id: q.id,
        a,
        b,
        answer: q.answer,
        choices: q.options,
      });
      recordQuestionAnswered('subtraction', q.id);
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

    const correct = choice === q.answer;
    setSelected(choice);
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
        saveScore('subtraction', level, score + (correct ? 1 : 0), TOTAL);
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
    return <LevelPicker gameName="subtraction" gameTitle="Subtraction Game" gameEmoji="➖" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Subtraction Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { a: 8, b: 3, answer: 5, choices: [3, 5, 4, 6] };

  return (
    <SpaceGameLayout
      gameTitle="Subtraction Game"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText={`${q.a} - ${q.b} = ?`}
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
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
