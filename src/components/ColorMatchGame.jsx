import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import useQuizGame from '../hooks/useQuizGame'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

// Ordered easiest → hardest to tell apart. levelConfig.colorCount slices this
// list, so level 1 only ever sees the four unmistakable primaries and later
// levels bring in the confusable ones (teal vs cyan, indigo vs purple).
const COLORS = [
  { name: 'Red', hex: '#FF4D4D' },
  { name: 'Blue', hex: '#4D79FF' },
  { name: 'Green', hex: '#2ECC71' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Brown', hex: '#8D6E63' },
  { name: 'Cyan', hex: '#00CED1' },
  { name: 'Grey', hex: '#95A5A6' },
  { name: 'Lime', hex: '#A4E400' },
  { name: 'Teal', hex: '#008B8B' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Maroon', hex: '#800000' },
];

const TOTAL = 10;

export default function ColorMatchGame() {
  const navigate = useNavigate();

  const makeQuestions = useCallback((lvl) => {
    const cfg = getLevelConfig('color-match', lvl) || { colorCount: 4, choiceCount: 4 };
    const palette = COLORS.slice(0, Math.min(COLORS.length, Math.max(2, cfg.colorCount)));
    const choiceCount = Math.min(Math.max(2, cfg.choiceCount || 4), palette.length);

    const round = [];
    let lastName = null;
    for (let i = 0; i < TOTAL; i++) {
      let target;
      // Don't ask for the same colour twice in a row.
      do {
        target = palette[Math.floor(Math.random() * palette.length)];
      } while (palette.length > 1 && target.name === lastName);
      lastName = target.name;

      const others = shuffle(palette.filter((c) => c.name !== target.name)).slice(0, choiceCount - 1);
      round.push({ target, answer: target.name, options: shuffle([target, ...others]) });
    }
    return round;
  }, []);

  const g = useQuizGame({
    gameKey: 'color-match',
    total: TOTAL,
    makeQuestions,
    isCorrect: (choice, q) => choice.name === q.answer,
    keyOf: (choice) => (typeof choice === 'string' ? choice : choice.name),
  });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="color-match" gameTitle="Color Match" gameEmoji="🎨" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Color Match" level={g.level}
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
      gameTitle="Color Match" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText={`Which one is ${q.target.name}?`}
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div
        className="color-swatch"
        style={{ background: q.target.hex, boxShadow: `0 12px 32px ${q.target.hex}88, inset 0 3px 0 rgba(255,255,255,0.4)` }}
        aria-label={`Colour swatch: ${q.target.name}`}
      />
      <ChoiceRow
        options={q.options}
        correctKey={q.answer}
        statusFor={g.statusFor}
        onChoose={g.answer}
        keyOf={(c) => c.name}
      />
    </SpaceGameLayout>
  );
}
