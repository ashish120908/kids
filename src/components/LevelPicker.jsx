import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getScore, getMaxUnlockedLevel } from '../utils/scoreManager'
import OwlCharacter from './OwlCharacter'
import '../styles/Games.css'

export default function LevelPicker({ gameName, gameTitle, gameEmoji, onSelectLevel }) {
  const navigate = useNavigate();
  const maxUnlocked = getMaxUnlockedLevel(gameName);
  const maxAccessible = Math.max(10, maxUnlocked + 1);
  const displayCount = maxAccessible + 3;
  const nextLevel = Math.min(maxUnlocked + 1, maxAccessible);

  const levels = Array.from({ length: displayCount }, (_, i) => i + 1);
  const completedCount = levels.filter((lvl) => {
    const s = getScore(gameName, lvl);
    return s && s.stars > 0;
  }).length;
  const totalStars = levels.reduce((sum, lvl) => {
    const s = getScore(gameName, lvl);
    return sum + (s ? s.stars : 0);
  }, 0);

  return (
    <div className="space-game-screen animate-in">
      <div className="mockup-top-bar">
        <div className="top-bar-left">
          <button
            className="pill-btn pill-btn-back"
            onClick={() => navigate('/')}
            aria-label="Back to all games"
            title="Back to all games"
          >
            ←
          </button>
          <div
            className="top-bar-brand"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          >
            <span className="brand-star-icon" aria-hidden="true">⭐</span> KidLearn
          </div>
          <div className="top-bar-level-box">
            <span className="top-bar-level-text">{gameTitle} {gameEmoji}</span>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="pill-stat pill-star">⭐ {totalStars} Stars</div>
          <div className="pill-stat pill-flame">🏆 {completedCount} Done</div>
          <button className="pill-btn" onClick={() => navigate('/')}>🏠 Home</button>
        </div>
      </div>

      <div className="mockup-question-card level-picker-card">
        <div className="card-shine-line" />
        <div className="level-picker-header">
          <OwlCharacter />
          <div>
            <h2 className="mockup-question-text level-picker-title">Choose Level</h2>
            <p className="level-picker-sub">
              {maxUnlocked === 0
                ? 'Start at Level 1 — new levels unlock as you earn stars.'
                : `Best so far: Level ${maxUnlocked}. Keep going!`}
            </p>
          </div>
        </div>

        <div className="level-grid">
          {levels.map((lvl) => {
            const saved = getScore(gameName, lvl);
            const isLocked = lvl > maxAccessible;
            const isNext = lvl === nextLevel && !isLocked;

            return (
              <button
                key={lvl}
                disabled={isLocked}
                onClick={() => !isLocked && onSelectLevel(lvl)}
                className={`level-tile${isLocked ? ' level-tile-locked' : ''}${isNext ? ' level-tile-next' : ''}`}
                style={isLocked ? undefined : {
                  background: `linear-gradient(135deg, hsl(${(lvl * 28) % 360},80%,55%), hsl(${(lvl * 28 + 30) % 360},80%,45%))`,
                }}
                aria-label={
                  isLocked
                    ? `Level ${lvl}, locked`
                    : `Level ${lvl}${saved && saved.stars ? `, ${saved.stars} of 3 stars` : ', not played yet'}`
                }
              >
                {isLocked ? '🔒' : (
                  <>
                    <span>{lvl}</span>
                    {saved && saved.stars > 0 && (
                      <span className="level-tile-stars">{'⭐'.repeat(Math.min(3, saved.stars))}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mockup-bottom-bar level-picker-bottom">
        <button className="next-problem-btn" onClick={() => onSelectLevel(nextLevel)}>
          {maxUnlocked === 0 ? 'START LEVEL 1 🚀' : `CONTINUE — LEVEL ${nextLevel} 🚀`}
        </button>
      </div>
    </div>
  );
}
