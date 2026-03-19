export const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getStars = (score, total) => {
  if (total === 0) return 0;
  const pct = score / total;
  if (pct >= 1) return 3;
  if (pct >= 0.75) return 2;
  if (pct >= 0.5) return 1;
  return 0;
};

export const generateMultipleChoices = (correct, min, max, count = 4) => {
  const choices = new Set([correct]);
  let attempts = 0;
  while (choices.size < count && attempts < 100) {
    choices.add(randomInt(min, max));
    attempts++;
  }
  let val = min;
  while (choices.size < count) {
    choices.add(val++);
  }
  return shuffle([...choices]);
};
