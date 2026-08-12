import React, { useMemo } from 'react'
import StarRating from './StarRating'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import { getStars } from '../utils/gameHelpers'
import '../styles/ScoreSummary.css'

const MESSAGES = {
  3: ['Amazing! 🎉', 'Perfect Score!', "You're a superstar! 🌟"],
  2: ['Great job! 👏', 'Almost there!', "You're doing awesome!"],
  1: ['Good try! 💪', 'Keep practicing!', "You're getting better!"],
  0: ["Don't give up! 🤗", 'Try again!', 'Practice makes perfect!'],
};

export default function ScoreSummary({ score, total, gameName, onPlayAgain, onHome, onNextLevel, onPickLevel, level }) {
  const stars = getStars(score, total);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  // Was recomputed on every render, so the message flickered and changed
  // while the child was reading it.
  const msg = useMemo(() => {
    const pool = MESSAGES[stars];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [stars, score, total, level]);

  const unlockedNext = stars > 0;

  return (
    <div className="score-summary-overlay">
      <Confetti active={stars === 3} />
      <div className="score-summary-card">
        <h2 className="score-title">{msg}</h2>
        <p className="score-game-name">{gameName}{level ? ` — Level ${level}` : ''}</p>
        <div className="score-display">
          <span className="score-number">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>
        <p className="score-pct">{pct}%</p>
        <StarRating score={score} total={total} />

        <p className="score-unlock-note">
          {unlockedNext
            ? `🔓 Level ${(level || 1) + 1} unlocked!`
            : 'Get at least half right to unlock the next level.'}
        </p>

        <div className="score-buttons">
          <button className="score-btn score-btn-again" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          {onNextLevel && unlockedNext && (
            <button className="score-btn score-btn-next" onClick={onNextLevel}>
              🚀 Next Level
            </button>
          )}
          {onPickLevel && (
            <button className="score-btn score-btn-levels" onClick={onPickLevel}>
              🎚️ Levels
            </button>
          )}
          <button className="score-btn score-btn-home" onClick={onHome}>
            🏠 Home
          </button>
        </div>
        <div className="score-ad-slot">
          <AdBanner slot="results" />
        </div>
      </div>
    </div>
  );
}
