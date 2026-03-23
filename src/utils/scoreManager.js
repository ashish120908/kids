const SCORE_KEY_PREFIX = 'kidlearn_score_';
const GAMES = ['times-tables', 'color-match', 'shape-match', 'counting', 'alphabet', 'spelling', 'addition', 'subtraction', 'memory'];

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

export const getAllScores = () => {
  return GAMES.reduce((acc, g) => {
    acc[g] = {};
    for (let level = 1; level <= 10; level++) {
      const s = getScore(g, level);
      if (s) acc[g][level] = s;
    }
    return acc;
  }, {});
};

export const clearScores = () => {
  GAMES.forEach(g => {
    for (let level = 1; level <= 10; level++) {
      localStorage.removeItem(`${SCORE_KEY_PREFIX}${g}_level_${level}`);
    }
    // Remove legacy keys for backward compatibility
    localStorage.removeItem(SCORE_KEY_PREFIX + g);
  });
};
