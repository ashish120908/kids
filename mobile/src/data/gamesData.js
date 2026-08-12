export const games = [
  // Math
  { id: 'addition', title: 'Addition Game', emoji: '➕', desc: 'Solve addition questions!', path: 'MathGame', mode: 'addition', color: '#A29BFE', cat: 'math' },
  { id: 'subtraction', title: 'Subtraction Game', emoji: '➖', desc: 'Practice subtraction!', path: 'MathGame', mode: 'subtraction', color: '#FF8C42', cat: 'math' },
  { id: 'times-tables', title: 'Times Tables', emoji: '✖️', desc: 'Practice multiplication!', path: 'MathGame', mode: 'multiplication', color: '#FF6B6B', cat: 'math' },
  { id: 'division', title: 'Division Game', emoji: '➗', desc: 'Learn division!', path: 'MathGame', mode: 'division', color: '#00B894', cat: 'math' },
  { id: 'counting', title: 'Counting Game', emoji: '🔢', desc: 'Count the objects!', path: 'CountingPattern', color: '#96CEB4', cat: 'math' },
  { id: 'compare', title: 'Compare Numbers', emoji: '⚖️', desc: 'Use >, < and =!', path: 'MathGame', mode: 'comparison', color: '#FDCB6E', cat: 'math' },
  { id: 'clock', title: 'Clock Reading', emoji: '🕐', desc: 'Tell the time!', path: 'MathGame', mode: 'clock', color: '#0984E3', cat: 'math' },

  // Reading
  { id: 'alphabet', title: 'Alphabet Match', emoji: '🔤', desc: 'Tap letters in A–Z order!', path: 'Lesson', color: '#FF9F43', cat: 'reading' },
  { id: 'spelling', title: 'Spelling Bee', emoji: '🐝', desc: 'Spell words with hints!', path: 'Spelling', color: '#F7DC6F', cat: 'reading' },
  { id: 'rhyming', title: 'Rhyming Game', emoji: '🎵', desc: 'Pick the word that rhymes!', path: 'Lesson', color: '#E17055', cat: 'reading' },
  { id: 'english-speaking', title: 'English Speaking', emoji: '🗣️', desc: 'Practice words!', path: 'Lesson', color: '#26de81', cat: 'reading' },

  // Logic
  { id: 'color-match', title: 'Color Match', emoji: '🎨', desc: 'Match colors!', path: 'ColorShape', color: '#4ECDC4', cat: 'logic' },
  { id: 'shape-match', title: 'Shape Match', emoji: '🔷', desc: 'Identify shapes!', path: 'ColorShape', color: '#45B7D1', cat: 'logic' },
  { id: 'memory', title: 'Memory Flip', emoji: '🃏', desc: 'Find matching pairs!', path: 'MemoryFlip', color: '#FD79A8', cat: 'logic' },
  { id: 'pattern', title: 'Pattern Game', emoji: '🔁', desc: 'Complete sequences!', path: 'CountingPattern', color: '#6C5CE7', cat: 'logic' },
];

export const categories = [
  { key: 'math', emoji: '🔢', title: 'Math', sub: 'Numbers & calculations' },
  { key: 'reading', emoji: '📚', title: 'Reading & English', sub: 'Letters & words' },
  { key: 'logic', emoji: '🧩', title: 'Logic & Fun', sub: 'Shapes, colors & memory' },
];
