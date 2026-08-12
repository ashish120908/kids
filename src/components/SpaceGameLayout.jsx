import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OwlCharacter from './OwlCharacter'
import AlienCharacter from './AlienCharacter'
import Confetti from './Confetti'
import { isMuted, toggleMute } from '../utils/soundManager'
import { getTotalStars } from '../utils/scoreManager'

export default function SpaceGameLayout({
  gameTitle,
  level = 1,
  current = 0,
  total = 10,
  score = 0,
  showConfetti = false,
  questionText,
  children,
  onNext,
  onSkip,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(isMuted());
  const [totalStars] = useState(getTotalStars() || 120);

  const handleMuteToggle = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  return (
    <div className="space-game-screen animate-in">
      <Confetti active={showConfetti} />

      {/* Top Navigation Bar */}
      <div className="mockup-top-bar">
        <div className="top-bar-left">
          <div className="top-bar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="brand-star-icon">⭐</span> KidLearn
          </div>
          <div className="top-bar-level-box">
            <span className="top-bar-level-text">LEVEL {level}</span>
            <div className="top-bar-level-bar">
              <div className="top-bar-level-fill" style={{ width: `${Math.min(100, ((current + 1) / total) * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="pill-stat pill-star">
            ⭐ {totalStars}
          </div>
          <div className="pill-stat pill-flame">
            🔥 5 Days 🚀
          </div>
          <button className="pill-btn" onClick={handleMuteToggle} title="Toggle sound">
            {muted ? '🔇 Off' : '🔊 On'}
          </button>
          <button className="pill-btn" onClick={onOpenSettings} title="Settings">
            ⚙️
          </button>
          <button className="pill-btn" onClick={() => navigate('/profile')} title="Profile">
            👤
          </button>
        </div>
      </div>

      {/* Question Display Card with 3D Owl Mascot */}
      {questionText && (
        <div className="mockup-question-card">
          <div className="card-shine-line" />
          <OwlCharacter />
          <h2 className="mockup-question-text">{questionText}</h2>
        </div>
      )}

      {/* Interactive Game Body (Candy Buttons, Cards, Matching Grid) */}
      <div className="game-body-content" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>

      {/* Bottom Bar with 3D Alien Mascot & Golden Sponsor Frame */}
      <div className="mockup-bottom-bar">
        <div className="alien-mascot-container">
          <AlienCharacter />
          <button className="skip-quest-btn" onClick={onSkip || onNext}>
            SKIP QUEST
          </button>
        </div>

        <div className="sponsor-golden-container">
          <div className="sponsor-badge-header">Sponsor</div>
          <div className="sponsor-ad-content">
            <span style={{ fontSize: 18 }}>👾 ⭐</span>
            <button className="sponsor-ad-btn">
              PLAY GAMES! [AD]
            </button>
            <span style={{ fontSize: 18 }}>🚀 🌟</span>
          </div>
        </div>

        <button className="next-problem-btn" onClick={onNext}>
          NEXT PROBLEM ➔
        </button>
      </div>
    </div>
  );
}
