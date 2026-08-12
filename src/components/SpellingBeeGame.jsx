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
  const [phase, setPhase] = useState('pick');
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

  useEffect(() => () => clearTimeout(timerRef.current), []);

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

  // Same fix as the other games: skipping the final word now ends the round
  // instead of silently restarting it and discarding the score.
  const handleNext = () => {
    clearTimeout(timerRef.current);
    setFeedback(null);
    setWrongId(null);
    setShowConfetti(false);
    const next = current + 1;
    if (next < TOTAL && wordListRef.current && wordListRef.current[next]) {
      setCurrent(next);
      setTyped([]);
      setTiles(makeTiles(wordListRef.current[next].word));
    } else {
      saveScore('spelling', level, score, TOTAL);
      playGameComplete();
      setPhase('done');
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
        onPickLevel={() => setPhase('pick')}
        onHome={() => navigate('/')}
      />
    );
  }

  const typedLetters = typed.map(id => (tiles.find(t => t.id === id) || { letter: '' }).letter);

  return (
    <SpaceGameLayout
      gameTitle="Spelling"
      level={level}
      current={current}
      total={TOTAL}
      score={score}
      showConfetti={showConfetti}
      questionText={`${currentWord.emoji} Spell the word!`}
      hint={currentWord.hint}
      onNext={handleNext}
      onSkip={handleNext}
      onOpenSettings={() => setPhase('pick')}
    >
      <div className="speak-row">
        <button className="speak-btn" onClick={() => speakWord(currentWord.word)} aria-label="Hear the word">
          🔊 Hear Word
        </button>
      </div>

      <div className="slot-row">
        {currentWord.word.split('').map((_, i) => (
          <span key={i} className={`word-slot${typedLetters[i] ? ' slot-filled' : ''}`}>
            {typedLetters[i] || ''}
          </span>
        ))}
      </div>

      <div className="tile-grid">
        {tiles.map((tile) => {
          const used = typed.includes(tile.id);
          return (
            <button
              key={tile.id}
              className={`letter-tile${used ? ' letter-tile-used' : ''}${wrongId === tile.id ? ' letter-tile-wrong' : ''}`}
              onClick={() => handleLetterTap(tile)}
              disabled={used}
              aria-label={`Letter ${tile.letter}`}
            >
              {tile.letter}
            </button>
          );
        })}
      </div>
    </SpaceGameLayout>
  );
}
