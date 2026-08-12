/**
 * Pure-logic tests for the question engine and level config.
 *
 * Runs in plain Node — no browser, no test framework. `npm test`.
 * Every generator is exercised across levels 1..15 and many rounds, because
 * these bugs (negative answers, unanswerable questions, options missing the
 * correct answer) only show up in the tail of the random distribution.
 */

// Minimal localStorage so the engine's history layer works outside a browser.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

// Static imports are safe here: the engine only touches localStorage inside
// function bodies, never at module load, so the shim above is already in place
// by the time anything calls it.
import { generateRound } from '../src/utils/questionEngine.js';
import { getLevelConfig, LEVEL_CONFIGS } from '../src/utils/levelConfig.js';
import { getStars } from '../src/utils/gameHelpers.js';
import { ROUTE_META, INDEXABLE_ROUTES, metaForPath } from '../src/utils/seo.js';
import { articles } from '../src/data/articles.js';
import { readFileSync } from 'node:fs';

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) { passed++; }
  else { failures.push(`${name}${detail ? ` — ${detail}` : ''}`); }
}

const MATH_GAMES = ['addition', 'subtraction', 'times-tables', 'division', 'counting', 'compare'];
const LEVELS = [1, 2, 3, 5, 8, 10, 11, 13, 15];
const ROUNDS = 25;
const SIZE = 10;

/* ── 1. Every question is answerable ─────────────────────── */

for (const game of MATH_GAMES) {
  for (const level of LEVELS) {
    for (let r = 0; r < ROUNDS; r++) {
      store.clear();
      const round = generateRound(game, level, SIZE);

      check(`${game} L${level}: round size`, round.length === SIZE, `got ${round.length}`);

      for (const q of round) {
        check(
          `${game} L${level}: options contain the answer`,
          q.options.includes(q.answer),
          `answer ${q.answer} not in [${q.options}]`
        );
        check(
          `${game} L${level}: options are distinct`,
          new Set(q.options).size === q.options.length,
          `[${q.options}]`
        );
        check(`${game} L${level}: has an id`, typeof q.id === 'string' && q.id.length > 0);

        if (game !== 'compare') {
          check(
            `${game} L${level}: answer is a non-negative integer`,
            Number.isInteger(q.answer) && q.answer >= 0,
            `answer=${q.answer}`
          );
          check(
            `${game} L${level}: no negative options`,
            q.options.every((o) => o >= 0),
            `[${q.options}]`
          );
        }
      }
    }
  }
}

/* ── 2. No repeated question inside a single round ───────── */

// Counting is the one game whose pool can genuinely be smaller than a round
// (level 3 caps at 8 objects, so 10 distinct questions don't exist). Uniqueness
// is only required where the pool can actually supply it; everywhere else the
// back-to-back rule below is the guarantee.
const poolAtLeast = (game, level, n) => {
  if (game !== 'counting') return true;
  return (getLevelConfig('counting', level).maxCount || 0) >= n;
};

for (const game of MATH_GAMES) {
  for (const level of [3, 5, 8, 10]) {
    if (!poolAtLeast(game, level, SIZE)) continue;
    for (let r = 0; r < ROUNDS; r++) {
      store.clear();
      const round = generateRound(game, level, SIZE);
      const ids = round.map((q) => q.id);
      check(
        `${game} L${level}: no duplicate questions in a round`,
        new Set(ids).size === ids.length,
        ids.join(',')
      );
    }
  }
}

// And where the pool IS too small, the round must still never repeat
// back-to-back.
for (const level of [1, 2, 3]) {
  for (let r = 0; r < 30; r++) {
    store.clear();
    const round = generateRound('counting', level, SIZE);
    for (let i = 1; i < round.length; i++) {
      check(
        `counting L${level}: small pool still avoids back-to-back repeats`,
        round[i].id !== round[i - 1].id
      );
    }
  }
}

/* ── 3. Never two identical questions back to back ───────── */
// Counting level 1 only has 3 possible answers, so duplicates within a round
// are unavoidable — but the child must never see the same one twice running.

for (const level of [1, 2]) {
  for (let r = 0; r < 50; r++) {
    store.clear();
    const round = generateRound('counting', level, SIZE);
    for (let i = 1; i < round.length; i++) {
      check(
        `counting L${level}: no back-to-back repeat`,
        round[i].id !== round[i - 1].id,
        `position ${i}: ${round[i].id}`
      );
    }
  }
}

/* ── 4. Difficulty actually follows levelConfig ──────────── */

store.clear();
for (const level of [1, 5, 10]) {
  const cfg = getLevelConfig('addition', level);
  const round = generateRound('addition', level, 40);
  const worst = Math.max(...round.map((q) => Math.max(q.a, q.b)));
  check(
    `addition L${level}: operands respect maxNum (${cfg.maxNum})`,
    worst <= cfg.maxNum,
    `saw ${worst}`
  );
  check(
    `addition L${level}: honours choiceCount (${cfg.choiceCount})`,
    round.every((q) => q.options.length === cfg.choiceCount),
    `saw ${round[0].options.length}`
  );
}

store.clear();
for (const level of [1, 5, 10]) {
  const cfg = getLevelConfig('counting', level);
  const round = generateRound('counting', level, 40);
  const worst = Math.max(...round.map((q) => q.answer));
  check(`counting L${level}: respects maxCount (${cfg.maxCount})`, worst <= cfg.maxCount, `saw ${worst}`);
  check(`counting L${level}: never asks to count zero items`, round.every((q) => q.answer >= 1));
  check(
    `counting L${level}: no zero-or-negative options`,
    round.every((q) => q.options.every((o) => o >= 1))
  );
}

store.clear();
for (const level of [1, 5, 10]) {
  const cfg = getLevelConfig('times-tables', level);
  const round = generateRound('times-tables', level, 40);
  check(
    `times-tables L${level}: table within maxTable (${cfg.maxTable})`,
    round.every((q) => q.a <= cfg.maxTable), ''
  );
  check(
    `times-tables L${level}: multiplier within maxMultiplier (${cfg.maxMultiplier})`,
    round.every((q) => q.b <= cfg.maxMultiplier), ''
  );
  check(`times-tables L${level}: a × b === answer`, round.every((q) => q.a * q.b === q.answer));
}

/* ── 5. Arithmetic is actually correct ───────────────────── */

store.clear();
for (const level of LEVELS) {
  for (const q of generateRound('addition', level, 30)) {
    check('addition arithmetic', q.a + q.b === q.answer, `${q.a}+${q.b}!=${q.answer}`);
  }
  for (const q of generateRound('subtraction', level, 30)) {
    check('subtraction arithmetic', q.a - q.b === q.answer, `${q.a}-${q.b}!=${q.answer}`);
    check('subtraction never negative', q.answer >= 0, `${q.a}-${q.b}`);
  }
  for (const q of generateRound('division', level, 30)) {
    check('division is exact', q.a % q.b === 0, `${q.a}/${q.b} has a remainder`);
    check('division arithmetic', q.a / q.b === q.answer, `${q.a}/${q.b}!=${q.answer}`);
  }
}

/* ── 6. Compare: the game that never scored a point ──────── */

store.clear();
for (const level of LEVELS) {
  const round = generateRound('compare', level, 30);
  for (const q of round) {
    const expected = q.a > q.b ? '>' : q.a < q.b ? '<' : '=';
    check('compare answer matches the numbers', q.answer === expected, `${q.a} ${q.answer} ${q.b}`);
    check('compare answer is one of the three buttons', ['>', '<', '='].includes(q.answer));
    check('compare offers exactly >, < and =', q.options.join('') === '><=');
  }
}

// Levels 1-3 must never produce an equals question (allowEqual: false).
store.clear();
for (const level of [1, 2, 3]) {
  const round = generateRound('compare', level, 60);
  check(
    `compare L${level}: no '=' when allowEqual is false`,
    round.every((q) => q.a !== q.b),
    'found an equal pair'
  );
}

// Higher levels should actually produce some equals questions, or the '='
// button is decorative.
store.clear();
{
  const round = generateRound('compare', 7, 200);
  check('compare L7: produces some = questions', round.some((q) => q.answer === '='), 'never saw =');
}

/* ── 7. Level config sanity ──────────────────────────────── */

for (const [game, configs] of Object.entries(LEVEL_CONFIGS)) {
  check(`${game}: 10 base levels`, configs.length === 10, `got ${configs.length}`);
  for (let i = 1; i < configs.length; i++) {
    check(`${game}: levels numbered in order`, configs[i].level === configs[i - 1].level + 1);
  }
  // Levels beyond 10 must keep producing a usable config, not undefined.
  for (const level of [11, 20, 50]) {
    const cfg = getLevelConfig(game, level);
    check(`${game} L${level}: config exists past level 10`, cfg && typeof cfg === 'object');
  }
}

/* ── 8. Star thresholds ──────────────────────────────────── */

check('10/10 = 3 stars', getStars(10, 10) === 3);
check('8/10 = 2 stars', getStars(8, 10) === 2);
check('5/10 = 1 star', getStars(5, 10) === 1);
check('4/10 = 0 stars', getStars(4, 10) === 0);
check('0/0 does not divide by zero', getStars(0, 0) === 0);

/* ── 9. SEO metadata ─────────────────────────────────────── */
// Every route serving the same title and canonical is the classic SPA SEO
// failure, so these assertions guard against it coming back.

const titles = new Map();
for (const [path, meta] of Object.entries(ROUTE_META)) {
  check(`${path}: has a title`, !!meta.title && meta.title.length > 10, meta.title);
  check(`${path}: title fits a search result (<= 65 chars)`,
    meta.title.length <= 65, `${meta.title.length} chars: ${meta.title}`);
  check(`${path}: has a description`, !!meta.description, '');
  // Length only matters where the page can appear in results. Google truncates
  // around 160 characters, and a very short one wastes the snippet.
  if (!meta.noindex) {
    check(`${path}: description is 70-175 chars`,
      meta.description.length >= 70 && meta.description.length <= 175,
      `${meta.description.length} chars`);
  }
  const seen = titles.get(meta.title);
  check(`${path}: title is unique`, !seen, `duplicated with ${seen}`);
  titles.set(meta.title, path);
}

// Articles must resolve to their own metadata, not fall back to the homepage.
for (const a of articles) {
  const meta = metaForPath(`/articles/${a.slug}`, articles);
  check(`article ${a.slug}: has its own title`,
    meta.title.includes(a.title), meta.title);
  check(`article ${a.slug}: is indexable`, !meta.noindex);
}

check('unknown routes are noindex', metaForPath('/no-such-page', articles).noindex === true);
check('personal screens are noindex',
  ROUTE_META['/progress'].noindex === true && ROUTE_META['/profile'].noindex === true);

// The JSON-LD game list is hand-maintained in index.html; fail loudly if it
// drifts from the routes the app actually has.
const html = readFileSync('index.html', 'utf8');
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
check('index.html has JSON-LD', !!ldMatch);
if (ldMatch) {
  let parsed = null;
  try { parsed = JSON.parse(ldMatch[1]); } catch (e) { /* reported below */ }
  check('JSON-LD parses', !!parsed);
  if (parsed) {
    const list = parsed.find((b) => b['@type'] === 'ItemList');
    check('JSON-LD includes an ItemList of games', !!list);
    const ldPaths = (list.itemListElement || [])
      .map((e) => e.item.url.replace('https://kidlearn.in', ''))
      .sort();
    const gamePaths = INDEXABLE_ROUTES
      .filter((p) => !['/', '/articles', '/about', '/contact', '/privacy', '/terms'].includes(p))
      .sort();
    check('JSON-LD game list matches the app routes',
      JSON.stringify(ldPaths) === JSON.stringify(gamePaths),
      `ld=${ldPaths.length} routes=${gamePaths.length}`);
    for (const e of list.itemListElement || []) {
      check(`JSON-LD ${e.item.url}: has a description`,
        !!e.item.description && e.item.description.length > 40);
    }
  }
}

/* ── report ──────────────────────────────────────────────── */

const unique = [...new Set(failures)];
console.log(`\n  ${passed} assertions passed`);
if (unique.length) {
  console.log(`  ${failures.length} failures (${unique.length} distinct):\n`);
  unique.slice(0, 40).forEach((f) => console.log(`   ✗ ${f}`));
  process.exit(1);
}
console.log('  All engine tests passed ✓\n');
