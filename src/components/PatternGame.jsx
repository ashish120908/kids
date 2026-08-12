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

const EMOJI_POOL = [
  '🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🍎', '🍊', '🐱', '🐶',
  '🌸', '🌻', '🚀', '🌍', '🦁', '🐯', '🎵', '🎸', '❤️', '💎',
];

/* ── emoji patterns ──────────────────────────────────────── */

function emojiPattern(groupSize, choiceCount) {
  const pool = shuffle(EMOJI_POOL);
  const motif = pool.slice(0, groupSize);
  const showCount = groupSize * 2 + randomInt(0, groupSize - 1); // 1.5–2.5 repeats
  const sequence = Array.from({ length: showCount }, (_, i) => motif[i % groupSize]);
  const answer = motif[showCount % groupSize];

  // Distractors: the other motif members first (genuinely tempting), then
  // unrelated emoji.
  const distractors = [
    ...motif.filter((e) => e !== answer),
    ...pool.slice(groupSize).filter((e) => !motif.includes(e)),
  ];
  const options = shuffle([answer, ...distractors.slice(0, Math.max(1, choiceCount - 1))]);
  return { sequence, answer, options, kind: 'emoji' };
}

/* ── number patterns ─────────────────────────────────────── */

function numberPattern(type, choiceCount) {
  let sequence;
  let answer;

  if (type === 'fibonacci') {
    let a = randomInt(1, 4);
    let b = a + randomInt(1, 4);
    sequence = [a, b];
    for (let i = 0; i < 3; i++) {
      const next = sequence[sequence.length - 1] + sequence[sequence.length - 2];
      sequence.push(next);
    }
    answer = sequence[sequence.length - 1] + sequence[sequence.length - 2];
  } else if (type.startsWith('numMul')) {
    const factor = Number(type.replace('numMul', '')) || 2;
    const start = randomInt(1, 5);
    sequence = [start];
    for (let i = 0; i < 3; i++) sequence.push(sequence[sequence.length - 1] * factor);
    answer = sequence[sequence.length - 1] * factor;
  } else {
    const step = Number(type.replace('numAdd', '')) || 1;
    const start = randomInt(1, 12);
    sequence = Array.from({ length: 4 }, (_, i) => start + step * i);
    answer = start + step * 4;
  }

  // Offsets scale with the answer so distractors stay plausible: ±1 next to
  // 2048 is not a real choice, but ±1 next to 7 is.
  const spread = Math.max(1, Math.round(Math.abs(answer) * 0.15));
  const nudges = [1, -1, 2, -2, spread, -spread, spread * 2, -spread * 2, 3, -3];
  const options = new Set([answer]);
  for (const d of shuffle(nudges)) {
    if (options.size >= choiceCount) break;
    const candidate = answer + d;
    if (candidate !== answer && candidate > 0) options.add(candidate);
  }
  let widen = 1;
  while (options.size < choiceCount && widen < 200) {
    if (answer + widen > 0) options.add(answer + widen);
    if (answer - widen > 0) options.add(answer - widen);
    widen++;
  }

  return { sequence, answer, options: shuffle([...options]), kind: 'number' };
}

function makeQuestion(level) {
  const cfg = getLevelConfig('pattern', level) || { type: 'emoji2', choiceCount: 4 };
  const choiceCount = Math.max(2, cfg.choiceCount || 4);

  // Previously every non-emoji level produced the same "+2" sequence, so
  // levels 5 through 10 (add-1, add-2, ×2, add-3, ×3, Fibonacci) were all
  // identical in difficulty and none matched their own config.
  if (cfg.type === 'emoji2') return emojiPattern(2, choiceCount);
  if (cfg.type === 'emoji3') return emojiPattern(3, choiceCount);
  return numberPattern(cfg.type, choiceCount);
}

export default function PatternGame() {
  const navigate = useNavigate();

  const makeQuestions = useCallback((lvl) => {
    const round = [];
    const seen = new Set();
    let guard = 0;
    while (round.length < TOTAL && guard < TOTAL * 60) {
      guard++;
      const q = makeQuestion(lvl);
      const key = `${q.kind}:${q.sequence.join('|')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      round.push(q);
    }
    while (round.length < TOTAL) round.push(makeQuestion(lvl));
    return round;
  }, []);

  const g = useQuizGame({ gameKey: 'pattern', total: TOTAL, makeQuestions });

  if (g.phase === 'pick') {
    return <LevelPicker gameName="pattern" gameTitle="Pattern Game" gameEmoji="🔁" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Pattern Game" level={g.level}
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
      gameTitle="Patterns" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText="What comes next?"
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div className="pattern-strip">
        {q.sequence.map((item, i) => (
          <span key={i} className="pattern-cell">{item}</span>
        ))}
        <span className="pattern-cell pattern-cell-blank" aria-label="missing item">?</span>
      </div>

      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
