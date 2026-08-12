// Non-repeating question engine for KidLearn React Native Android App
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kidlearn_mobile_answered_questions_v1';

async function getAnsweredHistory() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function saveAnsweredHistory(history) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
}

export async function recordQuestionAnswered(subject, questionId) {
  const history = await getAnsweredHistory();
  if (!history[subject]) history[subject] = [];
  if (!history[subject].includes(questionId)) {
    history[subject].push(questionId);
  }
  await saveAnsweredHistory(history);
}

export async function generateMathQuestionMobile(type = 'addition', level = 1) {
  const historyMap = await getAnsweredHistory();
  const history = historyMap[type] || [];

  let maxNum = level * 10;
  if (level === 1) maxNum = 10;
  if (level === 2) maxNum = 20;

  let attempts = 0;
  let qKey = '';
  let num1 = 0, num2 = 0, answer = 0, op = '+';

  while (attempts < 80) {
    attempts++;
    if (type === 'addition') {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      op = '+';
    } else if (type === 'subtraction') {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      op = '-';
    } else if (type === 'multiplication') {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      op = '×';
    } else if (type === 'division') {
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
      op = '÷';
    }

    qKey = `${type}_${num1}_${op}_${num2}`;
    if (!history.includes(qKey)) {
      break;
    }
  }

  if (attempts >= 80) {
    historyMap[type] = [];
    await saveAnsweredHistory(historyMap);
  }

  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 4) + 1) * (Math.random() > 0.5 ? 1 : -1);
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

export const COLOR_SHAPE_ITEMS = [
  { id: 'cs_1', type: 'color', name: 'RED', icon: '🔴', hex: '#FF4D4D' },
  { id: 'cs_2', type: 'color', name: 'BLUE', icon: '🔵', hex: '#4D94FF' },
  { id: 'cs_3', type: 'color', name: 'GREEN', icon: '🟢', hex: '#4DFF88' },
  { id: 'cs_4', type: 'color', name: 'YELLOW', icon: '🟡', hex: '#FFDD4D' },
  { id: 'cs_5', type: 'color', name: 'PURPLE', icon: '🟣', hex: '#B366FF' },
  { id: 'cs_6', type: 'shape', name: 'STAR', icon: '⭐', hex: '#FFC837' },
  { id: 'cs_7', type: 'shape', name: 'HEART', icon: '❤️', hex: '#FF416C' },
  { id: 'cs_8', type: 'shape', name: 'DIAMOND', icon: '🔷', hex: '#00B4DB' },
  { id: 'cs_9', type: 'shape', name: 'CIRCLE', icon: '⭕', hex: '#FF8008' },
];

export async function generateColorShapeQuestionMobile() {
  const historyMap = await getAnsweredHistory();
  const history = historyMap['colorshape'] || [];

  let available = COLOR_SHAPE_ITEMS.filter(item => !history.includes(item.id));
  if (available.length === 0) {
    historyMap['colorshape'] = [];
    await saveAnsweredHistory(historyMap);
    available = COLOR_SHAPE_ITEMS;
  }

  const target = available[Math.floor(Math.random() * available.length)];
  const optionsSet = new Set([target]);

  while (optionsSet.size < 4) {
    const randomItem = COLOR_SHAPE_ITEMS[Math.floor(Math.random() * COLOR_SHAPE_ITEMS.length)];
    optionsSet.add(randomItem);
  }

  return {
    target,
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
  };
}
