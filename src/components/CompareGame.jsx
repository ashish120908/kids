import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import useQuizGame from '../hooks/useQuizGame'
import { generateRound } from '../utils/questionEngine'
import '../styles/Games.css'

const TOTAL = 10;

export default function CompareGame() {
  const navigate = useNavigate();
  const makeQuestions = useCallback((lvl) => generateRound('compare', lvl, TOTAL), []);
  const g = useQuizGame({ gameKey: 'compare', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="compare" gameTitle="Compare Numbers" gameEmoji="⚖️" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Compare Numbers" level={g.level}
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
      gameTitle="Compare" level={g.level} current={g.current} total={TOTAL} score={g.score}
      showConfetti={g.showConfetti}
      questionText={`${q.a}  ?  ${q.b}`}
      hint="Which sign goes in the middle?"
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
