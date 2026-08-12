import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllScores, clearScores, getTotalStars } from '../utils/scoreManager'
import { getStreak } from '../utils/streakManager'
import '../styles/ProgressDashboard.css'

const GAMES = [
  { key: 'times-tables', name: 'Times Tables', emoji: '✖️', path: '/times-tables' },
  { key: 'counting', name: 'Counting Game', emoji: '🔢', path: '/counting' },
  { key: 'addition', name: 'Addition Game', emoji: '➕', path: '/addition' },
  { key: 'subtraction', name: 'Subtraction Game', emoji: '➖', path: '/subtraction' },
  { key: 'division', name: 'Division Game', emoji: '➗', path: '/division' },
  { key: 'compare', name: 'Compare Numbers', emoji: '⚖️', path: '/compare' },
  { key: 'clock', name: 'Clock Reading', emoji: '🕐', path: '/clock' },
  { key: 'alphabet', name: 'Alphabet Match', emoji: '🔤', path: '/alphabet' },
  { key: 'spelling', name: 'Spelling Bee', emoji: '🐝', path: '/spelling' },
  { key: 'rhyming', name: 'Rhyming Game', emoji: '🎵', path: '/rhyming' },
  { key: 'english-speaking', name: 'English Speaking', emoji: '🗣️', path: '/english-speaking' },
  { key: 'color-match', name: 'Color Match', emoji: '🎨', path: '/color-match' },
  { key: 'shape-match', name: 'Shape Match', emoji: '🔷', path: '/shape-match' },
  { key: 'memory', name: 'Memory Flip', emoji: '🃏', path: '/memory' },
  { key: 'pattern', name: 'Pattern Game', emoji: '🔁', path: '/pattern' },
];

/**
 * This screen was 16 blocks of inline styles left over from the original light
 * theme — grey #666 body text and #eee level chips sitting on the dark space
 * background, so most of it was unreadable. Rewritten with real classes on the
 * app's theme, and it now leads with the totals a parent actually wants.
 */
export default function ProgressDashboard() {
  const navigate = useNavigate();
  const [scores, setScores] = React.useState(getAllScores);
  const [confirming, setConfirming] = React.useState(false);

  const totalStars = getTotalStars();
  const streak = getStreak();
  const gamesStarted = GAMES.filter((g) => Object.keys(scores[g.key] || {}).length > 0).length;
  const levelsCleared = GAMES.reduce(
    (sum, g) => sum + Object.keys(scores[g.key] || {}).length, 0
  );

  const handleClear = () => {
    clearScores();
    setScores(getAllScores());
    setConfirming(false);
  };

  return (
    <div className="progress-page">
      <h1 className="progress-title">My Progress 📊</h1>

      <div className="progress-summary">
        <div className="progress-stat">
          <span className="progress-stat-value">{totalStars}</span>
          <span className="progress-stat-label">⭐ Stars earned</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{levelsCleared}</span>
          <span className="progress-stat-label">🏁 Levels cleared</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{gamesStarted}/{GAMES.length}</span>
          <span className="progress-stat-label">🎮 Games tried</span>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-value">{streak.current}</span>
          <span className="progress-stat-label">🔥 Day streak</span>
        </div>
      </div>

      {levelsCleared === 0 && (
        <p className="progress-empty">
          Nothing here yet — play any game below and your stars will show up.
        </p>
      )}

      <div className="progress-list">
        {GAMES.map((g) => {
          const gameLevels = scores[g.key] || {};
          const completedLevels = Object.keys(gameLevels).length;
          const starsHere = Object.values(gameLevels).reduce((s, v) => s + (v.stars || 0), 0);

          return (
            <section key={g.key} className="progress-card">
              <div className="progress-card-head">
                <span className="progress-card-emoji" aria-hidden="true">{g.emoji}</span>
                <div className="progress-card-meta">
                  <h2 className="progress-card-title">{g.name}</h2>
                  <p className="progress-card-sub">
                    {completedLevels > 0
                      ? `${completedLevels} level${completedLevels === 1 ? '' : 's'} · ${starsHere} star${starsHere === 1 ? '' : 's'}`
                      : 'Not played yet'}
                  </p>
                </div>
                <button className="progress-play-btn" onClick={() => navigate(g.path)}>
                  Play ▶
                </button>
              </div>

              <ol className="progress-levels" aria-label={`${g.name} levels`}>
                {Array.from({ length: Math.max(10, completedLevels + 1) }, (_, i) => {
                  const lvl = i + 1;
                  const s = gameLevels[lvl];
                  return (
                    <li
                      key={lvl}
                      className={`progress-level${s ? ' progress-level-done' : ''}`}
                      style={s ? { background: `hsl(${(lvl * 28) % 360}, 65%, 42%)` } : undefined}
                      title={s ? `Level ${lvl}: ${s.score}/${s.total}` : `Level ${lvl}: not played`}
                      aria-label={s
                        ? `Level ${lvl}, scored ${s.score} out of ${s.total}, ${s.stars} stars`
                        : `Level ${lvl}, not played`}
                    >
                      <span className="progress-level-num">{lvl}</span>
                      {s && s.stars > 0 && (
                        <span className="progress-level-stars">{'⭐'.repeat(s.stars)}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="progress-actions">
        {/* window.confirm is blocked in some embedded browsers and looks alien
            on mobile, so the confirmation is inline. */}
        {confirming ? (
          <div className="progress-confirm" role="alertdialog" aria-label="Confirm clearing scores">
            <p>Clear every star and level for all games? This can’t be undone.</p>
            <div className="progress-confirm-actions">
              <button className="progress-btn-danger" onClick={handleClear}>Yes, clear it all</button>
              <button className="progress-btn-quiet" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="progress-btn-danger" onClick={() => setConfirming(true)}>
            🗑️ Clear All Scores
          </button>
        )}
      </div>
    </div>
  );
}
