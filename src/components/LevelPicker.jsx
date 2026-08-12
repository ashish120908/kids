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

  const completedCount = Array.from({ length: displayCount }, (_, i) => i + 1)
    .filter(lvl => { const s = getScore(gameName, lvl); return s && s.stars > 0; }).length;
  const totalStars = Array.from({ length: displayCount }, (_, i) => i + 1)
    .reduce((sum, lvl) => { const s = getScore(gameName, lvl); return sum + (s ? s.stars : 0); }, 0);

  return (
    <div className="space-game-screen animate-in">
      {/* Top Navigation Bar */}
      <div className="mockup-top-bar">
        <div className="top-bar-left">
          <div className="top-bar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="brand-star-icon">⭐</span> KidLearn
          </div>
          <div className="top-bar-level-box">
            <span className="top-bar-level-text">{gameTitle} {gameEmoji}</span>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="pill-stat pill-star">
            ⭐ {totalStars} Stars
          </div>
          <div className="pill-stat pill-flame">
            🏆 {completedCount} Done
          </div>
          <button className="pill-btn" onClick={() => navigate('/')}>
            🏠 Home
          </button>
        </div>
      </div>

      {/* Level Selection Display Card */}
      <div className="mockup-question-card" style={{ maxWidth: 840, flexDirection: 'column', padding: '32px 24px' }}>
        <div className="card-shine-line" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <OwlCharacter />
          <h2 className="mockup-question-text" style={{ fontSize: 42 }}>Choose Level</h2>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center',
          maxHeight: 320, overflowY: 'auto', padding: '12px 8px', width: '100%'
        }}>
          {Array.from({ length: displayCount }, (_, i) => {
            const lvl = i + 1;
            const saved = getScore(gameName, lvl);
            const isLocked = lvl > maxAccessible;
            const isNext = lvl === maxUnlocked + 1 && !isLocked;

            return (
              <button
                key={lvl}
                disabled={isLocked}
                onClick={() => !isLocked && onSelectLevel(lvl)}
                style={{
                  width: 72, height: 72,
                  borderRadius: 20,
                  border: isNext ? '3px solid #00E676' : '2px solid rgba(255,255,255,0.4)',
                  background: isLocked ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, hsl(${(lvl * 28) % 360},80%,55%), hsl(${(lvl * 28 + 30) % 360},80%,45%))`,
                  color: isLocked ? 'rgba(255,255,255,0.3)' : '#ffffff',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: isLocked ? 26 : 28,
                  boxShadow: isLocked ? 'none' : '0 8px 20px rgba(0,0,0,0.4)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.18s ease'
                }}
              >
                {isLocked ? '🔒' : (
                  <>
                    <span>{lvl}</span>
                    {saved && saved.stars > 0 && (
                      <span style={{ fontSize: 10, marginTop: -4 }}>{'⭐'.repeat(Math.min(3, saved.stars))}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mockup-bottom-bar" style={{ justifyContent: 'center' }}>
        <button className="next-problem-btn" onClick={() => onSelectLevel(1)}>
          PLAY LEVEL 1 🚀
        </button>
      </div>
    </div>
  );
}
