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

export default function AdditionGame() {
  const navigate = useNavigate();
  const makeQuestions = useCallback((lvl) => generateRound('addition', lvl, TOTAL), []);
  const g = useQuizGame({ gameKey: 'addition', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="addition" gameTitle="Addition Game" gameEmoji="➕" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Addition Game" level={g.level}
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
      gameTitle="Addition" level={g.level} current={g.current} total={TOTAL} score={g.score}
      showConfetti={g.showConfetti} questionText={`${q.a} + ${q.b} = ?`}
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
