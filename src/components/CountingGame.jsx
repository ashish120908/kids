import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import useQuizGame from '../hooks/useQuizGame'
import { generateRound } from '../utils/questionEngine'
import { shuffle } from '../utils/gameHelpers'
import '../styles/Games.css'

const EMOJIS = ['🍎', '⭐', '🎈', '🐶', '🐱', '🚗', '🚀', '🐰', '🍓', '🐝'];
const TOTAL = 10;

export default function CountingGame() {
  const navigate = useNavigate();

  // Early levels only have a handful of possible counts (level 1 caps at 3),
  // so we vary the emoji as well — otherwise ten questions in a row look
  // identical even though the engine considers them distinct.
  const makeQuestions = useCallback((lvl) => {
    const emojis = shuffle(EMOJIS);
    return generateRound('counting', lvl, TOTAL).map((q, i) => ({
      ...q,
      emoji: emojis[i % emojis.length],
    }));
  }, []);

  const g = useQuizGame({ gameKey: 'counting', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="counting" gameTitle="Counting Game" gameEmoji="🔢" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Counting Game" level={g.level}
        onPlayAgain={() => g.startGame(g.level)}
        onNextLevel={() => g.startGame(g.level + 1)}
        onPickLevel={g.openPicker}
        onHome={() => navigate('/')}
      />
    );
  }

  const q = g.question;
  if (!q) return null;

  return (
    <SpaceGameLayout
      gameTitle="Counting" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText="How many items?"
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div className="counting-tray" aria-label={`${q.answer} items to count`}>
        {Array.from({ length: q.answer }).map((_, i) => (
          <span key={i} className="counting-item" style={{ animationDelay: `${i * 0.07}s` }}>
            {q.emoji}
          </span>
        ))}
      </div>

      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
