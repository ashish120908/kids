import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdBanner from './AdBanner'
import { getAllScores } from '../utils/scoreManager'
import StreakBanner from './StreakBanner'
import '../styles/HomeScreen.css'


const games = [
  { emoji: '✖️', title: 'Times Tables', desc: 'Practice multiplication with fun questions!', path: '/times-tables', color: '#FF6B6B', key: 'times-tables', cat: 'math' },
  { emoji: '🔢', title: 'Counting Game', desc: 'Count the objects and pick the right number!', path: '/counting', color: '#96CEB4', key: 'counting', cat: 'math' },
  { emoji: '➕', title: 'Addition Game', desc: 'Solve addition questions!', path: '/addition', color: '#A29BFE', key: 'addition', cat: 'math' },
  { emoji: '➖', title: 'Subtraction Game', desc: 'Practice subtraction with fun questions!', path: '/subtraction', color: '#FF8C42', key: 'subtraction', cat: 'math' },
  { emoji: '➗', title: 'Division Game', desc: 'Learn division with exact answers!', path: '/division', color: '#00B894', key: 'division', cat: 'math' },
  { emoji: '⚖️', title: 'Compare Numbers', desc: 'Use >, < and = to compare numbers!', path: '/compare', color: '#FDCB6E', key: 'compare', cat: 'math' },
  { emoji: '🕐', title: 'Clock Reading', desc: 'Tell the time on an analog clock!', path: '/clock', color: '#0984E3', key: 'clock', cat: 'math' },

  { emoji: '🔤', title: 'Alphabet Match', desc: 'Tap letters in A–Z order!', path: '/alphabet', color: '#FF9F43', key: 'alphabet', cat: 'reading' },
  { emoji: '🐝', title: 'Spelling Bee', desc: 'Spell words with fun hints!', path: '/spelling', color: '#F7DC6F', key: 'spelling', cat: 'reading' },
  { emoji: '🎵', title: 'Rhyming Game', desc: 'Pick the word that rhymes!', path: '/rhyming', color: '#E17055', key: 'rhyming', cat: 'reading' },
  { emoji: '🗣️', title: 'English Speaking', desc: 'Practice speaking English words and phrases!', path: '/english-speaking', color: '#26de81', key: 'english-speaking', cat: 'reading' },

  { emoji: '🎨', title: 'Color Match', desc: 'Match the color name to the right color!', path: '/color-match', color: '#4ECDC4', key: 'color-match', cat: 'logic' },
  { emoji: '🔷', title: 'Shape Match', desc: 'Identify shapes and match their names!', path: '/shape-match', color: '#45B7D1', key: 'shape-match', cat: 'logic' },
  { emoji: '🃏', title: 'Memory Flip', desc: 'Flip cards to find matching pairs!', path: '/memory', color: '#FD79A8', key: 'memory', cat: 'logic' },
  { emoji: '🔁', title: 'Pattern Game', desc: 'Complete the pattern sequence!', path: '/pattern', color: '#6C5CE7', key: 'pattern', cat: 'logic' },

  { emoji: '📊', title: 'My Progress', desc: 'See your scores and stars!', path: '/progress', color: '#DDA0DD', key: null, btnLabel: 'View Progress 📊', cat: 'you' },
  { emoji: '👤', title: 'My Profile', desc: 'Set your name and avatar!', path: '/profile', color: '#667eea', key: null, btnLabel: 'View Profile 👤', cat: 'you' },
];

const categories = [
  { key: 'math', emoji: '🔢', title: 'Math', sub: 'Numbers, counting & calculations' },
  { key: 'reading', emoji: '📚', title: 'Reading & English', sub: 'Letters, words & speaking' },
  { key: 'logic', emoji: '🧩', title: 'Logic & Fun', sub: 'Shapes, colors, patterns & memory' },
  { key: 'you', emoji: '⭐', title: 'Your Corner', sub: 'Track progress & set up your profile' },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const allScores = getAllScores();

  const getHighestLevel = (key) => {
    if (!key) return null;
    const gameLevels = allScores[key] || {};
    const levels = Object.keys(gameLevels).map(Number);
    return levels.length > 0 ? Math.max(...levels) : null;
  };

  const renderCard = (g) => {
    const highestLevel = getHighestLevel(g.key);
    return (
      <div
        key={g.path}
        className="game-card card animate-in"
        onClick={() => navigate(g.path)}
        style={{ borderTop: `6px solid ${g.color}` }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(g.path)}
      >
        <div className="game-card-emoji animate-bounce" style={{ background: g.color }}>{g.emoji}</div>
        <h3 className="game-card-title">{g.title}</h3>
        <p className="game-card-desc">{g.desc}</p>
        {highestLevel != null && (
          <p className="game-card-level-badge">Level {highestLevel} reached 🏆</p>
        )}
        <button className="btn btn-primary game-card-btn gradient-button" style={{ background: g.color }}>
          {g.btnLabel || 'Play Now! 🚀'}
        </button>
      </div>
    );
  };

  return (
    <div className="home-screen">
      <div className="home-hero home-hero-gradient animate-in">
        <h1 className="home-title">KidLearn 🎓</h1>
        <p className="home-subtitle">Learn, Play, and Grow! 🌈</p>
        <StreakBanner />


      </div>

      {categories.map((cat) => {
        const items = games.filter((g) => g.cat === cat.key);
        if (items.length === 0) return null;
        return (
          <section className="games-section" key={cat.key}>
            <h2 className="games-section-title">
              <span aria-hidden="true">{cat.emoji}</span> {cat.title}
            </h2>
            <p className="games-section-sub">{cat.sub}</p>
            <div className="games-grid">
              {items.map(renderCard)}
            </div>
          </section>
        );
      })}
      <AdBanner />
    </div>
  );
}

