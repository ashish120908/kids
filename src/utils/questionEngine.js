// ─────────────────────────────────────────────────────────────
// KidLearn question engine
//
// Every generator here is a PURE function of (level, rng) apart from the
// thin persistence layer at the bottom, so the whole thing can be unit
// tested in Node without a browser. See scripts/test-engine.mjs.
//
// Design rules:
//  1. A generator NEVER invents its own difficulty numbers — it reads
//     them from levelConfig.js. That file is the single source of truth.
//  2. A round of N questions is generated in one call so we can guarantee
//     no repeats inside the round (the old code generated one at a time
//     and happily handed the child the same sum three times).
//  3. Distractors are always valid answers for the domain (never negative,
//     never zero object counts) and always close enough to be tempting.
// ─────────────────────────────────────────────────────────────

import { getLevelConfig } from './levelConfig';

const STORAGE_KEY = 'kidlearn_answered_questions_v1';

/* ── persistence ─────────────────────────────────────────── */

function getAnsweredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnsweredHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch { /* storage full or blocked — history is a nicety, not a requirement */ }
}

export function recordQuestionAnswered(subject, questionId) {
  if (!subject || !questionId) return;
  const history = getAnsweredHistory();
  const seen = history[subject] || [];
  if (!seen.includes(questionId)) {
    seen.push(questionId);
    // Keep the log bounded so localStorage never grows without limit.
    history[subject] = seen.slice(-500);
    saveAnsweredHistory(history);
  }
}

export function resetQuestionHistory(subject) {
  if (!subject) {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return;
  }
  const history = getAnsweredHistory();
  delete history[subject];
  saveAnsweredHistory(history);
}

function seenSet(subject) {
  try {
    return new Set(getAnsweredHistory()[subject] || []);
  } catch {
    return new Set();
  }
}

/* ── helpers ─────────────────────────────────────────────── */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build `count` distinct choices around `answer`.
 *
 * `nudges` are offsets tried in order (closest-first is best for learning:
 * an off-by-one distractor teaches more than a wildly wrong one). Anything
 * failing `isValid` is skipped, so we never offer a negative sum or a
 * zero-object count. Falls back to widening offsets if the near ones run out.
 */
function buildChoices(answer, count, nudges, isValid) {
  const choices = new Set([answer]);
  for (const d of shuffle(nudges)) {
    if (choices.size >= count) break;
    const candidate = answer + d;
    if (candidate !== answer && isValid(candidate)) choices.add(candidate);
  }
  let widen = 1;
  while (choices.size < count && widen < 400) {
    for (const sign of [1, -1]) {
      const candidate = answer + sign * widen;
      if (candidate !== answer && isValid(candidate)) choices.add(candidate);
      if (choices.size >= count) break;
    }
    widen++;
  }
  return shuffle([...choices]);
}

const NEAR = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];

/**
 * Draw `count` items from `make()` with no duplicate `keyOf` inside the round.
 *
 * When the level's pool is genuinely smaller than the round (Counting level 1
 * only has 3 possible answers), we stop insisting on uniqueness and instead
 * guarantee no two *consecutive* questions are the same — which is what
 * actually matters to the child.
 */
function drawRound(count, make, keyOf, avoid = new Set()) {
  const picked = [];
  const used = new Set();
  let attempts = 0;
  const maxAttempts = count * 60;

  // Pass 1: unique AND not seen in a previous session.
  while (picked.length < count && attempts < maxAttempts) {
    attempts++;
    const item = make();
    const key = keyOf(item);
    if (used.has(key) || avoid.has(key)) continue;
    used.add(key);
    picked.push(item);
  }

  // Pass 2: unique within this round only (previous-session history relaxed).
  attempts = 0;
  while (picked.length < count && attempts < maxAttempts) {
    attempts++;
    const item = make();
    const key = keyOf(item);
    if (used.has(key)) continue;
    used.add(key);
    picked.push(item);
  }

  // Pass 3: pool is smaller than the round — allow repeats, but never
  // back-to-back.
  while (picked.length < count) {
    let item = make();
    let guard = 0;
    while (picked.length && keyOf(item) === keyOf(picked[picked.length - 1]) && guard < 25) {
      item = make();
      guard++;
    }
    picked.push(item);
  }

  return picked;
}

/* ── per-game generators ─────────────────────────────────── */

function makeAddition(level) {
  const cfg = getLevelConfig('addition', level);
  const max = Math.max(1, cfg.maxNum);
  const a = randInt(1, max);
  const b = randInt(1, max);
  const answer = a + b;
  return {
    id: `addition_${a}_+_${b}`,
    a, b, op: '+',
    prompt: `${a} + ${b} = ?`,
    answer,
    options: buildChoices(answer, cfg.choiceCount || 4, NEAR, (v) => v >= 0),
  };
}

function makeSubtraction(level) {
  const cfg = getLevelConfig('subtraction', level);
  const max = Math.max(2, cfg.maxNum);
  const a = randInt(2, max);
  const b = randInt(1, a);            // never a negative result
  const answer = a - b;
  return {
    id: `subtraction_${a}_-_${b}`,
    a, b, op: '-',
    prompt: `${a} - ${b} = ?`,
    answer,
    options: buildChoices(answer, cfg.choiceCount || 4, NEAR, (v) => v >= 0),
  };
}

function makeTimesTables(level) {
  const cfg = getLevelConfig('times-tables', level);
  const a = randInt(1, Math.max(1, cfg.maxTable));
  const b = randInt(1, Math.max(1, cfg.maxMultiplier));
  const answer = a * b;
  // The classic multiplication mistakes: one row up/down the table.
  const nudges = [a, -a, b, -b, 1, -1, 2, -2, a * 2, -a * 2];
  return {
    id: `times-tables_${a}_x_${b}`,
    a, b, op: '×',
    prompt: `${a} × ${b} = ?`,
    answer,
    options: buildChoices(answer, cfg.choiceCount || 4, nudges, (v) => v >= 0),
  };
}

function makeDivision(level) {
  const cfg = getLevelConfig('division', level);
  const divisor = randInt(2, Math.max(2, cfg.maxDivisor));
  const answer = randInt(1, Math.max(1, cfg.maxMultiplier));
  const dividend = divisor * answer;   // always a clean whole-number answer
  return {
    id: `division_${dividend}_/_${divisor}`,
    a: dividend, b: divisor, op: '÷',
    prompt: `${dividend} ÷ ${divisor} = ?`,
    answer,
    options: buildChoices(answer, cfg.choiceCount || 4, NEAR, (v) => v >= 1),
  };
}

function makeCounting(level) {
  const cfg = getLevelConfig('counting', level);
  const max = Math.max(1, cfg.maxCount);
  const answer = randInt(1, max);
  return {
    id: `counting_${answer}`,
    count: answer, op: 'count',
    prompt: 'How many items?',
    answer,
    // You can never see zero objects, and offering more than the level's
    // ceiling would be a giveaway, so clamp both ends.
    options: buildChoices(answer, cfg.choiceCount || 4, NEAR, (v) => v >= 1 && v <= max + 2),
  };
}

function makeCompare(level) {
  // This game was entirely broken before: the engine had no 'compare' branch,
  // so it silently fell through to addition and returned the number 0 as the
  // answer while the buttons offered '>', '<' and '='. Nothing could ever be
  // marked correct.
  const cfg = getLevelConfig('compare', level);
  const max = Math.max(1, cfg.maxNum);
  const a = randInt(1, max);
  let b;
  if (cfg.allowEqual && Math.random() < 0.2) {
    b = a;                              // deliberately produce some '=' rounds
  } else {
    do { b = randInt(1, max); } while (b === a && !cfg.allowEqual);
  }
  const answer = a > b ? '>' : a < b ? '<' : '=';
  return {
    id: `compare_${a}_?_${b}`,
    a, b, op: '?',
    prompt: `${a} ? ${b}`,
    answer,
    options: ['>', '<', '='],
    timeLimit: cfg.timeLimit || 0,
  };
}

const GENERATORS = {
  addition: makeAddition,
  subtraction: makeSubtraction,
  'times-tables': makeTimesTables,
  multiplication: makeTimesTables,
  division: makeDivision,
  counting: makeCounting,
  compare: makeCompare,
};

/* ── public API ──────────────────────────────────────────── */

/**
 * Generate a full round. This is the entry point every game should use.
 * Returns `count` questions with no repeats inside the round.
 */
export function generateRound(type, level = 1, count = 10) {
  const make = GENERATORS[type];
  if (!make) throw new Error(`questionEngine: no generator registered for "${type}"`);
  const round = drawRound(count, () => make(level), (q) => q.id, seenSet(type));
  round.forEach((q) => recordQuestionAnswered(type, q.id));
  return round;
}

/** Single question — kept for callers that only need one. */
export function generateMathQuestion(type = 'addition', level = 1) {
  return generateRound(type, level, 1)[0];
}

/* ── spelling (word bank rather than arithmetic) ─────────── */

const SPELLING_WORDS = [
  { word: 'CAT', hint: '🐱 Meow meow animal' },
  { word: 'DOG', hint: '🐶 Friendly barking pet' },
  { word: 'SUN', hint: '☀️ Bright star in the sky' },
  { word: 'STAR', hint: '⭐ Shines at night' },
  { word: 'FISH', hint: '🐟 Swims in water' },
  { word: 'BIRD', hint: '🐦 Has wings and flies' },
  { word: 'FROG', hint: '🐸 Green hopping creature' },
  { word: 'MOON', hint: '🌙 Lights up the night' },
  { word: 'LION', hint: '🦁 King of the jungle' },
  { word: 'TREE', hint: '🌳 Tall green plant' },
  { word: 'APPLE', hint: '🍎 Delicious red fruit' },
  { word: 'BALL', hint: '⚽ Round toy to bounce' },
  { word: 'BOOK', hint: '📚 Pages to read stories' },
  { word: 'DUCK', hint: '🦆 Quack quack swimmer' },
  { word: 'CAKE', hint: '🎂 Sweet birthday treat' },
];

export function generateSpellingQuestion() {
  const history = seenSet('spelling');
  let available = SPELLING_WORDS.filter((w) => !history.has(w.word));
  if (available.length === 0) {
    resetQuestionHistory('spelling');
    available = SPELLING_WORDS;
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Exported for the test harness only.
export const __internals = { buildChoices, drawRound, GENERATORS, randInt };
