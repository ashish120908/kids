import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllScores } from '../utils/scoreManager'

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🦄', '🐲', '🦋', '🦖']

const GAMES = [
  { key: 'times-tables', name: 'Times Tables', emoji: '✖️' },
  { key: 'color-match', name: 'Color Match', emoji: '🎨' },
  { key: 'shape-match', name: 'Shape Match', emoji: '🔷' },
  { key: 'counting', name: 'Counting Game', emoji: '🔢' },
  { key: 'alphabet', name: 'Alphabet Match', emoji: '🔤' },
  { key: 'spelling', name: 'Spelling Bee', emoji: '🐝' },
  { key: 'addition', name: 'Addition Game', emoji: '➕' },
  { key: 'subtraction', name: 'Subtraction Game', emoji: '➖' },
  { key: 'memory', name: 'Memory Flip', emoji: '🃏' },
  { key: 'division', name: 'Division Game', emoji: '➗' },
  { key: 'rhyming', name: 'Rhyming Game', emoji: '🎵' },
  { key: 'clock', name: 'Clock Reading', emoji: '🕐' },
  { key: 'pattern', name: 'Pattern Game', emoji: '🔁' },
  { key: 'compare', name: 'Compare Numbers', emoji: '⚖️' },
]

const PROFILE_KEY = 'kidlearn_profile'

export function getProfile() {
  try {
    const val = localStorage.getItem(PROFILE_KEY)
    return val ? JSON.parse(val) : { name: '', avatar: '🦄' }
  } catch {
    return { name: '', avatar: '🦄' }
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export default function KidsProfile() {
  const [profile, setProfile] = useState(getProfile)
  const [editName, setEditName] = useState(profile.name)
  const [saved, setSaved] = useState(false)

  const scores = getAllScores()

  const totalStars = GAMES.reduce((sum, g) => {
    const levels = scores[g.key] || {}
    return sum + Object.values(levels).reduce((s, l) => s + (l.stars || 0), 0)
  }, 0)

  const gamesPlayed = GAMES.filter(g => Object.keys(scores[g.key] || {}).length > 0).length

  const totalLevels = GAMES.reduce((sum, g) => {
    return sum + Object.keys(scores[g.key] || {}).length
  }, 0)

  const handleSave = () => {
    const updated = { ...profile, name: editName.trim() || 'Superstar' }
    setProfile(updated)
    saveProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAvatar = (avatar) => {
    const updated = { ...profile, avatar, name: editName.trim() || profile.name }
    setProfile(updated)
    saveProfile(updated)
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar-display">{profile.avatar}</div>
        <h1 className="profile-title">{profile.name || 'My Profile'} 👤</h1>
        <p className="profile-subtitle">Your learning journey</p>
      </div>

      <div className="profile-card-wrapper">
        {/* Edit Profile Card */}
        <div className="profile-card">
          <h2 className="profile-section-title">✏️ Edit Profile</h2>

          <div className="profile-name-section">
            <label className="profile-label">Your Name</label>
            <div className="profile-name-row">
              <input
                className="profile-name-input"
                type="text"
                maxLength={20}
                placeholder="Enter your name…"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button className="btn btn-primary profile-save-btn" onClick={handleSave}>
                {saved ? '✅ Saved!' : '💾 Save'}
              </button>
            </div>
          </div>

          <div className="profile-avatar-section">
            <label className="profile-label">Choose Your Avatar</label>
            <div className="profile-avatar-grid">
              {AVATARS.map(av => (
                <button
                  key={av}
                  className={`profile-avatar-btn${profile.avatar === av ? ' profile-avatar-selected' : ''}`}
                  onClick={() => handleAvatar(av)}
                  title={av}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="profile-stats-card">
          <h2 className="profile-section-title">🏆 My Achievements</h2>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <span className="profile-stat-icon">⭐</span>
              <span className="profile-stat-number">{totalStars}</span>
              <span className="profile-stat-label">Total Stars</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-icon">🎮</span>
              <span className="profile-stat-number">{gamesPlayed}</span>
              <span className="profile-stat-label">Games Played</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-icon">🏅</span>
              <span className="profile-stat-number">{totalLevels}</span>
              <span className="profile-stat-label">Levels Done</span>
            </div>
          </div>
        </div>

        {/* Game Progress Card */}
        <div className="profile-card">
          <h2 className="profile-section-title">📊 Game Progress</h2>
          <div className="profile-games-list">
            {GAMES.map(g => {
              const levels = scores[g.key] || {}
              const done = Object.keys(levels).length
              const stars = Object.values(levels).reduce((s, l) => s + (l.stars || 0), 0)
              return (
                <div key={g.key} className="profile-game-row">
                  <span className="profile-game-emoji">{g.emoji}</span>
                  <span className="profile-game-name">{g.name}</span>
                  <span className="profile-game-meta">
                    {done > 0 ? `${done}/10 lvls · ${'⭐'.repeat(Math.min(stars, 5))}` : 'Not played yet'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Back to Home */}
        <div className="profile-back">
          <Link to="/" className="btn-primary profile-home-btn">
            🏠 Back to Games
          </Link>
        </div>
      </div>
    </div>
  )
}
