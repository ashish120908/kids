import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        🎓 KidLearn
      </div>
      <div className="navbar-links">
        <Link to="/">🏠 Home</Link>
        <Link to="/progress">⭐ Progress</Link>
        <Link to="/about">👋 About</Link>
      </div>
    </nav>
  );
}
