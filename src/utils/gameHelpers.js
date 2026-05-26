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

export const generateUniqueItems = (count, generator, keyExtractor, maxAttempts = count * 50) => {
  const items = [];
  const seen = new Set();
  let attempts = 0;

  while (items.length < count && attempts < maxAttempts) {
    const item = generator();
    const key = keyExtractor(item);
    if (!seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
    attempts++;
  }

  // Best effort: if the unique key space is smaller than requested count,
  // fill remaining slots with potentially duplicate items so games can
  // still start with the full number of rounds.
  if (items.length < count) {
    console.warn(
      `generateUniqueItems: requested ${count} unique items but only found ${items.length} due to limited unique key space. Filling remaining slots with potentially duplicate items. This may result in repeated questions during gameplay.`
    );
  }
  while (items.length < count) {
    items.push(generator());
  }

  return items;
};
