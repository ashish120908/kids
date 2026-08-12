import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { generateMathQuestion, recordQuestionAnswered } from '../utils/questionEngine'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const EMOJIS = ['🍎', '⭐', '🎈', '🐶', '🐱', '🚗', '🚀', '🐰', '🍓', '🐝'];
const TOTAL = 10;

export default function CountingGame() {
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
      const q = generateMathQuestion('counting', lvl);
      const count = q.answer;
      const emoji = EMOJIS[i % EMOJIS.length];
      generatedList.push({
        id: q.id,
        count,
        emoji,
        choices: q.options,
      });
      recordQuestionAnswered('counting', q.id);
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

    const correct = choice === q.count;
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
        saveScore('counting', level, score + (correct ? 1 : 0), TOTAL);
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
    return <LevelPicker gameName="counting" gameTitle="Counting Game" gameEmoji="🔢" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Counting Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { count: 5, emoji: '🍎', choices: [3, 5, 4, 6] };

  return (
    <SpaceGameLayout
      gameTitle="Counting Game"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText="How many objects?"
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 450, margin: '0 auto 28px', fontSize: 44 }}>
        {Array.from({ length: q.count }).map((_, i) => (
          <span key={i} className="animate-bounce">{q.emoji}</span>
        ))}
      </div>

      <div className="candy-buttons-container">
        {q.choices.map((choice, idx) => {
          let status = null;
          if (selected === choice) {
            status = feedback === 'correct' ? 'correct' : 'wrong';
          } else if (feedback === 'wrong' && choice === q.count) {
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
