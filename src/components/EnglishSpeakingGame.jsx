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

const ALL_CONTENT = {
  basic: [
    { text: 'cat', emoji: '🐱', hint: 'A pet that meows' },
    { text: 'dog', emoji: '🐶', hint: 'A loyal pet that barks' },
    { text: 'sun', emoji: '☀️', hint: 'Shines in the sky' },
    { text: 'red', emoji: '🔴', hint: 'A bright color' },
    { text: 'big', emoji: '🐘', hint: 'Large in size' },
    { text: 'run', emoji: '🏃', hint: 'Move fast on your feet' },
    { text: 'fly', emoji: '✈️', hint: 'Move through the air' },
    { text: 'egg', emoji: '🥚', hint: 'A hen lays this' },
    { text: 'ant', emoji: '🐜', hint: 'A tiny insect' },
    { text: 'hat', emoji: '🎩', hint: 'Wear it on your head' },
    { text: 'bus', emoji: '🚌', hint: 'A big vehicle' },
    { text: 'cup', emoji: '☕', hint: 'You drink from it' },
    { text: 'hop', emoji: '🐸', hint: 'Jump like a frog' },
    { text: 'map', emoji: '🗺️', hint: 'Shows directions' },
    { text: 'owl', emoji: '🦉', hint: 'A bird that hoots' },
  ],
  medium: [
    { text: 'apple', emoji: '🍎', hint: 'A crunchy red fruit' },
    { text: 'happy', emoji: '😊', hint: 'Feeling joyful' },
    { text: 'tiger', emoji: '🐯', hint: 'A big striped cat' },
    { text: 'water', emoji: '💧', hint: 'We drink this every day' },
    { text: 'sunny', emoji: '☀️', hint: 'Bright and warm weather' },
    { text: 'funny', emoji: '😂', hint: 'Makes you laugh' },
    { text: 'horse', emoji: '🐴', hint: 'You can ride it' },
    { text: 'ocean', emoji: '🌊', hint: 'A huge body of salt water' },
    { text: 'lemon', emoji: '🍋', hint: 'A sour yellow fruit' },
    { text: 'music', emoji: '🎵', hint: 'Sounds that make a melody' },
    { text: 'train', emoji: '🚂', hint: 'Travels on tracks' },
    { text: 'bread', emoji: '🍞', hint: 'You make sandwiches with it' },
    { text: 'honey', emoji: '🍯', hint: 'Sweet food made by bees' },
    { text: 'pizza', emoji: '🍕', hint: 'Round food with cheese' },
    { text: 'robot', emoji: '🤖', hint: 'A machine that can move' },
  ],
  phrase: [
    { text: 'good morning', emoji: '🌅', hint: 'Say hello in the morning' },
    { text: 'thank you', emoji: '🙏', hint: 'Say this when someone helps you' },
    { text: 'well done', emoji: '🏆', hint: 'Say this when someone does great' },
    { text: 'how are you', emoji: '😊', hint: 'Ask how someone feels' },
    { text: 'good night', emoji: '🌙', hint: 'Say goodbye before bed' },
    { text: 'I am happy', emoji: '😄', hint: 'Tell how you feel' },
    { text: 'I like cats', emoji: '🐱', hint: 'Tell what you like' },
    { text: 'please help me', emoji: '🤝', hint: 'Ask for help politely' },
    { text: 'let us play', emoji: '🎮', hint: 'Invite a friend to play' },
    { text: 'very good job', emoji: '⭐', hint: "Praise someone's work" },
    { text: 'I can do it', emoji: '💪', hint: 'Show confidence' },
    { text: 'look at me', emoji: '👀', hint: "Get someone's attention" },
    { text: 'see you later', emoji: '👋', hint: 'Say goodbye' },
    { text: 'good afternoon', emoji: '🌤️', hint: 'Greet in the afternoon' },
    { text: 'excuse me', emoji: '🙋', hint: 'Be polite when interrupting' },
  ],
  sentence: [
    { text: 'the cat is on the mat', emoji: '🐱', hint: 'Where is the cat?' },
    { text: 'I like to eat apples', emoji: '🍎', hint: 'What do you like to eat?' },
    { text: 'the sun is very bright', emoji: '☀️', hint: 'How is the sun?' },
    { text: 'the dog runs very fast', emoji: '🐶', hint: 'How does the dog move?' },
    { text: 'birds can fly in the sky', emoji: '🐦', hint: 'Where do birds fly?' },
    { text: 'I love to read books', emoji: '📚', hint: 'What do you love to do?' },
    { text: 'the fish swims in water', emoji: '🐟', hint: 'Where does the fish swim?' },
    { text: 'we play in the park', emoji: '🌳', hint: 'Where do we play?' },
    { text: 'the lion is very big', emoji: '🦁', hint: 'How big is the lion?' },
    { text: 'I go to school every day', emoji: '🏫', hint: 'Where do you go?' },
    { text: 'the moon shines at night', emoji: '🌙', hint: 'When does the moon shine?' },
    { text: 'she has a red balloon', emoji: '🎈', hint: 'What does she have?' },
  ],
};

function getContentForLevel(level) {
  const cfg = getLevelConfig('english-speaking', level);
  const pool = ALL_CONTENT[cfg.type] || ALL_CONTENT.basic;
  return shuffle([...pool]).slice(0, TOTAL);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.8;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function normalizeText(text) {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

function isMatch(recognized, target) {
  const r = normalizeText(recognized);
  const t = normalizeText(target);
  return r === t || r.includes(t) || t.includes(r);
}

export default function EnglishSpeakingGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
  const contentRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [recognizedText, setRecognizedText] = useState('');
  const timerRef = useRef(null);
  const recRef = useRef(null);
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startGame = (lvl) => {
    contentRef.current = getContentForLevel(lvl);
    setLevel(lvl);
    setCurrent(0);
    setScore(0);
    setFeedback(null);
    setShowConfetti(false);
    setAttemptsLeft(2);
    setRecognizedText('');
    setPhase('play');
  };

  const currentItem = contentRef.current ? contentRef.current[current] : null;

  const stopRecognition = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }
  };

  const advanceGame = useCallback((correct) => {
    clearTimeout(timerRef.current);
    const newScore = score + (correct ? 1 : 0);
    const next = current + 1;
    if (next >= TOTAL) {
      setScore(newScore);
      playGameComplete();
      saveScore('english-speaking', level, newScore, TOTAL);
      setPhase('done');
    } else {
      setScore(newScore);
      timerRef.current = setTimeout(() => {
        setCurrent(next);
        setFeedback(null);
        setAttemptsLeft(2);
        setRecognizedText('');
      }, 1000);
    }
  }, [score, current, level]);

  const handleSpeakAttempt = useCallback(() => {
    if (feedback === 'listening' || feedback === 'correct') return;

    if (!hasSpeechRecognition) {
      playCorrect();
      setFeedback('correct');
      setShowConfetti(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
        advanceGame(true);
      }, 1200);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognitionAPI();
    recRef.current = rec;
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    setFeedback('listening');

    rec.onresult = (event) => {
      const alternatives = Array.from(event.results[0]).map(r => r.transcript);
      setRecognizedText(alternatives[0]);
      const matched = alternatives.some(alt => isMatch(alt, currentItem.text));
      if (matched) {
        playCorrect();
        setFeedback('correct');
        setShowConfetti(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setShowConfetti(false);
          advanceGame(true);
        }, 1200);
      } else {
        playWrong();
        setFeedback('wrong');
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);
        if (newAttempts <= 0) {
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => advanceGame(false), 1500);
        } else {
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setFeedback(null);
            setRecognizedText('');
          }, 1500);
        }
      }
    };

    rec.onerror = () => {
      setFeedback(null);
      recRef.current = null;
    };

    rec.onend = () => {
      recRef.current = null;
    };

    rec.start();
  }, [feedback, hasSpeechRecognition, currentItem, attemptsLeft, advanceGame]);

  useEffect(() => {
    if (phase === 'play' && currentItem) {
      const timer = setTimeout(() => speak(currentItem.text), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, current, currentItem]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      stopRecognition();
    };
  }, []);

  if (phase === 'pick') {
    return <LevelPicker gameName="english-speaking" gameTitle="English Speaking" gameEmoji="🗣️" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="English Speaking"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
        onHome={() => navigate('/')}
      />
    );
  }

  const micColor = feedback === 'correct' ? '#00B894'
    : feedback === 'wrong' ? '#FF6B6B'
    : feedback === 'listening' ? '#E17055'
    : '#4ECDC4';

  const micLabel = feedback === 'listening' ? '🎤 Listening...'
    : feedback === 'correct' ? '✅ Correct!'
    : feedback === 'wrong' ? '❌ Try Again'
    : hasSpeechRecognition ? '🎤 Say It!'
    : '✅ I Said It!';

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Level {level} — English Speaking 🗣️</h2>

      <div className="card" style={{ width: '100%', textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{currentItem.emoji}</div>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 8px', fontFamily: "'Nunito', sans-serif" }}>
          {currentItem.hint}
        </p>
        <div style={{
          fontSize: 28, fontFamily: "'Fredoka One', cursive",
          color: '#333', marginBottom: 16, letterSpacing: 1
        }}>
          {currentItem.text.toUpperCase()}
        </div>
        <button
          onClick={() => speak(currentItem.text)}
          aria-label="Hear the word"
          style={{
            background: '#FFD93D', border: 'none', borderRadius: 12,
            padding: '8px 20px', fontSize: 18, cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive",
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          🔊 Hear it!
        </button>
      </div>

      {recognizedText && feedback === 'wrong' && (
        <p style={{
          color: '#FF6B6B', fontFamily: "'Nunito', sans-serif",
          fontSize: 14, margin: '4px 0'
        }}>
          I heard: &ldquo;{recognizedText}&rdquo;
        </p>
      )}

      {hasSpeechRecognition && attemptsLeft === 1 && !feedback && (
        <p style={{
          color: '#FF9F43', fontFamily: "'Nunito', sans-serif",
          fontSize: 14, margin: '4px 0'
        }}>
          1 attempt left — try again!
        </p>
      )}

      <button
        onClick={handleSpeakAttempt}
        disabled={feedback === 'correct' || feedback === 'listening'}
        aria-label={micLabel}
        style={{
          background: micColor,
          border: 'none', borderRadius: 20,
          padding: '16px 40px', fontSize: 22, cursor: feedback === 'correct' || feedback === 'listening' ? 'default' : 'pointer',
          fontFamily: "'Fredoka One', cursive",
          color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          transform: feedback === 'listening' ? 'scale(0.95)' : 'scale(1)',
          opacity: feedback === 'correct' ? 0.7 : 1,
          marginTop: 8,
        }}
      >
        {micLabel}
      </button>

      {!hasSpeechRecognition && (
        <p style={{
          color: '#999', fontFamily: "'Nunito', sans-serif",
          fontSize: 13, margin: '8px 16px', textAlign: 'center'
        }}>
          Tip: Tap &ldquo;Hear it!&rdquo; then say the word out loud, then tap &ldquo;I Said It!&rdquo; ✨
        </p>
      )}

      <p className="score-display-inline">Score: {score}</p>
      <AdBanner />
    </div>
  );
}
