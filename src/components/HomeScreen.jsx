import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdBanner from './AdBanner'
import { getAllScores } from '../utils/scoreManager'
import '../styles/HomeScreen.css'

const games = [
  { emoji: '✖️', title: 'Times Tables', desc: 'Practice multiplication with fun questions!', path: '/times-tables', color: '#FF6B6B', key: 'times-tables' },
  { emoji: '🎨', title: 'Color Match', desc: 'Match the color name to the right color!', path: '/color-match', color: '#4ECDC4', key: 'color-match' },
  { emoji: '🔷', title: 'Shape Match', desc: 'Identify shapes and match their names!', path: '/shape-match', color: '#45B7D1', key: 'shape-match' },
  { emoji: '🔢', title: 'Counting Game', desc: 'Count the objects and pick the right number!', path: '/counting', color: '#96CEB4', key: 'counting' },
  { emoji: '🔤', title: 'Alphabet Match', desc: 'Tap letters in A–Z order!', path: '/alphabet', color: '#FF9F43', key: 'alphabet' },
  { emoji: '🐝', title: 'Spelling Bee', desc: 'Spell words with fun hints!', path: '/spelling', color: '#F7DC6F', key: 'spelling' },
  { emoji: '➕', title: 'Addition Game', desc: 'Solve addition questions!', path: '/addition', color: '#A29BFE', key: 'addition' },
  { emoji: '➖', title: 'Subtraction Game', desc: 'Practice subtraction with fun questions!', path: '/subtraction', color: '#FF8C42', key: 'subtraction' },
  { emoji: '🃏', title: 'Memory Flip', desc: 'Flip cards to find matching pairs!', path: '/memory', color: '#FD79A8', key: 'memory' },
  { emoji: '➗', title: 'Division Game', desc: 'Learn division with exact answers!', path: '/division', color: '#00B894', key: 'division' },
  { emoji: '🎵', title: 'Rhyming Game', desc: 'Pick the word that rhymes!', path: '/rhyming', color: '#E17055', key: 'rhyming' },
  { emoji: '🕐', title: 'Clock Reading', desc: 'Tell the time on an analog clock!', path: '/clock', color: '#0984E3', key: 'clock' },
  { emoji: '🔁', title: 'Pattern Game', desc: 'Complete the pattern sequence!', path: '/pattern', color: '#6C5CE7', key: 'pattern' },
  { emoji: '⚖️', title: 'Compare Numbers', desc: 'Use >, < and = to compare numbers!', path: '/compare', color: '#FDCB6E', key: 'compare' },
  { emoji: '📊', title: 'My Progress', desc: 'See your scores and stars!', path: '/progress', color: '#DDA0DD', key: null, btnLabel: 'View Progress 📊' },
  { emoji: '👤', title: 'My Profile', desc: 'Set your name and avatar!', path: '/profile', color: '#667eea', key: null, btnLabel: 'View Profile 👤' },
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

  return (
    <div className="home-screen">
      <div className="home-hero">
        <h1 className="home-title">KidLearn 🎓</h1>
        <p className="home-subtitle">Learn, Play, and Grow! 🌈</p>
      </div>
      <div className="games-grid">
        {games.map((g) => {
          const highestLevel = getHighestLevel(g.key);
          return (
            <div
              key={g.path}
              className="game-card card"
              onClick={() => navigate(g.path)}
              style={{ borderTop: `6px solid ${g.color}` }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(g.path)}
            >
              <div className="game-card-emoji" style={{ background: g.color }}>{g.emoji}</div>
              <h3 className="game-card-title">{g.title}</h3>
              <p className="game-card-desc">{g.desc}</p>
              {highestLevel && (
                <p className="game-card-level-badge">Level {highestLevel} reached 🏆</p>
              )}
              <button className="btn btn-primary game-card-btn" style={{ background: g.color }}>
                {g.btnLabel || 'Play Now! 🚀'}
              </button>
            </div>
          );
        })}
      </div>
      <AdBanner />
    </div>
  );
}
