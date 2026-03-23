import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const TOTAL = 10;

// Rhyme families: each family = { family, words }
const RHYME_FAMILIES = [
  { family: 'at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'pat', 'fat'] },
  { family: 'og', words: ['dog', 'log', 'fog', 'hog', 'frog', 'blog'] },
  { family: 'un', words: ['sun', 'fun', 'run', 'bun', 'gun', 'nun'] },
  { family: 'in', words: ['pin', 'bin', 'tin', 'win', 'fin', 'kin'] },
  { family: 'op', words: ['top', 'hop', 'pop', 'mop', 'cop', 'drop'] },
  { family: 'ig', words: ['pig', 'big', 'dig', 'fig', 'wig', 'jig'] },
  { family: 'ed', words: ['red', 'bed', 'fed', 'led', 'wed', 'shed'] },
  { family: 'et', words: ['pet', 'jet', 'net', 'set', 'wet', 'met'] },
  { family: 'ug', words: ['bug', 'hug', 'mug', 'rug', 'jug', 'tug'] },
  { family: 'ap', words: ['cap', 'map', 'nap', 'tap', 'rap', 'gap'] },
  { family: 'ake', words: ['cake', 'lake', 'make', 'rake', 'take', 'bake', 'wake'] },
  { family: 'ame', words: ['game', 'name', 'came', 'fame', 'same', 'tame'] },
  { family: 'ine', words: ['fine', 'line', 'mine', 'pine', 'vine', 'wine', 'nine'] },
  { family: 'one', words: ['bone', 'cone', 'lone', 'tone', 'zone', 'stone', 'phone'] },
  { family: 'ight', words: ['night', 'light', 'might', 'right', 'sight', 'tight', 'fight'] },
  { family: 'ing', words: ['king', 'ring', 'sing', 'wing', 'bring', 'spring', 'thing'] },
  { family: 'all', words: ['ball', 'call', 'fall', 'hall', 'tall', 'wall', 'small'] },
  { family: 'ound', words: ['found', 'ground', 'round', 'sound', 'bound', 'mound'] },
  { family: 'ation', words: ['station', 'nation', 'action', 'fraction', 'motion', 'notion'] },
  { family: 'etter', words: ['better', 'letter', 'setter', 'wetter', 'getter'] },
];

function pickRandomFamily(exclude = []) {
  const available = RHYME_FAMILIES.filter(f => !exclude.includes(f.family));
  return available[Math.floor(Math.random() * available.length)];
}

function generateQuestion(level) {
  const cfg = getLevelConfig('rhyming', level);
  // Pick target family
  const targetFamily = pickRandomFamily();
  const targetWords = shuffle([...targetFamily.words]);
  const targetWord = targetWords[0].toUpperCase();
  const correctRhyme = targetWords[1].toUpperCase();

  // Distractors come from different families
  const distractorWords = [];
  const usedFamilies = [targetFamily.family];
  while (distractorWords.length < cfg.choiceCount - 1) {
    const distFamily = pickRandomFamily(usedFamilies);
    usedFamilies.push(distFamily.family);
    // For tricky levels, pick words of similar length
    const candidates = cfg.tricky
      ? distFamily.words.filter(w => Math.abs(w.length - correctRhyme.length) <= 1)
      : distFamily.words;
    const pool = candidates.length > 0 ? candidates : distFamily.words;
    distractorWords.push(pool[Math.floor(Math.random() * pool.length)].toUpperCase());
  }

  const choices = shuffle([correctRhyme, ...distractorWords]);
  return { targetWord, correctRhyme, choices };
}

function speakWord(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word.toLowerCase());
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function RhymingGame() {
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

  // Speak target word when question changes
  useEffect(() => {
    if (phase === 'play' && questions.length > 0) {
      speakWord(questions[current].targetWord);
    }
  }, [phase, current, questions]);

  const handleAnswer = useCallback((choice) => {
    if (feedback) return;
    const q = questions[current];
    const correct = choice === q.correctRhyme;
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
        saveScore('rhyming', level, newScore, TOTAL);
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
    return <LevelPicker gameName="rhyming" gameTitle="Rhyming Game" gameEmoji="🎵" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Rhyming Game"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current];
  const cfg = getLevelConfig('rhyming', level);
  const gridClass = cfg.choiceCount > 4 ? 'choices-grid choices-grid-3col' : 'choices-grid';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — Rhyming Game 🎵</h2>

      <div className="question-display card">
        <p style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>Which word rhymes with...</p>
        <p className="question-text" style={{ fontSize: 52, margin: '8px 0' }}>{q.targetWord}</p>
        <button
          className="btn btn-secondary"
          style={{ fontSize: 18, padding: '6px 18px', marginTop: 8 }}
          onClick={() => speakWord(q.targetWord)}
        >
          🔊 Hear it
        </button>
      </div>

      <div className={gridClass}>
        {q.choices.map(choice => {
          let cls = 'btn choice-btn';
          if (selected === choice) cls += feedback === 'correct' ? ' correct-answer' : ' wrong-answer';
          else if (feedback === 'wrong' && choice === q.correctRhyme) cls += ' correct-answer';
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
