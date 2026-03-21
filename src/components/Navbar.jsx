import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installedHandler = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
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

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        🎓 KidLearn
      </div>
      <div className="navbar-links">
        <Link to="/">🏠 Home</Link>
        <Link to="/progress">⭐ Progress</Link>
        {installPrompt && (
          <button className="navbar-install-btn" onClick={handleInstall}>
            📲 Install App
          </button>
        )}
      </div>
    </nav>
  );
}
