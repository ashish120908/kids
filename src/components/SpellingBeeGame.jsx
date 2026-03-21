import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import '../styles/Games.css'

const WORDS = [
  { word: 'CAT', emoji: '🐱', hint: 'A fluffy pet that meows' },
  { word: 'DOG', emoji: '🐶', hint: 'A loyal pet that barks' },
  { word: 'SUN', emoji: '☀️', hint: 'It shines in the sky' },
  { word: 'BEE', emoji: '🐝', hint: 'It makes honey' },
  { word: 'HAT', emoji: '🎩', hint: 'You wear it on your head' },
  { word: 'BUS', emoji: '🚌', hint: 'A big vehicle' },
  { word: 'CUP', emoji: '☕', hint: 'You drink from it' },
  { word: 'MAP', emoji: '🗺️', hint: 'Shows you directions' },
  { word: 'PIG', emoji: '🐷', hint: 'A pink farm animal' },
  { word: 'COW', emoji: '🐮', hint: 'Gives us milk' },
  { word: 'HEN', emoji: '🐓', hint: 'Lays eggs on a farm' },
  { word: 'ANT', emoji: '🐜', hint: 'A tiny busy insect' },
  { word: 'OWL', emoji: '🦉', hint: 'A bird that hoots at night' },
  { word: 'FOX', emoji: '🦊', hint: 'A clever orange animal' },
  { word: 'CAKE', emoji: '🎂', hint: 'Sweet birthday treat' },
  { word: 'FISH', emoji: '🐟', hint: 'Swims in the water' },
  { word: 'FROG', emoji: '🐸', hint: 'Jumps and ribbits' },
  { word: 'BEAR', emoji: '🐻', hint: 'A big furry animal' },
  { word: 'BIRD', emoji: '🐦', hint: 'It flies with wings' },
  { word: 'DUCK', emoji: '🦆', hint: 'It quacks and swims' },
];

const TOTAL = 10;

function speakWord(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(word.toLowerCase());
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  }
}

// Each tile gets a unique id so duplicate letters work correctly
function makeTiles(word) {
  return shuffle(word.split('').map((letter, i) => ({ id: i, letter })));
}

export default function SpellingBeeGame() {
  const navigate = useNavigate();
  const wordListRef = useRef(null);
  if (!wordListRef.current) {
    wordListRef.current = shuffle([...WORDS]).slice(0, TOTAL);
  }
  const wordList = wordListRef.current;

  const [phase, setPhase] = useState('play');
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState([]); // array of tile ids in order tapped
  const [tiles, setTiles] = useState(() => makeTiles(wordList[0].word));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const currentWord = wordList[current];

  const resetGame = () => {
    wordListRef.current = shuffle([...WORDS]).slice(0, TOTAL);
    setCurrent(0);
    setTyped([]);
    setTiles(makeTiles(wordListRef.current[0].word));
    setScore(0);
    setFeedback(null);
    setWrongId(null);
    setPhase('play');
  };

  const handleLetterTap = useCallback((tile) => {
    if (feedback) return;
    if (typed.includes(tile.id)) return;
    const nextChar = currentWord.word[typed.length];
    if (tile.letter === nextChar) {
      const newTyped = [...typed, tile.id];
      setTyped(newTyped);
      setFeedback('correct');
      const wordComplete = newTyped.length === currentWord.word.length;
      if (wordComplete) setShowConfetti(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (wordComplete) setShowConfetti(false);
        setFeedback(null);
        if (wordComplete) {
          const newScore = score + 1;
          const next = current + 1;
          if (next >= TOTAL) {
            saveScore('spelling', newScore, TOTAL);
            setScore(newScore);
            setPhase('done');
          } else {
            setScore(newScore);
            setCurrent(next);
            setTyped([]);
            setTiles(makeTiles(wordListRef.current[next].word));
          }
        }
      }, wordComplete ? 1200 : 400);
    } else {
      setWrongId(tile.id);
      setFeedback('wrong');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setWrongId(null);
      }, 700);
    }
  }, [feedback, typed, currentWord, score, current]);

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Spelling Bee"
        onPlayAgain={resetGame}
        onHome={() => navigate('/')}
      />
    );
  }

  // Map typed ids back to letters for display
  const typedLetters = typed.map(id => tiles.find(t => t.id === id).letter);

  return (
    <div className="game-container">
      <Confetti active={showConfetti} />
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>
      <p className="progress-text">{current + 1} / {TOTAL}</p>
      <h2 className="game-title">Spelling Bee 🐝</h2>

      <div className="card" style={{ width: '100%', textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{currentWord.emoji}</div>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 16px', fontFamily: "'Nunito', sans-serif" }}>
          {currentWord.hint}
        </p>
        <button
          onClick={() => speakWord(currentWord.word)}
          aria-label="Hear the word"
          style={{
            background: '#FFD93D', border: 'none', borderRadius: 12,
            padding: '8px 20px', fontSize: 18, cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive", marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          🔊 Hear it!
        </button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', minHeight: 56 }}>
          {currentWord.word.split('').map((_, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 12,
              background: typedLetters[i] ? '#4ECDC4' : 'transparent',
              border: typedLetters[i] ? 'none' : '3px dashed #ccc',
              color: typedLetters[i] ? 'white' : '#ccc',
              fontFamily: "'Fredoka One', cursive", fontSize: 26,
              transition: 'all 0.2s ease',
              boxShadow: typedLetters[i] ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
            }}>
              {typedLetters[i] || ''}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 420 }}>
        {tiles.map((tile) => {
          const used = typed.includes(tile.id);
          const isWrong = wrongId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => handleLetterTap(tile)}
              aria-label={`Letter ${tile.letter}`}
              disabled={used}
              style={{
                width: 68, height: 68,
                borderRadius: 16,
                border: 'none',
                background: used ? '#e0e0e0' : isWrong ? '#FF6B6B' : 'white',
                color: used ? '#bbb' : isWrong ? 'white' : '#333',
                fontFamily: "'Fredoka One', cursive",
                fontSize: 30,
                boxShadow: used ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                cursor: used ? 'default' : 'pointer',
                transform: isWrong ? 'scale(0.88)' : 'scale(1)',
                transition: 'all 0.2s ease',
                opacity: used ? 0.5 : 1,
              }}
            >
              {tile.letter}
            </button>
          );
        })}
      </div>

      {typed.length > 0 && (
        <button
          onClick={() => setTyped([])}
          style={{
            background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 12,
            padding: '8px 20px', color: 'white', fontFamily: "'Fredoka One', cursive",
            fontSize: 16, cursor: 'pointer'
          }}
        >
          🔄 Clear
        </button>
      )}

      <p className="score-display-inline">Score: {score}</p>
      <AdBanner />
    </div>
  );
}
