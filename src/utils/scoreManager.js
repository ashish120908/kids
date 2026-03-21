const SCORE_KEY_PREFIX = 'kidlearn_score_';

const getStarsFromScore = (score, total) => {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 1) return 3;
  if (pct >= 0.75) return 2;
  if (pct >= 0.5) return 1;
  return 0;
};

export const saveScore = (gameName, score, total) => {
  const key = SCORE_KEY_PREFIX + gameName;
  const existing = getScore(gameName);
  const stars = getStarsFromScore(score, total);
  if (!existing || stars > existing.stars) {
    localStorage.setItem(key, JSON.stringify({ score, total, stars, date: new Date().toISOString() }));
  }
};

export const getScore = (gameName) => {
  const key = SCORE_KEY_PREFIX + gameName;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

export const getAllScores = () => {
  const games = ['times-tables', 'color-match', 'shape-match', 'counting', 'alphabet', 'spelling', 'addition', 'memory'];
  return games.reduce((acc, g) => {
    acc[g] = getScore(g);
    return acc;
  }, {});
};

export const clearScores = () => {
  const games = ['times-tables', 'color-match', 'shape-match', 'counting', 'alphabet', 'spelling', 'addition', 'memory'];
  games.forEach(g => localStorage.removeItem(SCORE_KEY_PREFIX + g));
};
