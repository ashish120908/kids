import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import ShapeGlyph from './ShapeGlyph'
import useQuizGame from '../hooks/useQuizGame'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

// Ordered easiest → hardest, sliced by levelConfig.shapeCount.
const SHAPES = [
  'Circle', 'Square', 'Triangle', 'Star',
  'Heart', 'Diamond', 'Rectangle', 'Oval',
  'Pentagon', 'Hexagon', 'Octagon', 'Crescent',
];

const COLORS = ['#FFD54F', '#4FC3F7', '#FF8A65', '#AED581', '#BA68C8', '#4DD0E1'];
const TOTAL = 10;

export default function ShapeMatchGame() {
  const navigate = useNavigate();

  const makeQuestions = useCallback((lvl) => {
    const cfg = getLevelConfig('shape-match', lvl) || { shapeCount: 4, choiceCount: 4 };
    const pool = SHAPES.slice(0, Math.min(SHAPES.length, Math.max(2, cfg.shapeCount)));
    const choiceCount = Math.min(Math.max(2, cfg.choiceCount || 4), pool.length);

    const round = [];
    let last = null;
    for (let i = 0; i < TOTAL; i++) {
      let target;
      do {
        target = pool[Math.floor(Math.random() * pool.length)];
      } while (pool.length > 1 && target === last);
      last = target;

      const others = shuffle(pool.filter((s) => s !== target)).slice(0, choiceCount - 1);
      round.push({
        target,
        answer: target,
        color: COLORS[i % COLORS.length],
        options: shuffle([target, ...others]),
      });
    }
    return round;
  }, []);

  const g = useQuizGame({ gameKey: 'shape-match', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="shape-match" gameTitle="Shape Match" gameEmoji="🔷" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Shape Match" level={g.level}
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
      gameTitle="Shape Match" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText="What shape is this?"
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div className="shape-stage">
        <ShapeGlyph name={q.target} color={q.color} size={160} />
      </div>
      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
