import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllScores, clearScores } from '../utils/scoreManager'
import StarRating from './StarRating'

const GAMES = [
  { key: 'times-tables', name: 'Times Tables', emoji: '✖️', path: '/times-tables' },
  { key: 'color-match', name: 'Color Match', emoji: '🎨', path: '/color-match' },
  { key: 'shape-match', name: 'Shape Match', emoji: '🔷', path: '/shape-match' },
  { key: 'counting', name: 'Counting Game', emoji: '🔢', path: '/counting' },
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
          const s = scores[g.key];
          const pct = s ? Math.round((s.score / s.total) * 100) : 0;
          return (
            <div key={g.key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 40 }}>{g.emoji}</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>{g.name}</h3>
                {s ? (
                  <>
                    <div style={{ background: '#eee', borderRadius: 50, height: 12, marginBottom: 8 }}>
                      <div style={{ background: '#4ECDC4', width: `${pct}%`, height: '100%', borderRadius: 50, transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{s.score}/{s.total} ({pct}%)</p>
                    <StarRating score={s.score} total={s.total} />
                  </>
                ) : (
                  <p style={{ margin: 0, color: '#aaa' }}>Not played yet</p>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => navigate(g.path)} style={{ fontSize: 16, padding: '10px 20px' }}>
                Play ▶
              </button>
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
