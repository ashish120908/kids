const SCORE_KEY_PREFIX = 'kidlearn_score_';
const GAMES = ['times-tables', 'color-match', 'shape-match', 'counting', 'alphabet', 'spelling', 'addition', 'subtraction', 'memory', 'division', 'rhyming', 'clock', 'pattern', 'compare', 'english-speaking'];

const getStarsFromScore = (score, total) => {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 1) return 3;
  if (pct >= 0.75) return 2;
  if (pct >= 0.5) return 1;
  return 0;
};

export const saveScore = (gameName, level, score, total) => {
  const key = `${SCORE_KEY_PREFIX}${gameName}_level_${level}`;
  const existing = getScore(gameName, level);
  const stars = getStarsFromScore(score, total);
  if (!existing || stars > existing.stars) {
    localStorage.setItem(key, JSON.stringify({ score, total, stars, date: new Date().toISOString() }));
  }
};

export const getScore = (gameName, level) => {
  const key = `${SCORE_KEY_PREFIX}${gameName}_level_${level}`;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

export const getMaxUnlockedLevel = (gameName) => {
  let max = 0;
  const prefix = `${SCORE_KEY_PREFIX}${gameName}_level_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const lvl = parseInt(key.slice(prefix.length), 10);
      if (!isNaN(lvl)) {
        const saved = getScore(gameName, lvl);
        if (saved && saved.stars > 0) max = Math.max(max, lvl);
      }
    }
  }
  return max;
};

export const getAllScores = () => {
  return GAMES.reduce((acc, g) => {
    acc[g] = {};
    const prefix = `${SCORE_KEY_PREFIX}${g}_level_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const lvl = parseInt(key.slice(prefix.length), 10);
        if (!isNaN(lvl)) {
          const s = getScore(g, lvl);
          if (s) acc[g][lvl] = s;
        }
      }
    }
    return acc;
  }, {});
};

export const clearScores = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SCORE_KEY_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
};
