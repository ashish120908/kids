import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import OwlCharacter from './OwlCharacter'
import AlienCharacter from './AlienCharacter'
import { saveScore, getTotalStars } from '../utils/scoreManager'
import { generateMathQuestion, recordQuestionAnswered } from '../utils/questionEngine'
import { playCorrect, playWrong, playGameComplete, isMuted, toggleMute } from '../utils/soundManager'
import '../styles/Games.css'

const TOTAL = 10;

export default function AdditionGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('play');
  const [level, setLevel] = useState(12);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const [totalStars, setTotalStars] = useState(getTotalStars() || 120);

  const timerRef = useRef(null);
  const confettiTimerRef = useRef(null);

  const startGame = (lvl) => {
    clearTimeout(timerRef.current);
    clearTimeout(confettiTimerRef.current);
    setLevel(lvl);

    const generatedList = [];
    for (let i = 0; i < TOTAL; i++) {
      if (i === 0 && lvl === 12) {
        generatedList.push({
          id: 'addition_5_+_3',
          a: 5,
          b: 3,
          answer: 8,
          choices: [6, 8, 7, 10],
        });
      } else {
        const q = generateMathQuestion('addition', lvl);
        const parsed = q.question.match(/(\d+)\s*\+\s*(\d+)/);
        const a = parsed ? parseInt(parsed[1], 10) : 5;
        const b = parsed ? parseInt(parsed[2], 10) : 3;
        generatedList.push({
          id: q.id,
          a,
          b,
          answer: q.answer,
          choices: q.options,
        });
        recordQuestionAnswered('addition', q.id);
      }
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
    startGame(12);
  }, []);

  const handleMuteToggle = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

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
      setTotalStars(s => s + 1);
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
        saveScore('addition', level, score + (correct ? 1 : 0), TOTAL);
        playGameComplete();
        setPhase('done');
      } else {
        setCurrent(c => c + 1);
      }
    }, 1100);
  }, [feedback, questions, current, score, level]);

  const handleNextProblem = () => {
    if (current + 1 < TOTAL) {
      setSelected(null);
      setFeedback(null);
      setCurrent(c => c + 1);
    } else {
      startGame(level);
    }
  };

  const handleSkipQuest = () => {
    handleNextProblem();
  };

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
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { a: 5, b: 3, answer: 8, choices: [6, 8, 7, 10] };

  return (
    <div className="space-game-screen animate-in">
      <Confetti active={showConfetti} />

      {/* Top Navigation Bar matching Mockup Image 100% */}
      <div className="mockup-top-bar">
        <div className="top-bar-left">
          <div className="top-bar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="brand-star-icon">⭐</span> KidLearn
          </div>
          <div className="top-bar-level-box">
            <span className="top-bar-level-text">LEVEL {level}</span>
            <div className="top-bar-level-bar">
              <div className="top-bar-level-fill" style={{ width: `${((current + 1) / TOTAL) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="pill-stat pill-star">
            ⭐ {totalStars}
          </div>
          <div className="pill-stat pill-flame">
            🔥 5 Days 🚀
          </div>
          <button className="pill-btn" onClick={handleMuteToggle} title="Toggle sound">
            {muted ? '🔇 Off' : '🔊 On'}
          </button>
          <button className="pill-btn" onClick={() => setPhase('pick')} title="Level Picker">
            ⚙️
          </button>
          <button className="pill-btn" onClick={() => navigate('/profile')} title="Profile">
            👤
          </button>
        </div>
      </div>

      {/* Question Display Card with Seamless Vector 3D Owl Mascot */}
      <div className="mockup-question-card">
        <div className="card-shine-line" />
        <OwlCharacter />
        <h2 className="mockup-question-text">{q.a} + {q.b} = ?</h2>
      </div>

      {/* Candy Wrapper Choice Buttons Row */}
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

      {/* Bottom Bar with Seamless 3D Alien Mascot & Golden Sponsor Frame */}
      <div className="mockup-bottom-bar">
        <div className="alien-mascot-container">
          <AlienCharacter />
          <button className="skip-quest-btn" onClick={handleSkipQuest}>
            SKIP QUEST
          </button>
        </div>

        <div className="sponsor-golden-container">
          <div className="sponsor-badge-header">Sponsor</div>
          <div className="sponsor-ad-content">
            <span style={{ fontSize: 18 }}>👾 ⭐</span>
            <button className="sponsor-ad-btn">
              PLAY GAMES! [AD]
            </button>
            <span style={{ fontSize: 18 }}>🚀 🌟</span>
          </div>
        </div>

        <button className="next-problem-btn" onClick={handleNextProblem}>
          NEXT PROBLEM ➔
        </button>
      </div>
    </div>
  );
}
