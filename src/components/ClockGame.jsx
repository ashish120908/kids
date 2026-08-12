import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import useQuizGame from '../hooks/useQuizGame'
import { shuffle, randomInt } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const TOTAL = 10;

function formatTime(hours, minutes) {
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')}`;
}

function makeQuestion(level) {
  const cfg = getLevelConfig('clock', level) || { minuteStep: 60, choiceCount: 4 };
  const step = Math.max(1, cfg.minuteStep);
  const totalSteps = Math.max(1, Math.floor(60 / step));
  const minutes = randomInt(0, totalSteps - 1) * step;
  const hours = randomInt(1, 12);
  const answer = formatTime(hours, minutes);

  // choiceCount was ignored before — every level offered exactly 4 options,
  // so levels 1-2 (meant to be 2 and 3 options) were as hard as level 8.
  const wanted = Math.max(2, cfg.choiceCount || 4);
  const choices = new Set([answer]);
  let guard = 0;
  while (choices.size < wanted && guard < 300) {
    guard++;
    // Near-miss distractors teach clock reading: same hour different minutes,
    // or the neighbouring hour.
    const useNearHour = Math.random() < 0.6;
    const wHours = useNearHour
      ? ((hours + (Math.random() < 0.5 ? 1 : 11) - 1) % 12) + 1
      : randomInt(1, 12);
    const wMinutes = randomInt(0, totalSteps - 1) * step;
    choices.add(formatTime(wHours, wMinutes));
  }
  // If the step is coarse there may not be enough distinct times; widen.
  while (choices.size < wanted && guard < 900) {
    guard++;
    choices.add(formatTime(randomInt(1, 12), randomInt(0, 11) * 5));
  }

  return { hours, minutes, answer, options: shuffle([...choices]), id: `${hours}:${minutes}` };
}

function AnalogClock({ hours, minutes }) {
  const cx = 100, cy = 100, r = 85;
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  const handCoords = (angle, length) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * length, y: cy + Math.sin(rad) * length };
  };

  const hourTip = handCoords(hourAngle, 48);
  const minuteTip = handCoords(minuteAngle, 68);

  return (
    <svg
      viewBox="0 0 200 200"
      className="analog-clock"
      role="img"
      aria-label={`Clock showing ${formatTime(hours, minutes)}`}
    >
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#7C4DFF" strokeWidth="6" />

      {/* Minute ticks — makes reading "quarter past" possible at all */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = ((i * 6 - 90) * Math.PI) / 180;
        const isHour = i % 5 === 0;
        const inner = isHour ? 74 : 78;
        return (
          <line
            key={i}
            x1={cx + Math.cos(angle) * inner}
            y1={cy + Math.sin(angle) * inner}
            x2={cx + Math.cos(angle) * 82}
            y2={cy + Math.sin(angle) * 82}
            stroke={isHour ? '#7C4DFF' : '#C5B3F5'}
            strokeWidth={isHour ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        const rad = (((num / 12) * 360 - 90) * Math.PI) / 180;
        return (
          <text
            key={num}
            x={cx + Math.cos(rad) * 62}
            y={cy + Math.sin(rad) * 62}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fill="#251043"
            fontFamily="'Fredoka One', cursive"
          >
            {num}
          </text>
        );
      })}

      <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke="#251043" strokeWidth="7" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteTip.x} y2={minuteTip.y} stroke="#E040FB" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#FFD700" stroke="#251043" strokeWidth="1.5" />
    </svg>
  );
}

export default function ClockGame() {
  const navigate = useNavigate();

  const makeQuestions = useCallback((lvl) => {
    const round = [];
    const seen = new Set();
    let guard = 0;
    while (round.length < TOTAL && guard < TOTAL * 60) {
      guard++;
      const q = makeQuestion(lvl);
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      round.push(q);
    }
    while (round.length < TOTAL) round.push(makeQuestion(lvl));
    return round;
  }, []);

  const g = useQuizGame({ gameKey: 'clock', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="clock" gameTitle="Clock Reading" gameEmoji="🕐" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Clock Reading" level={g.level}
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
      gameTitle="Clock Reading" level={g.level} current={g.current} total={TOTAL} score={g.score}
      showConfetti={g.showConfetti} questionText="What time is it?"
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div className="clock-stage">
        <AnalogClock hours={q.hours} minutes={q.minutes} />
      </div>
      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
