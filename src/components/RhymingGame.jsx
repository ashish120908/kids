import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreSummary from './ScoreSummary'
import LevelPicker from './LevelPicker'
import ChoiceRow from './ChoiceRow'
import SpaceGameLayout from './SpaceGameLayout'
import useQuizGame from '../hooks/useQuizGame'
import { shuffle } from '../utils/gameHelpers'
import { getLevelConfig } from '../utils/levelConfig'
import '../styles/Games.css'

const TOTAL = 10;

const RHYME_FAMILIES = [
  { family: 'at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'pat', 'fat'] },
  { family: 'og', words: ['dog', 'log', 'fog', 'hog', 'frog', 'blog'] },
  { family: 'un', words: ['sun', 'fun', 'run', 'bun', 'pun', 'nun'] },
  { family: 'in', words: ['pin', 'bin', 'tin', 'win', 'fin', 'chin'] },
  { family: 'op', words: ['top', 'hop', 'pop', 'mop', 'cop', 'drop'] },
  { family: 'ig', words: ['pig', 'big', 'dig', 'fig', 'wig', 'jig'] },
  { family: 'ed', words: ['red', 'bed', 'fed', 'led', 'wed', 'shed'] },
  { family: 'et', words: ['pet', 'jet', 'net', 'set', 'wet', 'met'] },
  { family: 'ug', words: ['bug', 'hug', 'mug', 'rug', 'jug', 'tug'] },
  { family: 'ap', words: ['cap', 'map', 'nap', 'tap', 'rap', 'gap'] },
  { family: 'ake', words: ['cake', 'lake', 'make', 'rake', 'take', 'bake', 'wake'] },
  { family: 'ing', words: ['king', 'ring', 'sing', 'wing', 'bring', 'spring', 'thing'] },
  { family: 'all', words: ['ball', 'call', 'fall', 'hall', 'tall', 'wall', 'small'] },
  { family: 'ight', words: ['light', 'night', 'right', 'sight', 'might', 'fight', 'bright'] },
  { family: 'ound', words: ['round', 'sound', 'found', 'ground', 'pound', 'hound'] },
];

function makeQuestion(level) {
  const cfg = getLevelConfig('rhyming', level) || { wordLen: 3, choiceCount: 4, tricky: false };
  const maxLen = Math.max(3, cfg.wordLen);
  const choiceCount = Math.max(2, cfg.choiceCount || 4);

  // wordLen was read from config but never used — every level served the same
  // three-letter words.
  const eligible = RHYME_FAMILIES
    .map((f) => ({ ...f, words: f.words.filter((w) => w.length <= maxLen) }))
    .filter((f) => f.words.length >= 2);

  const target = eligible[Math.floor(Math.random() * eligible.length)];
  const picked = shuffle(target.words);
  const targetWord = picked[0].toUpperCase();
  const answer = picked[1].toUpperCase();

  // "tricky" distractors share the target's first letter, so the child has to
  // listen to the ending rather than pattern-match the start of the word.
  const otherFamilies = shuffle(eligible.filter((f) => f.family !== target.family));
  const pool = [];
  for (const fam of otherFamilies) {
    const words = cfg.tricky
      ? fam.words.filter((w) => w[0] === targetWord[0].toLowerCase())
      : fam.words;
    const source = words.length ? words : fam.words;
    const word = source[Math.floor(Math.random() * source.length)].toUpperCase();
    if (word !== answer && word !== targetWord && !pool.includes(word)) pool.push(word);
    if (pool.length >= choiceCount - 1) break;
  }

  return {
    targetWord,
    answer,
    options: shuffle([answer, ...pool.slice(0, choiceCount - 1)]),
  };
}

function speakWord(word) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(String(word).toLowerCase());
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  } catch { /* speech synthesis unavailable */ }
}

export default function RhymingGame() {
  const navigate = useNavigate();

  const makeQuestions = useCallback((lvl) => {
    const round = [];
    const seen = new Set();
    let guard = 0;
    while (round.length < TOTAL && guard < TOTAL * 60) {
      guard++;
      const q = makeQuestion(lvl);
      const key = `${q.targetWord}|${q.answer}`;
      if (seen.has(key)) continue;
      seen.add(key);
      round.push(q);
    }
    while (round.length < TOTAL) round.push(makeQuestion(lvl));
    return round;
  }, []);

  const g = useQuizGame({ gameKey: 'rhyming', total: TOTAL, makeQuestions });
  const targetWord = g.question ? g.question.targetWord : null;

  useEffect(() => {
    if (g.phase === 'play' && targetWord) speakWord(targetWord);
  }, [g.phase, targetWord]);

  // Stop any queued speech when leaving the game.
  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  }, []);

  if (g.phase === 'pick') {
    return <LevelPicker gameName="rhyming" gameTitle="Rhyming Game" gameEmoji="🎵" onSelectLevel={g.startGame} />;
  }

  if (g.phase === 'done') {
    return (
      <ScoreSummary
        score={g.score} total={TOTAL} gameName="Rhyming Game" level={g.level}
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
      gameTitle="Rhyming" level={g.level} current={g.current} total={TOTAL} score={g.score}
      wrongAttempts={g.wrongAttempts}
      showConfetti={g.showConfetti} questionText={`Rhymes with ${q.targetWord}?`}
      onNext={g.skip} onSkip={g.skip} onOpenSettings={g.openPicker}
    >
      <div className="speak-row">
        <button className="speak-btn" onClick={() => speakWord(q.targetWord)}>
          🔊 Hear "{q.targetWord}"
        </button>
      </div>

      <ChoiceRow options={q.options} correctKey={q.answer} statusFor={g.statusFor} onChoose={g.answer} />
    </SpaceGameLayout>
  );
}
