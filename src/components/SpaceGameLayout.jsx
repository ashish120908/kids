import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import OwlCharacter from './OwlCharacter'
import AlienCharacter from './AlienCharacter'
import Confetti from './Confetti'
import AdBanner from './AdBanner'
import { isMuted, toggleMute } from '../utils/soundManager'
import { getTotalStars } from '../utils/scoreManager'
import { getStreak } from '../utils/streakManager'
import { getProfile } from '../utils/profile'

export default function SpaceGameLayout({
  gameTitle,
  level = 1,
  current = 0,
  total = 10,
  score = 0,
  showConfetti = false,
  questionText,
  hint,
  wrongAttempts = 0,
  children,
  onNext,
  onSkip,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(isMuted());
  const [totalStars, setTotalStars] = useState(getTotalStars);
  const [streak, setStreak] = useState(getStreak);
  // Read once per mount: the profile can only change on /profile, and getting
  // back here means a remount.
  const [profile] = useState(getProfile);

  // These were hardcoded before — the header always claimed "120 stars" and a
  // "5 day" streak regardless of what the child had actually done.
  useEffect(() => {
    const refresh = () => {
      setTotalStars(getTotalStars());
      setStreak(getStreak());
    };
    refresh();
    window.addEventListener('kidlearn-streak-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('kidlearn-streak-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [score]);

  const handleMuteToggle = () => setMuted(toggleMute());

  const progressPct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="space-game-screen animate-in">
      <Confetti active={showConfetti} />

      {/* Top navigation bar */}
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
            <Logo height={30} showTagline={false} />
          </div>
          <div className="top-bar-level-box">
            <span className="top-bar-level-text">
              {gameTitle ? `${gameTitle} · ` : ''}LEVEL {level}
            </span>
            <div
              className="top-bar-level-bar"
              role="progressbar"
              aria-valuenow={current}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label={`Question ${Math.min(current + 1, total)} of ${total}`}
            >
              <div className="top-bar-level-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="top-bar-progress-text">
              Question {Math.min(current + 1, total)} / {total}
            </span>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="pill-stat pill-score" title="Correct answers this round">
            ✅ {score}/{total}
          </div>
          <div className="pill-stat pill-star" title="Total stars earned">
            ⭐ {totalStars}
          </div>
          <div
            className={`pill-stat pill-flame${streak.current === 0 ? ' pill-flame-cold' : ''}`}
            title={streak.current === 0 ? 'Answer one question right to start a streak' : `Longest streak: ${streak.longest} days`}
          >
            🔥 {streak.current} {streak.current === 1 ? 'Day' : 'Days'}
          </div>
          <button className="pill-btn" onClick={handleMuteToggle} title="Toggle sound">
            {muted ? '🔇' : '🔊'}
          </button>
          <button className="pill-btn" onClick={onOpenSettings} title="Change level">
            🎚️
          </button>
          {/* The child's own avatar, not a generic bust - it is the one thing
              on this bar that is theirs, and the bust read as a broken image. */}
          <button className="pill-btn" onClick={() => navigate('/profile')} title="Profile">
            {profile.avatar}
          </button>
        </div>
      </div>

      {/* Question card with owl mascot */}
      {questionText && (
        <div className="mockup-question-card">
          <div className="card-shine-line" />
          <OwlCharacter />
          <div className="mockup-question-body">
            <h2 className="mockup-question-text">{questionText}</h2>
            {/* A wrong answer no longer skips the question, so say so — otherwise
                nothing on screen explains why the game didn't move on. */}
            {wrongAttempts > 0 ? (
              <p className="mockup-question-hint mockup-question-retry" role="status">
                {wrongAttempts === 1 ? 'Not quite — have another go! 🤔' : 'Try the highlighted one! 👇'}
              </p>
            ) : (
              hint && <p className="mockup-question-hint">{hint}</p>
            )}
          </div>
        </div>
      )}

      {/* Game body */}
      <div className="game-body-content">
        {children}
      </div>

      {/* Bottom bar */}
      <div className="mockup-bottom-bar">
        <div className="alien-mascot-container">
          <AlienCharacter />
          <button className="skip-quest-btn" onClick={onSkip || onNext}>
            SKIP QUEST
          </button>
        </div>

        {/* Was a fake "PLAY GAMES! [AD]" button styled exactly like the game's
            own purple CTAs — it did nothing when tapped, and looking like a
            game control is precisely what invites accidental clicks. Now a real
            unit, plainly labelled, and visually distinct from anything
            interactive in the game. Renders nothing until a slot is set. */}
        <AdBanner slot="inGame" className="ad-banner-ingame" />

        <button className="next-problem-btn" onClick={onNext}>
          NEXT PROBLEM ➔
        </button>
      </div>
    </div>
  );
}
