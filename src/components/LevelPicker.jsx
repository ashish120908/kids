import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getScore } from '../utils/scoreManager'
import '../styles/Games.css'

export default function LevelPicker({ gameName, gameTitle, gameEmoji, onSelectLevel }) {
  const navigate = useNavigate();
  return (
    <div className="game-container">
      <h2 className="game-title">{gameTitle} {gameEmoji}</h2>
      <p className="game-subtitle">Choose your level!</p>
      <div className="level-picker-grid">
        {Array.from({ length: 10 }, (_, i) => {
          const lvl = i + 1;
          const saved = getScore(gameName, lvl);
          return (
            <button
              key={lvl}
              className="level-picker-btn btn"
              onClick={() => onSelectLevel(lvl)}
              style={{ background: `hsl(${lvl * 28}, 70%, 60%)` }}
            >
              <span className="level-picker-num">{lvl}</span>
              {saved && saved.stars > 0 && (
                <span className="level-picker-stars">{'⭐'.repeat(saved.stars)}</span>
              )}
            </button>
          );
        })}
      </div>
      <button className="btn btn-success" onClick={() => navigate('/')} style={{ marginTop: 8 }}>
        🏠 Home
      </button>
    </div>
  );
}
