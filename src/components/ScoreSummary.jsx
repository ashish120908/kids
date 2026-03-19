import React from 'react'
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

export default function ScoreSummary({ score, total, gameName, onPlayAgain, onHome }) {
  const stars = getStars(score, total);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const msgs = MESSAGES[stars];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];

  return (
    <div className="score-summary-overlay">
      <Confetti active={stars === 3} />
      <div className="score-summary-card card">
        <h2 className="score-title">{msg}</h2>
        <p className="score-game-name">{gameName}</p>
        <div className="score-display">
          <span className="score-number">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>
        <p className="score-pct">{pct}%</p>
        <StarRating score={score} total={total} />
        <div className="score-buttons">
          <button className="btn btn-primary" onClick={onPlayAgain}>🔄 Play Again</button>
          <button className="btn btn-success" onClick={onHome}>🏠 Home</button>
        </div>
        <AdBanner />
      </div>
    </div>
  );
}
