import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LevelPicker from './LevelPicker'
import ScoreSummary from './ScoreSummary'
import SpaceGameLayout from './SpaceGameLayout'
import { saveScore } from '../utils/scoreManager'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager'
import '../styles/Games.css'

const ALL_EMOJIS = [
  '🐱','🐶','🐸','🐻','🦊','🐷','🦁','🐮','🐼','🐨','🐯','🦋',
  '🐙','🦄','🐳','🦀','🐬','🦜','🦩','🐞','🦔','🐢','🦒','🦘',
];

function buildCards(pairs) {
  const emojis = shuffle(ALL_EMOJIS).slice(0, pairs);
  return shuffle([...emojis, ...emojis]).map((value, i) => ({
    id: i,
    value,
    flipped: false,
    matched: false,
  }));
}

/**
 * Memory is scored on efficiency, not on whether you finished — you always
 * finish eventually. We convert "moves taken" into the same 0-100% scale the
 * other games use so the star count shown here matches the star count saved
 * to progress. (Before, it always saved a perfect score and awarded 3 stars
 * while the screen showed 1.)
 */
function starsForMoves(moves, pairs) {
  if (moves <= pairs + 2) return 3;
  if (moves <= pairs * 2) return 2;
  return 1;
}

function scoreForStars(stars, pairs) {
  if (stars >= 3) return pairs;
  if (stars === 2) return Math.ceil(pairs * 0.75);
  return Math.ceil(pairs * 0.5);
}

export default function MemoryFlipGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(1);
  const [totalPairs, setTotalPairs] = useState(0);
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(confettiRef.current);
  }, []);

  const startGame = (lvl) => {
    const safeLevel = Math.max(1, lvl || 1);
    const cfg = getLevelConfig('memory', safeLevel) || { pairs: 4 };
    const pairs = Math.min(ALL_EMOJIS.length, Math.max(2, cfg.pairs));
    clearTimeout(timerRef.current);
    clearTimeout(confettiRef.current);
    setLevel(safeLevel);
    setTotalPairs(pairs);
    setCards(buildCards(pairs));
    setFlippedIds([]);
    setMatchedCount(0);
    setMoves(0);
    setLocked(false);
    setShowConfetti(false);
    setPhase('play');
  };

  const handleCardClick = useCallback((card) => {
    if (locked || card.flipped || card.matched) return;

    const newCards = cards.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
    const newFlipped = [...flippedIds, card.id];
    setCards(newCards);
    setFlippedIds(newFlipped);

    if (newFlipped.length < 2) return;

    setLocked(true);
    const newMoves = moves + 1;
    setMoves(newMoves);
    const [firstId, secondId] = newFlipped;
    const first = newCards.find((c) => c.id === firstId);
    const second = newCards.find((c) => c.id === secondId);

    if (first.value === second.value) {
      const matched = newCards.map((c) =>
        c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
      );
      const newMatchedCount = matchedCount + 1;
      setCards(matched);
      setFlippedIds([]);
      setMatchedCount(newMatchedCount);
      playCorrect();
      setShowConfetti(true);
      clearTimeout(confettiRef.current);
      confettiRef.current = setTimeout(() => setShowConfetti(false), 900);
      setLocked(false);

      if (newMatchedCount >= totalPairs) {
        const stars = starsForMoves(newMoves, totalPairs);
        saveScore('memory', level, scoreForStars(stars, totalPairs), totalPairs);
        playGameComplete();
        setPhase('done');
      }
    } else {
      playWrong();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCards((prev) => prev.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
        ));
        setFlippedIds([]);
        setLocked(false);
      }, 900);
    }
  }, [locked, cards, flippedIds, matchedCount, totalPairs, level, moves]);

  if (phase === 'pick') {
    return <LevelPicker gameName="memory" gameTitle="Memory Flip" gameEmoji="🃏" onSelectLevel={startGame} />;
  }

  if (phase === 'done') {
    const stars = starsForMoves(moves, totalPairs);
    return (
      <ScoreSummary
        score={scoreForStars(stars, totalPairs)}
        total={totalPairs}
        gameName={`Memory Flip — ${moves} moves`}
        level={level}
        onPlayAgain={() => startGame(level)}
        onNextLevel={() => startGame(level + 1)}
        onPickLevel={() => setPhase('pick')}
        onHome={() => navigate('/')}
      />
    );
  }

  const cols = totalPairs <= 4 ? 4 : totalPairs <= 8 ? 4 : totalPairs <= 12 ? 6 : 8;

  return (
    <SpaceGameLayout
      gameTitle="Memory Flip"
      level={level}
      current={matchedCount}
      total={totalPairs}
      score={matchedCount}
      showConfetti={showConfetti}
      questionText="Find the matching pairs!"
      hint={`Moves: ${moves}`}
      onNext={() => startGame(level)}
      onSkip={() => startGame(level)}
      onOpenSettings={() => setPhase('pick')}
    >
      <div
        className="memory-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => {
          const revealed = card.flipped || card.matched;
          return (
            <button
              key={card.id}
              className={`memory-card${card.matched ? ' memory-card-matched' : ''}${card.flipped && !card.matched ? ' memory-card-flipped' : ''}`}
              onClick={() => handleCardClick(card)}
              aria-label={revealed ? `Card showing ${card.value}` : 'Hidden card'}
            >
              {revealed ? card.value : '❓'}
            </button>
          );
        })}
      </div>
    </SpaceGameLayout>
  );
}
