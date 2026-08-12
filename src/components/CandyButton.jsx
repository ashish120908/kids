import React from 'react';

const TAG_COLORS = ['#4CD964', '#00B0FF', '#FFB300', '#FF5252', '#E040FB', '#00E5FF', '#FF7043', '#69F0AE'];
const GRADIENTS = ['url(#candyGreen)', 'url(#candyBlue)', 'url(#candyYellow)', 'url(#candyRed)'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Font size has to shrink as labels get longer, otherwise answers like
 * "MAROON", "12:45" or a five-digit sum overflow the candy and get clipped.
 */
function fontSizeFor(text) {
  const len = String(text).length;
  if (len <= 2) return 34;
  if (len === 3) return 30;
  if (len === 4) return 25;
  if (len === 5) return 21;
  if (len === 6) return 18;
  return 15;
}

export default function CandyButton({ value, index, status, onClick, disabled = false }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const isSelected = status === 'correct' || status === 'wrong';
  const label = String(value);

  return (
    <button
      type="button"
      className={`candy-wrapper-item ${isSelected ? `candy-animated-${status}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Answer ${label}`}
      aria-pressed={isSelected}
    >
      <span className="candy-letter-tag" style={{ color: TAG_COLORS[index % TAG_COLORS.length] }}>
        {LETTERS[index % LETTERS.length]}
      </span>

      <svg width="120" height="90" viewBox="0 0 120 90" className="candy-svg-btn" aria-hidden="true">
        <defs>
          <radialGradient id="candyGreen" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A3FF52" />
            <stop offset="50%" stopColor="#4CD964" />
            <stop offset="100%" stopColor="#1E8233" />
          </radialGradient>

          <radialGradient id="candyBlue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#70E4FF" />
            <stop offset="50%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#0051B5" />
          </radialGradient>

          <radialGradient id="candyYellow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#C66900" />
          </radialGradient>

          <radialGradient id="candyRed" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF8585" />
            <stop offset="50%" stopColor="#FF5252" />
            <stop offset="100%" stopColor="#B3001B" />
          </radialGradient>

          <linearGradient id="wrapperShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Left wrapper wing */}
        <polygon points="25,45 5,20 2,45 5,70" fill={gradient} />
        <polygon points="25,45 5,20 2,45 5,70" fill="url(#wrapperShade)" />

        {/* Right wrapper wing */}
        <polygon points="95,45 115,20 118,45 115,70" fill={gradient} />
        <polygon points="95,45 115,20 118,45 115,70" fill="url(#wrapperShade)" />

        {/* Glossy centre */}
        <ellipse cx="60" cy="45" rx="38" ry="32" fill={gradient} filter="drop-shadow(0px 8px 10px rgba(0,0,0,0.4))" />

        {/* Highlight */}
        <path d="M 38 26 Q 60 18 82 26 Q 60 22 38 26 Z" fill="#ffffff" opacity="0.6" />

        <text
          x="60"
          y="45"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={fontSizeFor(label)}
          fontFamily="Fredoka One, cursive"
          fontWeight="bold"
          filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.5))"
        >
          {label}
        </text>
      </svg>
    </button>
  );
}
