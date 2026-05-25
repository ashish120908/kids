import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getScore, getMaxUnlockedLevel } from '../utils/scoreManager'
import '../styles/Games.css'

export default function LevelPicker({ gameName, gameTitle, gameEmoji, onSelectLevel }) {
  const navigate = useNavigate();
  const maxUnlocked = getMaxUnlockedLevel(gameName);
  const maxAccessible = Math.max(10, maxUnlocked + 1);
  const displayCount = maxAccessible + 3;

  const completedCount = Array.from({ length: displayCount }, (_, i) => i + 1)
    .filter(lvl => { const s = getScore(gameName, lvl); return s && s.stars > 0; }).length;
  const totalStars = Array.from({ length: displayCount }, (_, i) => i + 1)
    .reduce((sum, lvl) => { const s = getScore(gameName, lvl); return sum + (s ? s.stars : 0); }, 0);

  return (
    <div className="game-container">
      <h2 className="game-title">{gameTitle} {gameEmoji}</h2>
      <p className="game-subtitle">Choose your level! 🚀</p>

      {completedCount > 0 && (
        <div className="level-picker-stats">
          <span>🏆 {completedCount} done</span>
          <span>⭐ {totalStars} stars</span>
        </div>
      )}

      <div className="level-picker-scroll">
        <div className="level-picker-grid">
          {Array.from({ length: displayCount }, (_, i) => {
            const lvl = i + 1;
            const saved = getScore(gameName, lvl);
            const isLocked = lvl > maxAccessible;
            const isNext = lvl === maxUnlocked + 1 && !isLocked;
            return (
              <button
                key={lvl}
                className={`level-picker-btn btn${isNext ? ' level-picker-btn-next' : ''}${isLocked ? ' level-picker-btn-locked' : ''}`}
                onClick={() => !isLocked && onSelectLevel(lvl)}
                disabled={isLocked}
                style={!isLocked ? { background: `linear-gradient(135deg, hsl(${(lvl * 28) % 360},80%,55%), hsl(${(lvl * 28 + 30) % 360},80%,45%))` } : {}}
              >
                {isLocked ? (
                  <span className="level-picker-num">🔒</span>
                ) : (
                  <>
                    <span className="level-picker-num">{lvl}</span>
                    {saved && saved.stars > 0 && (
                      <span className="level-picker-stars">{'⭐'.repeat(saved.stars)}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '-4px 0 0', fontFamily: "'Fredoka One', cursive" }}>
        Beat a level to unlock the next! 🔓
      </p>
      <button className="btn btn-success" onClick={() => navigate('/')} style={{ marginTop: 8 }}>
        🏠 Home
      </button>
    </div>
  );
}

