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

export default function TimesTablesGame() {
  const navigate = useNavigate();
  const makeQuestions = useCallback((lvl) => generateRound('times-tables', lvl, TOTAL), []);
  const g = useQuizGame({ gameKey: 'times-tables', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="times-tables" gameTitle="Times Tables" gameEmoji="✖️" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Times Tables" level={g.level}
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
      gameTitle="Times Tables" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText={`${q.a} × ${q.b} = ?`}
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
