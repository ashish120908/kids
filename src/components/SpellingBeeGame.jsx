import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'

const ALL_WORDS = [
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
  { word: 'OWL', emoji: '🦉', hint: 'A bird that hoots at night' },
  { word: 'FOX', emoji: '🦊', hint: 'A clever orange animal' },
  { word: 'CAKE', emoji: '🎂', hint: 'Sweet birthday treat' },
  { word: 'FISH', emoji: '🐟', hint: 'Swims in the water' },
  { word: 'FROG', emoji: '🐸', hint: 'Jumps and ribbits' },
  { word: 'BEAR', emoji: '🐻', hint: 'A big furry animal' },
  { word: 'BIRD', emoji: '🐦', hint: 'It flies with wings' },
  { word: 'LION', emoji: '🦁', hint: 'The king of the jungle' },
  { word: 'MOON', emoji: '🌙', hint: 'Shines in the night sky' },
  { word: 'STAR', emoji: '⭐', hint: 'Twinkles in the night sky' },
  { word: 'APPLE', emoji: '🍎', hint: 'A crunchy red or green fruit' },
  { word: 'CLOUD', emoji: '☁️', hint: 'Fluffy white things in the sky' },
  { word: 'HOUSE', emoji: '🏠', hint: 'A place where people live' },
  { word: 'PIZZA', emoji: '🍕', hint: 'Round food with cheese and toppings' },
  { word: 'TRAIN', emoji: '🚂', hint: 'Travels on tracks' },
  { word: 'SHARK', emoji: '🦈', hint: 'A big fish with sharp teeth' },
  { word: 'CASTLE', emoji: '🏰', hint: 'A big stone fort for royals' },
  { word: 'ROCKET', emoji: '🚀', hint: 'It blasts off into space' },
  { word: 'RABBIT', emoji: '🐰', hint: 'A fluffy animal with long ears' },
  { word: 'RAINBOW', emoji: '🌈', hint: 'Colorful arc after rain' }
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

function makeTiles(word) {
  return shuffle(word.split('').map((letter, i) => ({ id: i, letter })));
}

function getWordsForLevel(level) {
  const cfg = getLevelConfig('spelling', level);
  const filtered = ALL_WORDS.filter(w => w.word.length >= cfg.minLength && w.word.length <= cfg.maxLength);
  if (filtered.length < TOTAL) {
    const fallback = ALL_WORDS.filter(w => w.word.length <= cfg.maxLength);
    return shuffle(fallback).slice(0, TOTAL);
  }
  return shuffle(filtered).slice(0, TOTAL);
}

export default function SpellingBeeGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('play');
  const [level, setLevel] = useState(1);
  const wordListRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const startGame = (lvl) => {
    wordListRef.current = getWordsForLevel(lvl);
    setLevel(lvl);
    setCurrent(0);
    setTyped([]);
    setTiles(makeTiles(wordListRef.current[0].word));
    setScore(0);
    setFeedback(null);
    setWrongId(null);
    setShowConfetti(false);
    setPhase('play');
  };

  useEffect(() => {
    startGame(1);
  }, []);

  const currentWord = wordListRef.current ? wordListRef.current[current] : { word: 'STAR', emoji: '⭐', hint: 'Twinkles in the night sky' };

  const handleLetterTap = useCallback((tile) => {
    if (feedback) return;
    if (typed.includes(tile.id)) return;
    const nextChar = currentWord.word[typed.length];
    if (tile.letter === nextChar) {
      const newTyped = [...typed, tile.id];
      setTyped(newTyped);
      setFeedback('correct');
      const wordComplete = newTyped.length === currentWord.word.length;
      if (wordComplete) { playCorrect(); setShowConfetti(true); }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (wordComplete) setShowConfetti(false);
        setFeedback(null);
        if (wordComplete) {
          const newScore = score + 1;
          const next = current + 1;
          if (next >= TOTAL) {
            saveScore('spelling', level, newScore, TOTAL);
            setScore(newScore);
            playGameComplete();
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
      playWrong();
      setWrongId(tile.id);
      setFeedback('wrong');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setWrongId(null);
      }, 700);
    }
  }, [feedback, typed, currentWord, score, current, level]);

  const handleNext = () => {
    if (current + 1 < TOTAL) {
      setCurrent(c => c + 1);
      setTyped([]);
      setTiles(makeTiles(wordListRef.current[current + 1].word));
    } else {
      startGame(level);
    }
  };

  if (phase === 'pick') {
    return <LevelPicker gameName="spelling" gameTitle="Spelling Bee" gameEmoji="🐝" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    return (
      <ScoreSummary
        score={score}
        total={TOTAL}
        gameName="Spelling Bee"
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={() => startGame(level + 1)}
        onHome={() => navigate('/')}
      />
    );
  }

  const typedLetters = typed.map(id => tiles.find(t => t.id === id).letter);

  return (
    <SpaceGameLayout
      gameTitle="Spelling Bee"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText={`${currentWord.emoji} Spell the word!`}
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 20, color: '#FFEAA7', margin: '0 0 12px', fontFamily: "'Fredoka One', cursive" }}>
          {currentWord.hint}
        </p>
        <button
          onClick={() => speakWord(currentWord.word)}
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF9100)', border: 'none', borderRadius: 50,
            padding: '10px 24px', fontSize: 18, cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive", color: '#251043',
            boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)'
          }}
        >
          🔊 Hear Word
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', minHeight: 64, marginBottom: 24 }}>
        {currentWord.word.split('').map((_, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 16,
            background: typedLetters[i] ? 'linear-gradient(135deg, #00E676, #00B0FF)' : 'rgba(255,255,255,0.12)',
            border: typedLetters[i] ? '2px solid #ffffff' : '2px dashed rgba(255,255,255,0.4)',
            color: '#ffffff',
            fontFamily: "'Fredoka One', cursive", fontSize: 32,
            boxShadow: typedLetters[i] ? '0 6px 16px rgba(0,230,118,0.4)' : 'none'
          }}>
            {typedLetters[i] || ''}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', maxWidth: 480 }}>
        {tiles.map((tile) => {
          const used = typed.includes(tile.id);
          const isWrong = wrongId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => handleLetterTap(tile)}
              disabled={used}
              style={{
                width: 72, height: 72,
                borderRadius: 20,
                border: '2px solid rgba(255,255,255,0.4)',
                background: used ? 'rgba(255,255,255,0.1)' : isWrong ? '#FF5252' : 'linear-gradient(135deg, #7C4DFF, #651FFF)',
                color: used ? 'rgba(255,255,255,0.3)' : '#ffffff',
                fontFamily: "'Fredoka One', cursive",
                fontSize: 34,
                boxShadow: used ? 'none' : '0 8px 20px rgba(101,31,255,0.4)',
                cursor: used ? 'default' : 'pointer',
                transform: isWrong ? 'scale(0.88)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
            >
              {tile.letter}
            </button>
          );
        })}
      </div>
    </SpaceGameLayout>
  );
}
