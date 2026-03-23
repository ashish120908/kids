import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllScores, clearScores } from '../utils/scoreManager'

const GAMES = [
  { key: 'times-tables', name: 'Times Tables', emoji: '✖️', path: '/times-tables' },
  { key: 'color-match', name: 'Color Match', emoji: '🎨', path: '/color-match' },
  { key: 'shape-match', name: 'Shape Match', emoji: '🔷', path: '/shape-match' },
  { key: 'counting', name: 'Counting Game', emoji: '🔢', path: '/counting' },
  { key: 'alphabet', name: 'Alphabet Match', emoji: '🔤', path: '/alphabet' },
  { key: 'spelling', name: 'Spelling Bee', emoji: '🐝', path: '/spelling' },
  { key: 'addition', name: 'Addition Game', emoji: '➕', path: '/addition' },
  { key: 'memory', name: 'Memory Flip', emoji: '🃏', path: '/memory' },
];

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const [scores, setScores] = React.useState(getAllScores());

  const handleClear = () => {
    if (window.confirm('Clear all scores?')) {
      clearScores();
      setScores(getAllScores());
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ textAlign: 'center', color: 'white', fontSize: 40, marginBottom: 32 }}>
        My Progress 📊
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {GAMES.map(g => {
          const gameLevels = scores[g.key] || {};
          const completedLevels = Object.keys(gameLevels).length;
          const bestStars = completedLevels > 0
            ? Math.max(...Object.values(gameLevels).map(s => s.stars))
            : 0;
          return (
            <div key={g.key} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 40 }}>{g.emoji}</span>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 22 }}>{g.name}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                    {completedLevels > 0
                      ? `${completedLevels}/10 levels completed`
                      : 'Not played yet'}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(g.path)} style={{ fontSize: 16, padding: '10px 20px' }}>
                  Play ▶
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const lvl = i + 1;
                  const s = gameLevels[lvl];
                  return (
                    <div
                      key={lvl}
                      title={s ? `Level ${lvl}: ${s.score}/${s.total}` : `Level ${lvl}: not played`}
                      style={{
                        width: 36, height: 36,
                        borderRadius: 8,
                        background: s ? `hsl(${lvl * 28}, 70%, 60%)` : '#eee',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13,
                        fontFamily: "'Fredoka One', cursive",
                        color: s ? 'white' : '#bbb',
                        boxShadow: s ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <span style={{ fontSize: 11, lineHeight: 1 }}>{lvl}</span>
                      {s && s.stars > 0 && (
                        <span style={{ fontSize: 9, lineHeight: 1 }}>{'⭐'.repeat(s.stars)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button className="btn btn-danger" onClick={handleClear} style={{ fontSize: 16 }}>
          🗑️ Clear All Scores
        </button>
      </div>
    </div>
  );
}
