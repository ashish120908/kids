import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import CandyButton from './CandyButton'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle, generateUniqueItems } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const TOTAL = 10;

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
  { family: 'ing', words: ['king', 'ring', 'sing', 'wing', 'bring', 'spring', 'thing'] },
  { family: 'all', words: ['ball', 'call', 'fall', 'hall', 'tall', 'wall', 'small'] }
];

function pickRandomFamily(exclude = []) {
  const available = RHYME_FAMILIES.filter(f => !exclude.includes(f.family));
  return available[Math.floor(Math.random() * available.length)];
}

function generateQuestion(level) {
  const cfg = getLevelConfig('rhyming', level);
  const targetFamily = pickRandomFamily();
  const targetWords = shuffle([...targetFamily.words]);
  const targetWord = targetWords[0].toUpperCase();
  const correctRhyme = targetWords[1].toUpperCase();

  const distractorWords = [];
  const usedFamilies = [targetFamily.family];
  while (distractorWords.length < 3) {
    const distFamily = pickRandomFamily(usedFamilies);
    usedFamilies.push(distFamily.family);
    const pool = distFamily.words;
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
    setQuestions(generateUniqueItems(TOTAL, () => generateQuestion(lvl), q => `${q.targetWord}|${q.correctRhyme}`));
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

  useEffect(() => {
    if (phase === 'play' && questions.length > 0 && questions[current]) {
      speakWord(questions[current].targetWord);
    }
  }, [phase, current, questions]);

  const handleAnswer = useCallback((choice) => {
    if (feedback) return;
    const q = questions[current];
    if (!q) return;
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
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = questions[current] || { targetWord: 'CAT', correctRhyme: 'BAT', choices: ['BAT', 'DOG', 'SUN', 'BOX'] };

  return (
    <SpaceGameLayout
      gameTitle="Rhyming Game"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText={`Which word rhymes with ${q.targetWord}?`}
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button
          onClick={() => speakWord(q.targetWord)}
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF9100)', border: 'none', borderRadius: 50,
            padding: '10px 24px', fontSize: 18, cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive", color: '#251043',
            boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)'
          }}
        >
          🔊 Hear Word ({q.targetWord})
        </button>
      </div>

      <div className="candy-buttons-container">
        {q.choices.map((choice, idx) => {
          let status = null;
          if (selected === choice) {
            status = feedback === 'correct' ? 'correct' : 'wrong';
          } else if (feedback === 'wrong' && choice === q.correctRhyme) {
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
