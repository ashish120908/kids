// Non-repeating question engine for KidLearn Web

const STORAGE_KEY = 'kidlearn_answered_questions_v1';

function getAnsweredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAnsweredHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
}

export function recordQuestionAnswered(subject, questionId) {
  const history = getAnsweredHistory();
  if (!history[subject]) history[subject] = [];
  if (!history[subject].includes(questionId)) {
    history[subject].push(questionId);
  }
  saveAnsweredHistory(history);
}

export function resetQuestionHistory(subject) {
  const history = getAnsweredHistory();
  if (subject) {
    delete history[subject];
  } else {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  saveAnsweredHistory(history);
}

// Generates non-repeating Math Question
export function generateMathQuestion(type = 'addition', level = 1) {
  const history = getAnsweredHistory()[type] || [];
  let maxNum = level * 10;
  if (level === 1) maxNum = 10;
  if (level === 2) maxNum = 20;
  if (level === 3) maxNum = 50;

  let attempts = 0;
  let qKey = '';
  let num1 = 0, num2 = 0, answer = 0, op = '+';

  while (attempts < 100) {
    attempts++;
    if (type === 'addition') {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      op = '+';
    } else if (type === 'subtraction') {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * num1) + 1; // guarantee positive result
      answer = num1 - num2;
      op = '-';
    } else if (type === 'multiplication' || type === 'times-tables') {
      num1 = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
      num2 = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
      answer = num1 * num2;
      op = '×';
    } else if (type === 'division') {
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer; // guarantee clean integer division
      op = '÷';
    }

    qKey = `${type}_${num1}_${op}_${num2}`;
    if (!history.includes(qKey)) {
      break; // Found an unanswered question!
    }
  }

  // If pool exhausted, reset history for this category
  if (attempts >= 100) {
    resetQuestionHistory(type);
  }

  // Generate 3 unique wrong options
  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = Math.max(0, answer + delta);
    if (wrong !== answer) optionsSet.add(wrong);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: qKey,
    question: `${num1} ${op} ${num2} = ?`,
    answer: answer,
    options: options,
  };
}

// Generates non-repeating Spelling Word
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
  const history = getAnsweredHistory()['spelling'] || [];
  let available = SPELLING_WORDS.filter(w => !history.includes(w.word));

  if (available.length === 0) {
    resetQuestionHistory('spelling');
    available = SPELLING_WORDS;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  return chosen;
}
