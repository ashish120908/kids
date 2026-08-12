import React from 'react';

const CANDY_THEMES = [
  { letter: 'A', fillGrad: 'url(#candyGreen)', textColor: '#ffffff' },
  { letter: 'B', fillGrad: 'url(#candyBlue)', textColor: '#ffffff' },
  { letter: 'C', fillGrad: 'url(#candyYellow)', textColor: '#ffffff' },
  { letter: 'D', fillGrad: 'url(#candyRed)', textColor: '#ffffff' },
];

export default function CandyButton({ value, index, status, onClick }) {
  const theme = CANDY_THEMES[index % CANDY_THEMES.length];
  const isSelected = status === 'correct' || status === 'wrong';

  return (
    <div className={`candy-wrapper-item ${isSelected ? `candy-animated-${status}` : ''}`} onClick={onClick}>
      <span className="candy-letter-tag" style={{ color: index === 0 ? '#4CD964' : index === 1 ? '#00B0FF' : index === 2 ? '#FFB300' : '#FF5252' }}>
        {theme.letter}
      </span>

      <svg width="120" height="90" viewBox="0 0 120 90" className="candy-svg-btn">
        <defs>
          {/* Green Candy Gradient */}
          <radialGradient id="candyGreen" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A3FF52" />
            <stop offset="50%" stopColor="#4CD964" />
            <stop offset="100%" stopColor="#1E8233" />
          </radialGradient>

          {/* Blue Candy Gradient */}
          <radialGradient id="candyBlue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#70E4FF" />
            <stop offset="50%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#0051B5" />
          </radialGradient>

          {/* Yellow Candy Gradient */}
          <radialGradient id="candyYellow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#C66900" />
          </radialGradient>

          {/* Red Candy Gradient */}
          <radialGradient id="candyRed" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF8585" />
            <stop offset="50%" stopColor="#FF5252" />
            <stop offset="100%" stopColor="#B3001B" />
          </radialGradient>

          {/* Candy Wrapper End Texture */}
          <linearGradient id="wrapperShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Left Candy Wrapper Wing */}
        <polygon points="25,45 5,20 2,45 5,70" fill={theme.fillGrad} />
        <polygon points="25,45 5,20 2,45 5,70" fill="url(#wrapperShade)" />

        {/* Right Candy Wrapper Wing */}
        <polygon points="95,45 115,20 118,45 115,70" fill={theme.fillGrad} />
        <polygon points="95,45 115,20 118,45 115,70" fill="url(#wrapperShade)" />

        {/* Center 3D Glossy Oval */}
        <ellipse cx="60" cy="45" rx="38" ry="32" fill={theme.fillGrad} filter="drop-shadow(0px 8px 10px rgba(0,0,0,0.4))" />

        {/* Top Gloss Highlight */}
        <path d="M 38 26 Q 60 18 82 26 Q 60 22 38 26 Z" fill="#ffffff" opacity="0.6" />

        {/* Number Text */}
        <text x="60" y="55" textAnchor="middle" fill="#ffffff" fontSize="32" fontFamily="Fredoka One, cursive" fontWeight="bold" filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.5))">
          {value}
        </text>
      </svg>
    </div>
  );
}
