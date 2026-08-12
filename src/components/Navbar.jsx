import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isMuted, toggleMute } from '../utils/soundManager'
import { getTotalStars } from '../utils/scoreManager'

export default function Navbar() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [muted, setMuted] = useState(isMuted());
  const [stars, setStars] = useState(getTotalStars());

  useEffect(() => {
    const interval = setInterval(() => {
      setStars(getTotalStars());
    }, 1500);

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installedHandler = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleMuteToggle = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        🎓 KidLearn
      </div>
      <div className="navbar-links">
        <Link to="/">🏠 Home</Link>
        <Link to="/addition" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C06FF8)', color: '#fff', border: '1px solid #fff' }}>🎮 Demo</Link>
        <Link to="/articles">📚 Learning Corner</Link>
        <Link to="/profile">👤 Profile</Link>
        <Link to="/progress">
          ⭐ Progress <span className="star-pill" style={{ background: '#ffd700', color: '#333', padding: '2px 8px', borderRadius: 999, fontWeight: 900, fontSize: 13, marginLeft: 4 }}>{stars}</span>
        </Link>

        <button
          className="navbar-install-btn"
          onClick={handleMuteToggle}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          style={{ fontSize: 18, padding: '4px 10px' }}
        >
          {muted ? '🔇 Muted' : '🔊 Sound'}
        </button>
        {installPrompt && (
          <button className="navbar-install-btn" onClick={handleInstall}>
            📲 Install App
          </button>
        )}
      </div>
    </nav>
  )
}

