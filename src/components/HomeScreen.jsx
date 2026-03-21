import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdBanner from './AdBanner'
import '../styles/HomeScreen.css'

const games = [
  { emoji: '✖️', title: 'Times Tables', desc: 'Practice multiplication with fun questions!', path: '/times-tables', color: '#FF6B6B' },
  { emoji: '🎨', title: 'Color Match', desc: 'Match the color name to the right color!', path: '/color-match', color: '#4ECDC4' },
  { emoji: '🔷', title: 'Shape Match', desc: 'Identify shapes and match their names!', path: '/shape-match', color: '#45B7D1' },
  { emoji: '🔢', title: 'Counting Game', desc: 'Count the objects and pick the right number!', path: '/counting', color: '#96CEB4' },
  { emoji: '🔤', title: 'Alphabet Match', desc: 'Tap letters in A–Z order!', path: '/alphabet', color: '#FF9F43' },
  { emoji: '🐝', title: 'Spelling Bee', desc: 'Spell simple words with fun hints!', path: '/spelling', color: '#F7DC6F' },
  { emoji: '➕', title: 'Addition Game', desc: 'Solve simple addition questions!', path: '/addition', color: '#A29BFE' },
  { emoji: '🃏', title: 'Memory Flip', desc: 'Flip cards to find matching pairs!', path: '/memory', color: '#FD79A8' },
  { emoji: '📊', title: 'My Progress', desc: 'See your scores and stars!', path: '/progress', color: '#DDA0DD' },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="home-screen">
      <div className="home-hero">
        <h1 className="home-title">KidLearn 🎓</h1>
        <p className="home-subtitle">Learn, Play, and Grow! 🌈</p>
      </div>
      <div className="games-grid">
        {games.map((g) => (
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
            <button className="btn btn-primary game-card-btn" style={{ background: g.color }}>
              Play Now! 🚀
            </button>
          </div>
        ))}
      </div>
      <AdBanner />
    </div>
  );
}
