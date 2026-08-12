/**
 * End-to-end browser tests.
 *
 * Builds the app, serves it, then actually plays every game in a real browser:
 * reads the question off the screen, works out the correct answer, clicks it,
 * and checks the score summary agrees. A game that can't be won is a game with
 * a scoring bug — which is exactly what Compare Numbers had.
 *
 * Also collects console errors and page exceptions across every route, and
 * checks for horizontal overflow at a phone viewport.
 */

// Playwright is only needed for this suite, so fail with a useful instruction
// rather than a module-not-found stack if it isn't installed.
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('\n  Playwright is not installed. Run:\n');
  console.error('    npm install --save-dev playwright');
  console.error('    npx playwright install chromium\n');
  process.exit(1);
}
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync } from 'node:fs';

const PORT = 4317;
const BASE = `http://localhost:${PORT}`;
const FEEDBACK_WAIT = 1250;      // useQuizGame advances 1000ms after an answer

const results = [];
const consoleProblems = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail && !ok ? ` — ${detail}` : ''}`);
}

/* ── server ──────────────────────────────────────────────── */

async function startServer() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return proc;
    } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error('preview server did not start');
}

/* ── answer solvers ──────────────────────────────────────── */

async function questionText(page) {
  return (await page.locator('.mockup-question-text').first().innerText()).trim();
}

const SOLVERS = {
  async arithmetic(page) {
    const text = (await questionText(page)).replace(/\s+/g, ' ');
    const m = text.match(/^(\d+)\s*([+\-×÷])\s*(\d+)/);
    if (!m) throw new Error(`unparseable question: "${text}"`);
    const a = Number(m[1]), b = Number(m[3]);
    switch (m[2]) {
      case '+': return String(a + b);
      case '-': return String(a - b);
      case '×': return String(a * b);
      case '÷': return String(a / b);
      default: throw new Error(`unknown operator ${m[2]}`);
    }
  },

  async compare(page) {
    const text = (await questionText(page)).replace(/\s+/g, ' ');
    const m = text.match(/^(\d+)\s*\?\s*(\d+)$/);
    if (!m) throw new Error(`unparseable compare question: "${text}"`);
    const a = Number(m[1]), b = Number(m[2]);
    return a > b ? '>' : a < b ? '<' : '=';
  },

  async counting(page) {
    const label = await page.locator('.counting-tray').first().getAttribute('aria-label');
    const m = /^(\d+)/.exec(label || '');
    if (!m) throw new Error(`no count in tray label "${label}"`);
    // Cross-check the label against what's actually drawn on screen.
    const drawn = await page.locator('.counting-item').count();
    if (drawn !== Number(m[1])) throw new Error(`tray says ${m[1]} but renders ${drawn} items`);
    return m[1];
  },

  async colorMatch(page) {
    const text = await questionText(page);
    const m = text.match(/Which one is (.+)\?/);
    if (!m) throw new Error(`unparseable colour question: "${text}"`);
    return m[1];
  },

  async shapeMatch(page) {
    return page.locator('.shape-stage svg').first().getAttribute('aria-label');
  },

  async clock(page) {
    const label = await page.locator('.analog-clock').first().getAttribute('aria-label');
    const m = /Clock showing (\S+)/.exec(label || '');
    if (!m) throw new Error(`no time in clock label "${label}"`);
    return m[1];
  },
};

/* ── game drivers ────────────────────────────────────────── */

async function openGame(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.level-grid', { timeout: 8000 });
}

/** Plays 10 questions choosing the correct answer each time. */
async function playPerfectRound(page, gameName, path, solve) {
  await openGame(page, path);
  record(`${gameName}: opens on the level picker`, true);

  await page.locator('.level-tile').first().click();
  await page.waitForSelector('.candy-buttons-container', { timeout: 8000 });

  for (let q = 0; q < 10; q++) {
    const answer = await solve(page);
    const btn = page.locator(`button[aria-label="Answer ${answer}"]`);
    const count = await btn.count();
    if (count === 0) {
      const offered = await page.locator('.candy-wrapper-item').allInnerTexts();
      throw new Error(`Q${q + 1}: correct answer "${answer}" was not offered. On screen: ${JSON.stringify(offered)}`);
    }
    await btn.first().click();
    await sleep(FEEDBACK_WAIT);
  }

  await page.waitForSelector('.score-summary-card', { timeout: 8000 });
  const score = (await page.locator('.score-number').innerText()).trim();
  const pct = (await page.locator('.score-pct').innerText()).trim();
  const stars = await page.locator('.star-filled').count();

  record(`${gameName}: perfect round scores 10/10`, score === '10', `got ${score}`);
  record(`${gameName}: shows 100%`, pct === '100%', `got ${pct}`);
  record(`${gameName}: awards 3 stars`, stars === 3, `got ${stars}`);

  const unlock = await page.locator('.score-unlock-note').innerText();
  record(`${gameName}: unlocks the next level`, unlock.includes('unlocked'), unlock);
}

/**
 * Plays a round without knowing the answers — checks the round can finish.
 *
 * Now that a wrong answer keeps the question open, clicking at random retries
 * the same rejected option forever. This eliminates instead: it tracks what has
 * already been tried on the current question (detected via the progress text
 * changing) and only clicks something new, so each question clears in at most
 * `options` attempts.
 */
async function playAnyRound(page, gameName, path, clickSelector = '.candy-wrapper-item', maxClicks = 90) {
  await openGame(page, path);
  record(`${gameName}: opens on the level picker`, true);
  await page.locator('.level-tile').first().click();
  await page.waitForSelector(clickSelector, { timeout: 8000 });

  const progress = async () => {
    const el = page.locator('.top-bar-progress-text');
    return (await el.count()) ? (await el.innerText()).trim() : '';
  };

  let at = await progress();
  let tried = new Set();

  for (let i = 0; i < maxClicks; i++) {
    if (await page.locator('.score-summary-card').count()) break;

    const now = await progress();
    if (now !== at) { at = now; tried = new Set(); }   // new question, fresh slate

    const buttons = page.locator(`${clickSelector}:not([disabled])`);
    const n = await buttons.count();
    if (n === 0) break;

    let picked = -1;
    for (let k = 0; k < n; k++) {
      const label = (await buttons.nth(k).innerText()).trim();
      if (!tried.has(label)) { tried.add(label); picked = k; break; }
    }
    if (picked === -1) { tried = new Set(); picked = 0; }

    await buttons.nth(picked).click();
    await sleep(780);
  }

  const finished = (await page.locator('.score-summary-card').count()) > 0;
  record(`${gameName}: round reaches the score summary`, finished);
}

/**
 * The advance rule: only a correct answer moves on, a wrong one hands the
 * question back, and a question recovered after a mistake scores nothing.
 * Addition is used because its answer is computable from the screen.
 */
async function verifyAdvanceRule(page) {
  await openGame(page, '/addition');
  await page.locator('.level-tile').first().click();
  await page.waitForSelector('.candy-buttons-container', { timeout: 8000 });

  const progress = () => page.locator('.top-bar-progress-text').innerText();
  const roundScore = () => page.locator('.pill-score').innerText();

  const correct = await SOLVERS.arithmetic(page);
  const offered = await page.locator('.candy-wrapper-item').allInnerTexts();
  const wrong = offered.map((t) => t.trim().split(/\s+/).pop()).find((t) => t !== correct);

  const startedAt = (await progress()).trim();

  // First wrong answer: stay put, no point, prompt to retry.
  await page.locator(`button[aria-label="Answer ${wrong}"]`).first().click();
  await sleep(1400);
  record('Wrong answer does not advance', (await progress()).trim() === startedAt,
    `moved from "${startedAt}" to "${(await progress()).trim()}"`);
  record('Wrong answer scores nothing', (await roundScore()).includes('0/10'), await roundScore());
  record('Wrong answer shows a retry prompt',
    (await page.locator('.mockup-question-retry').count()) > 0);
  record('Wrong answer leaves the question playable',
    (await page.locator('.candy-wrapper-item:not([disabled])').count()) > 0);

  // Second wrong answer: the correct one is revealed so nobody gets stuck.
  await page.locator(`button[aria-label="Answer ${wrong}"]`).first().click();
  await sleep(1400);
  record('Second wrong attempt reveals the correct answer',
    (await page.locator('.candy-animated-correct').count()) > 0);

  // Correct answer now advances — but earns no point, since it was missed.
  await page.locator(`button[aria-label="Answer ${correct}"]`).first().click();
  await sleep(FEEDBACK_WAIT);
  record('Correct answer advances', (await progress()).trim() !== startedAt,
    `still on "${startedAt}"`);
  record('A question recovered after a mistake scores nothing',
    (await roundScore()).includes('0/10'), await roundScore());
}

/**
 * Alphabet Match: the letters must be tapped in A-Z order, and the round's
 * letters are always presented sorted, so the next expected letter is simply
 * the alphabetically smallest one still on screen.
 */
async function playAlphabet(page) {
  await openGame(page, '/alphabet');
  record('Alphabet Match: opens on the level picker', true);
  await page.locator('.level-tile').first().click();
  await page.waitForSelector('.letter-tile', { timeout: 8000 });

  let wrongTaps = 0;
  for (let i = 0; i < 200; i++) {
    if (await page.locator('.score-summary-card').count()) break;
    const letters = await page.locator('.letter-tile').allInnerTexts();
    if (!letters.length) { await sleep(400); continue; }
    const next = letters.map((l) => l.trim()).sort()[0];
    const before = await page.locator('.placed-tile').count();
    await page.locator(`.letter-tile:text-is("${next}")`).first().click();
    await sleep(820);
    const after = await page.locator('.placed-tile').count();
    if (after === before && after !== 0) wrongTaps++;
  }

  const finished = (await page.locator('.score-summary-card').count()) > 0;
  record('Alphabet Match: round reaches the score summary', finished);
  record('Alphabet Match: A-Z order is accepted', wrongTaps === 0, `${wrongTaps} rejected in-order taps`);
  if (finished) {
    const score = (await page.locator('.score-number').innerText()).trim();
    record('Alphabet Match: playing in order scores 10/10', score === '10', `got ${score}`);
  }
}

/**
 * Spelling Bee: the target word isn't rendered (that's the point), so the
 * driver brute-forces — try each tile until one is accepted, which is exactly
 * what "the next letter must be accepted" means.
 */
async function playSpelling(page) {
  await openGame(page, '/spelling');
  record('Spelling Bee: opens on the level picker', true);
  await page.locator('.level-tile').first().click();
  await page.waitForSelector('.letter-tile', { timeout: 8000 });

  for (let i = 0; i < 400; i++) {
    if (await page.locator('.score-summary-card').count()) break;
    const before = await page.locator('.slot-filled').count();
    const tiles = page.locator('.letter-tile:not([disabled])');
    const n = await tiles.count();
    if (n === 0) { await sleep(400); continue; }
    let progressed = false;
    for (let t = 0; t < n; t++) {
      const tile = page.locator('.letter-tile:not([disabled])').nth(t);
      if (!(await tile.count())) break;
      await tile.click();
      await sleep(480);
      if (await page.locator('.score-summary-card').count()) { progressed = true; break; }
      const after = await page.locator('.slot-filled').count();
      if (after !== before) { progressed = true; break; }
      await sleep(300);   // wait out the "wrong letter" lock
    }
    if (!progressed) await sleep(500);
  }

  const finished = (await page.locator('.score-summary-card').count()) > 0;
  record('Spelling Bee: round reaches the score summary', finished);
  if (finished) {
    const score = (await page.locator('.score-number').innerText()).trim();
    record('Spelling Bee: spelling every word scores 10/10', score === '10', `got ${score}`);
  }
}

/**
 * Memory Flip: plays properly — remembers every card it has seen and takes a
 * known pair when one exists, otherwise turns over two cards it hasn't seen.
 * (A naive "click the first two open cards" driver deadlocks: the same two
 * non-matching cards get picked forever.)
 */
async function playMemory(page) {
  await openGame(page, '/memory');
  record('Memory Flip: opens on the level picker', true);
  await page.locator('.level-tile').first().click();
  await page.waitForSelector('.memory-card', { timeout: 8000 });

  const cards = () => page.locator('.memory-card');
  const valueAt = async (i) => {
    try { return (await cards().nth(i).innerText({ timeout: 2000 })).trim(); }
    catch { return null; }
  };
  const isDone = async () => (await page.locator('.score-summary-card').count()) > 0;
  const seen = new Map();      // index -> emoji

  const unmatched = async () => {
    if (await isDone()) return [];
    const total = await cards().count();
    const open = [];
    for (let i = 0; i < total; i++) {
      const cls = (await cards().nth(i).getAttribute('class')) || '';
      if (!cls.includes('memory-card-matched')) open.push(i);
    }
    return open;
  };

  // The board is replaced by the score summary the instant the last pair
  // lands, so every read has to tolerate the card vanishing mid-turn.
  const flip = async (i) => {
    if (i === undefined || i === null) return;
    const card = cards().nth(i);
    if (!(await card.count())) return;
    await card.click({ timeout: 3000 }).catch(() => {});
    await sleep(300);
    try {
      seen.set(i, (await card.innerText({ timeout: 2000 })).trim());
    } catch { /* board gone — round finished */ }
  };

  for (let step = 0; step < 200; step++) {
    if (await isDone()) break;
    const open = await unmatched();
    if (open.length < 2) break;

    // A pair we already know about?
    let a = null, b = null;
    outer:
    for (const i of open) {
      for (const j of open) {
        if (i !== j && seen.has(i) && seen.has(j) && seen.get(i) === seen.get(j)) {
          a = i; b = j; break outer;
        }
      }
    }

    if (a === null) {
      const unknown = open.filter((i) => !seen.has(i));
      a = unknown[0] ?? open[0];
      await flip(a);
      // Did the card we just turned over complete a pair we already knew?
      const value = seen.get(a);
      b = open.find((i) => i !== a && seen.get(i) === value);
      if (b === undefined) b = (unknown.find((i) => i !== a) ?? open.find((i) => i !== a));
      await flip(b);
    } else {
      await flip(a);
      await flip(b);
    }

    await sleep(1000);
  }

  const finished = await isDone();
  record('Memory Flip: round reaches the score summary', finished);
  if (finished) {
    const heading = await page.locator('.score-game-name').innerText();
    record('Memory Flip: reports the move count', /\d+ moves/.test(heading), heading);

    // Asserting 3 stars was wrong: this driver explores unseen cards in index
    // order, so the number of moves it takes is not deterministic. The real
    // invariant is that the stars shown match the documented rule for however
    // many moves were actually used.
    const moves = Number((heading.match(/(\d+) moves/) || [])[1]);
    const pairs = Number((await page.locator('.score-total').innerText()).trim());
    const expected = moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1;
    const stars = await page.locator('.star-filled').count();
    record(
      'Memory Flip: stars match the moves taken',
      stars === expected,
      `${moves} moves over ${pairs} pairs -> expected ${expected}, got ${stars}`
    );
  }
}

/* ── main ────────────────────────────────────────────────── */

const server = await startServer();
// This sandbox ships a preinstalled Chromium; use it when present rather than
// downloading one. Falls back to Playwright's own browser everywhere else.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM)
  ? { executablePath: SANDBOX_CHROMIUM, args: ['--no-sandbox'] }
  : {};
const browser = await chromium.launch(launchOpts);

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  // Analytics, AdSense and Google Fonts are unreachable from this sandbox, so
  // their load failures are environment noise rather than app bugs. Match on
  // the resource URL from the console location, not the message text — the
  // message for an HTTP error ("...responded with a status of 403") does not
  // name the host.
  const EXTERNAL_HOSTS = /googletagmanager|googlesyndication|google-analytics|doubleclick|fonts\.googleapis|fonts\.gstatic|adsbygoogle/i;
  const NETWORK_FAILURE = /Failed to load resource|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED|ERR_BLOCKED_BY/i;

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const src = (msg.location() && msg.location().url) || '';
    if (EXTERNAL_HOSTS.test(src) || EXTERNAL_HOSTS.test(text)) return;
    // A bare resource-load failure with no same-origin URL is the sandbox
    // blocking a third party; a genuine app error always carries a message.
    if (NETWORK_FAILURE.test(text) && !src.startsWith(BASE)) return;
    consoleProblems.push(`console.error @ ${page.url()}: ${text}${src ? ` [${src}]` : ''}`);
  });

  page.on('pageerror', (err) => consoleProblems.push(`pageerror @ ${page.url()}: ${err.message}`));

  console.log('\n── Winnable-round checks ──');
  await playPerfectRound(page, 'Addition', '/addition', SOLVERS.arithmetic);
  await playPerfectRound(page, 'Subtraction', '/subtraction', SOLVERS.arithmetic);
  await playPerfectRound(page, 'Times Tables', '/times-tables', SOLVERS.arithmetic);
  await playPerfectRound(page, 'Division', '/division', SOLVERS.arithmetic);
  await playPerfectRound(page, 'Counting', '/counting', SOLVERS.counting);
  await playPerfectRound(page, 'Compare Numbers', '/compare', SOLVERS.compare);
  await playPerfectRound(page, 'Clock Reading', '/clock', SOLVERS.clock);
  await playPerfectRound(page, 'Color Match', '/color-match', SOLVERS.colorMatch);
  await playPerfectRound(page, 'Shape Match', '/shape-match', SOLVERS.shapeMatch);

  console.log('\n── Completable-round checks ──');
  await playAnyRound(page, 'Pattern', '/pattern');
  await playAnyRound(page, 'Rhyming', '/rhyming');
  await playAlphabet(page);
  await playSpelling(page);
  await playMemory(page);

  console.log('\n── Advance rule (correct answers only) ──');
  await verifyAdvanceRule(page);

  console.log('\n── Level unlocking ──');
  await openGame(page, '/addition');
  const nextTiles = await page.locator('.level-tile-next').count();
  record('Level picker highlights exactly one "next" level', nextTiles === 1, `found ${nextTiles}`);
  const level2Label = await page.locator('.level-tile').nth(1).getAttribute('aria-label');
  record('Level 2 shows as playable after clearing level 1', !/locked/.test(level2Label || ''), level2Label);

  console.log('\n── SEO metadata ──');
  {
    const read = async (route) => {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      await sleep(350);
      return page.evaluate(() => ({
        title: document.title,
        description: (document.querySelector('meta[name="description"]') || {}).content,
        canonical: (document.querySelector('link[rel="canonical"]') || {}).href,
        robots: (document.querySelector('meta[name="robots"]') || {}).content,
        ogTitle: (document.querySelector('meta[property="og:title"]') || {}).content,
        ogUrl: (document.querySelector('meta[property="og:url"]') || {}).content,
        canonicalCount: document.querySelectorAll('link[rel="canonical"]').length,
        descCount: document.querySelectorAll('meta[name="description"]').length,
      }));
    };

    const home = await read('/');
    const times = await read('/times-tables');
    const spelling = await read('/spelling');
    const progress = await read('/progress');

    record('Each route has its own <title>',
      new Set([home.title, times.title, spelling.title]).size === 3,
      [home.title, times.title, spelling.title].join(' | '));
    record('Each route has its own description',
      new Set([home.description, times.description, spelling.description]).size === 3);
    record('Canonical is self-referencing',
      times.canonical === 'https://kidlearn.in/times-tables', times.canonical);
    record('og:url tracks the route', times.ogUrl === 'https://kidlearn.in/times-tables', times.ogUrl);
    record('og:title tracks the route', times.ogTitle === times.title, times.ogTitle);
    record('Game pages are indexable', /^index,follow/.test(times.robots), times.robots);
    record('Personal screens are noindex', /noindex/.test(progress.robots), progress.robots);
    // Duplicated tags are the classic bug when writing meta from JS.
    record('Exactly one canonical tag', times.canonicalCount === 1, `${times.canonicalCount}`);
    record('Exactly one description tag', times.descCount === 1, `${times.descCount}`);

    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    record('Sitemap lists every game page',
      ['times-tables', 'spelling', 'memory', 'clock', 'pattern']
        .every((g) => locs.includes(`https://kidlearn.in/${g}`)),
      `${locs.length} URLs`);
    record('Sitemap excludes personal screens',
      !locs.some((l) => /\/(progress|profile)$/.test(l)));

    const ogRes = await fetch(`${BASE}/og-image.png`);
    record('Social preview image is served', ogRes.ok, `HTTP ${ogRes.status}`);
  }

  console.log('\n── Ads ──');
  {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await sleep(600);
    const home = await page.evaluate(() => ({
      insTotal: document.querySelectorAll('ins.adsbygoogle').length,
      insWithoutSlot: [...document.querySelectorAll('ins.adsbygoogle')]
        .filter((el) => !el.getAttribute('data-ad-slot')).length,
    }));
    // No slot IDs are configured in this build, so nothing should render at all
    // rather than an empty, unfillable ad container.
    record('No unfillable ad units render without a slot ID',
      home.insWithoutSlot === 0, `${home.insWithoutSlot} of ${home.insTotal}`);

    await page.goto(`${BASE}/addition`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.level-grid', { timeout: 8000 });
    await page.locator('.level-tile').first().click();
    await sleep(500);
    const body = await page.locator('body').innerText();
    record('No fake "[AD]" button on the game screen', !body.includes('[AD]'));
    record('No "Sponsor" placeholder frame', !/Sponsor/i.test(body));

    for (const file of ['ads.txt', 'robots.txt', 'sitemap.xml']) {
      const res = await fetch(`${BASE}/${file}`);
      const text = await res.text();
      record(`/${file} serves its own content, not index.html`,
        res.ok && !text.includes('<!DOCTYPE html>'), `HTTP ${res.status}`);
    }
  }

  console.log('\n── Text contrast (WCAG AA) ──');
  {
    // Written after the Learning Corner and Progress pages were found still
    // carrying light-theme colours: body text measured 1.25:1 against the dark
    // background. Eyeballing screens one at a time misses these, so every route
    // is now measured.
    const auditContrast = () => {
      const parse = (s) => {
        const m = (s || '').match(/[\d.]+/g);
        return m ? m.slice(0, 4).map(Number) : null;
      };
      const lum = ([r, g, b]) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a, b) => {
        const [l1, l2] = [lum(a), lum(b)];
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      // The page background is a CSS gradient, so getComputedStyle reports no
      // solid colour on <body>. Fall back to its mid-tone.
      const PAGE_BG = [37, 16, 67];
      const effectiveBg = (el) => {
        let node = el;
        while (node && node !== document.documentElement) {
          const cs = getComputedStyle(node);
          // A gradient background can't be reduced to one colour; treat the
          // element as opaque and stop measuring rather than guess wrong.
          if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) return null;
          const bg = parse(cs.backgroundColor);
          if (bg && (bg[3] === undefined || bg[3] > 0.55)) return bg.slice(0, 3);
          node = node.parentElement;
        }
        return PAGE_BG;
      };

      const problems = [];
      for (const el of document.querySelectorAll('body *')) {
        const text = [...el.childNodes]
          .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
        if (text.length < 2) continue;
        // Emoji are colour glyphs painted by the font, not by `color`, so a
        // contrast figure for them is meaningless. Only measure text that
        // actually contains letters or digits.
        if (!/[a-z0-9]/i.test(text)) continue;

        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.15) continue;
        // Gradient text (background-clip: text) paints from the gradient, not
        // from `color`, so the computed colour is not what's on screen.
        if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' ||
            (cs.webkitBackgroundClip || cs.backgroundClip) === 'text') continue;
        const box = el.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) continue;

        const fg = parse(cs.color);
        if (!fg) continue;
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        // WCAG: large text (>=24px, or >=18.66px bold) only needs 3:1.
        const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = isLarge ? 3 : 4.5;
        const bg = effectiveBg(el);
        if (!bg) continue;                       // gradient backdrop — not measurable
        const r = ratio(fg.slice(0, 3), bg);
        if (r < need) {
          problems.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().split(' ')[0],
            text: text.slice(0, 42),
            ratio: Number(r.toFixed(2)),
            need,
          });
        }
      }
      return problems;
    };

    for (const route of ['/', '/articles', '/articles/how-games-help-children-learn',
                         '/progress', '/profile', '/about', '/privacy', '/terms', '/contact']) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      await sleep(500);
      const problems = await page.evaluate(auditContrast);
      record(`${route}: all text meets WCAG AA contrast`, problems.length === 0,
        problems.slice(0, 4).map((p) => `${p.tag}.${p.cls} "${p.text}" ${p.ratio}:1 (needs ${p.need})`).join(' | '));
    }
  }

  console.log('\n── Static routes ──');
  for (const route of ['/', '/progress', '/profile', '/about', '/articles', '/privacy', '/terms', '/contact', '/english-speaking']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    const body = await page.locator('body').innerText();
    record(`${route} renders content`, body.trim().length > 40, `${body.trim().length} chars`);
  }

  console.log('\n── Mobile layout ──');
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const mpage = await mobile.newPage();
  mpage.on('pageerror', (err) => consoleProblems.push(`pageerror (mobile) @ ${mpage.url()}: ${err.message}`));

  for (const route of ['/', '/addition', '/memory', '/clock']) {
    await mpage.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    if (route !== '/') {
      await mpage.waitForSelector('.level-grid', { timeout: 8000 });
      await mpage.locator('.level-tile').first().click();
      await sleep(400);
    }
    const overflow = await mpage.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    record(`${route} has no horizontal overflow at 390px`, overflow <= 2, `${overflow}px too wide`);
  }
  await mobile.close();

  console.log('\n── Console health ──');
  record('No console errors or page exceptions', consoleProblems.length === 0, consoleProblems.slice(0, 5).join(' | '));
} catch (err) {
  record('E2E run completed without throwing', false, err.message);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

const failed = results.filter((r) => !r.ok);
console.log(`\n  ${results.length - failed.length}/${results.length} checks passed`);
if (consoleProblems.length) {
  console.log('\n  Console problems:');
  consoleProblems.slice(0, 20).forEach((p) => console.log(`   ! ${p}`));
}
if (failed.length) {
  console.log('\n  Failures:');
  failed.forEach((f) => console.log(`   ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`));
  process.exit(1);
}
console.log('  All browser tests passed ✓\n');
