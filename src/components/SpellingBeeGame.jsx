import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import LevelPicker from './LevelPicker'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const ALL_WORDS = [
  // 3-letter words
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
  { word: 'EGG', emoji: '🥚', hint: 'A breakfast food from a hen' },
  { word: 'JAM', emoji: '🍓', hint: 'Sweet spread on toast' },
  { word: 'NET', emoji: '🥅', hint: 'Used to catch things' },
  { word: 'POT', emoji: '🪴', hint: 'You cook soup in it' },
  { word: 'RAT', emoji: '🐀', hint: 'A small rodent' },
  { word: 'BAT', emoji: '🦇', hint: 'It flies at night' },
  // 4-letter words
  { word: 'CAKE', emoji: '🎂', hint: 'Sweet birthday treat' },
  { word: 'FISH', emoji: '🐟', hint: 'Swims in the water' },
  { word: 'FROG', emoji: '🐸', hint: 'Jumps and ribbits' },
  { word: 'BEAR', emoji: '🐻', hint: 'A big furry animal' },
  { word: 'BIRD', emoji: '🐦', hint: 'It flies with wings' },
  { word: 'DUCK', emoji: '🦆', hint: 'It quacks and swims' },
  { word: 'KING', emoji: '👑', hint: 'Rules a kingdom' },
  { word: 'LION', emoji: '🦁', hint: 'The king of the jungle' },
  { word: 'MILK', emoji: '🥛', hint: 'A white drink from cows' },
  { word: 'MOON', emoji: '🌙', hint: 'Shines in the night sky' },
  { word: 'RAIN', emoji: '🌧️', hint: 'Water falling from clouds' },
  { word: 'STAR', emoji: '⭐', hint: 'Twinkles in the night sky' },
  { word: 'TREE', emoji: '🌳', hint: 'Has leaves and branches' },
  { word: 'WOLF', emoji: '🐺', hint: 'A wild dog that howls' },
  { word: 'BELL', emoji: '🔔', hint: 'It rings when you shake it' },
  { word: 'BOOK', emoji: '📚', hint: 'You read stories in it' },
  { word: 'CORN', emoji: '🌽', hint: 'A yellow vegetable' },
  { word: 'FIRE', emoji: '🔥', hint: 'Hot and glowing flames' },
  { word: 'GOLD', emoji: '🥇', hint: 'A shiny yellow metal' },
  { word: 'KITE', emoji: '🪁', hint: 'It flies on a string' },
  // 5-letter words
  { word: 'APPLE', emoji: '🍎', hint: 'A crunchy red or green fruit' },
  { word: 'BEACH', emoji: '🏖️', hint: 'Sandy shore near the ocean' },
  { word: 'BREAD', emoji: '🍞', hint: 'You make sandwiches with it' },
  { word: 'CAMEL', emoji: '🐪', hint: 'Desert animal with humps' },
  { word: 'CLOUD', emoji: '☁️', hint: 'Fluffy white things in the sky' },
  { word: 'DANCE', emoji: '💃', hint: 'Moving to music' },
  { word: 'EAGLE', emoji: '🦅', hint: 'A large bird of prey' },
  { word: 'GRAPE', emoji: '🍇', hint: 'Small round purple fruit' },
  { word: 'HORSE', emoji: '🐴', hint: 'You can ride it' },
  { word: 'HOUSE', emoji: '🏠', hint: 'A place where people live' },
  { word: 'JUICE', emoji: '🧃', hint: 'Drink made from fruit' },
  { word: 'LEMON', emoji: '🍋', hint: 'A sour yellow fruit' },
  { word: 'MOUSE', emoji: '🐭', hint: 'A tiny animal that squeaks' },
  { word: 'MUSIC', emoji: '🎵', hint: 'Sounds that make a melody' },
  { word: 'OCEAN', emoji: '🌊', hint: 'A huge body of salt water' },
  { word: 'PIZZA', emoji: '🍕', hint: 'Round food with cheese and toppings' },
  { word: 'QUEEN', emoji: '👸', hint: 'She rules a kingdom' },
  { word: 'TIGER', emoji: '🐯', hint: 'A big striped wild cat' },
  { word: 'TRAIN', emoji: '🚂', hint: 'Travels on tracks' },
  { word: 'SHARK', emoji: '🦈', hint: 'A big fish with sharp teeth' },
  // 6-letter words
  { word: 'BASKET', emoji: '🧺', hint: 'You carry things in it' },
  { word: 'BOTTLE', emoji: '🍶', hint: 'A container for drinks' },
  { word: 'BRIDGE', emoji: '🌉', hint: 'Crosses over a river' },
  { word: 'BUTTER', emoji: '🧈', hint: 'Spread it on your toast' },
  { word: 'CANDLE', emoji: '🕯️', hint: 'Gives light when it burns' },
  { word: 'CASTLE', emoji: '🏰', hint: 'A big stone fort for royals' },
  { word: 'CHEESE', emoji: '🧀', hint: 'Yellow dairy food' },
  { word: 'CHERRY', emoji: '🍒', hint: 'Small red fruit on a stem' },
  { word: 'COOKIE', emoji: '🍪', hint: 'A sweet baked treat' },
  { word: 'CRAYON', emoji: '🖍️', hint: 'You draw colorful pictures with it' },
  { word: 'FINGER', emoji: '☝️', hint: 'Part of your hand' },
  { word: 'GARDEN', emoji: '🌷', hint: 'Where flowers and vegetables grow' },
  { word: 'MONKEY', emoji: '🐒', hint: 'A playful animal that climbs trees' },
  { word: 'PENCIL', emoji: '✏️', hint: 'You write with it' },
  { word: 'RABBIT', emoji: '🐰', hint: 'A fluffy animal with long ears' },
  { word: 'ROCKET', emoji: '🚀', hint: 'It blasts off into space' },
  { word: 'SPIDER', emoji: '🕷️', hint: 'It spins a web' },
  { word: 'TURTLE', emoji: '🐢', hint: 'It carries a shell on its back' },
  { word: 'YELLOW', emoji: '💛', hint: 'The color of the sun' },
  { word: 'ZIPPER', emoji: '🤐', hint: 'Opens and closes your jacket' },
  // 7-letter words
  { word: 'BALLOON', emoji: '🎈', hint: 'Filled with air and floats' },
  { word: 'BLANKET', emoji: '🛏️', hint: 'Keeps you warm in bed' },
  { word: 'CARTOON', emoji: '📺', hint: 'Animated TV show for kids' },
  { word: 'CHICKEN', emoji: '🐔', hint: 'A farm bird that lays eggs' },
  { word: 'DOLPHIN', emoji: '🐬', hint: 'A smart ocean mammal' },
  { word: 'FEATHER', emoji: '🪶', hint: 'Soft covering on a bird' },
  { word: 'PENGUIN', emoji: '🐧', hint: 'A black and white bird that swims' },
  { word: 'TEACHER', emoji: '👩‍🏫', hint: 'Helps you learn at school' },
  { word: 'THUNDER', emoji: '⛈️', hint: 'Loud sound during a storm' },
  { word: 'RAINBOW', emoji: '🌈', hint: 'Colorful arc after rain' },
  // 8-letter words
  { word: 'AIRPLANE', emoji: '✈️', hint: 'It flies through the sky' },
  { word: 'BIRTHDAY', emoji: '🎂', hint: 'The day you were born' },
  { word: 'CALENDAR', emoji: '📅', hint: 'Shows days and months' },
  { word: 'DINOSAUR', emoji: '🦕', hint: 'Ancient reptile, now extinct' },
  { word: 'ELEPHANT', emoji: '🐘', hint: 'The largest land animal' },
  { word: 'EXERCISE', emoji: '🏃', hint: 'Moving your body to stay healthy' },
  { word: 'PRINCESS', emoji: '👸', hint: 'A royal girl in a fairy tale' },
  { word: 'SURPRISE', emoji: '🎁', hint: 'Something unexpected and exciting' },
  { word: 'TRIANGLE', emoji: '🔺', hint: 'A shape with three sides' },
  { word: 'UMBRELLA', emoji: '☂️', hint: 'Keeps you dry in the rain' },
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

function getWordsForLevel(level) {
  const cfg = getLevelConfig('spelling', level);
  const filtered = ALL_WORDS.filter(w => w.word.length >= cfg.minLength && w.word.length <= cfg.maxLength);
  // If not enough words at this exact range, fall back to closest range
  if (filtered.length < TOTAL) {
    const fallback = ALL_WORDS.filter(w => w.word.length <= cfg.maxLength);
    return shuffle(fallback).slice(0, TOTAL);
  }
  return shuffle(filtered).slice(0, TOTAL);
}

export default function SpellingBeeGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(null);
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

  const currentWord = wordListRef.current ? wordListRef.current[current] : null;

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
            saveScore('spelling', level, newScore, TOTAL);
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
  }, [feedback, typed, currentWord, score, current, level]);

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
        onNextLevel={level < 10 ? () => startGame(level + 1) : null}
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
      <h2 className="game-title">Level {level} — Spelling Bee 🐝</h2>

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
