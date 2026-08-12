import React, { useState, useEffect } from 'react'
import { getStreak } from '../utils/streakManager'

export default function StreakBanner() {
  const [streak, setStreak] = useState(getStreak);

  useEffect(() => {
    const refresh = () => setStreak(getStreak());
    // Live-update when a game records activity, or when the tab regains focus.
    window.addEventListener('kidlearn-streak-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('kidlearn-streak-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const { current, longest, playedToday } = streak;
  const empty = current === 0;

  const message = playedToday
    ? 'You practiced today — awesome! 🌟'
    : current > 0
      ? 'Play a game to keep your streak alive!'
      : 'Earn a star today to start a streak!';

  return (
    <div className={`streak-banner${playedToday ? ' streak-banner-active' : ''}${empty ? ' streak-banner-empty' : ''}`}>
      <span className="streak-flame" aria-hidden="true">🔥</span>
      <span className="streak-main">
        <span className="streak-count">
          {current}
          <span className="streak-count-label"> day{current === 1 ? '' : 's'}</span>
        </span>
        <span className="streak-message">{message}</span>
      </span>
      {longest > 0 && (
        <span className="streak-best" title="Longest streak">🏆 Best {longest}</span>
      )}
    </div>
  );
}
