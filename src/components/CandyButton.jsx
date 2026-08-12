import React, { useId } from 'react';

const TAG_COLORS = ['#4CD964', '#00B0FF', '#FFB300', '#FF5252', '#E040FB', '#00E5FF', '#FF7043', '#69F0AE'];
const GRADIENT_NAMES = ['candyGreen', 'candyBlue', 'candyYellow', 'candyRed'];
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
  // Every instance used to declare the SAME gradient ids, so a screen with six
  // answer buttons had 24 duplicate DOM ids. Browsers resolve to whichever
  // comes first, which happens to look right but is invalid and fragile.
  const uid = useId().replace(/:/g, '');
  const gid = (name) => `${name}-${uid}`;
  const gradient = `url(#${gid(GRADIENT_NAMES[index % GRADIENT_NAMES.length])})`;
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
          <radialGradient id={gid("candyGreen")} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A3FF52" />
            <stop offset="50%" stopColor="#4CD964" />
            <stop offset="100%" stopColor="#1E8233" />
          </radialGradient>

          <radialGradient id={gid("candyBlue")} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#70E4FF" />
            <stop offset="50%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#0051B5" />
          </radialGradient>

          <radialGradient id={gid("candyYellow")} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#C66900" />
          </radialGradient>

          <radialGradient id={gid("candyRed")} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF8585" />
            <stop offset="50%" stopColor="#FF5252" />
            <stop offset="100%" stopColor="#B3001B" />
          </radialGradient>

          <linearGradient id={gid("wrapperShade")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Left wrapper wing */}
        <polygon points="25,45 5,20 2,45 5,70" fill={gradient} />
        <polygon points="25,45 5,20 2,45 5,70" fill={`url(#${gid("wrapperShade")})`} />

        {/* Right wrapper wing */}
        <polygon points="95,45 115,20 118,45 115,70" fill={gradient} />
        <polygon points="95,45 115,20 118,45 115,70" fill={`url(#${gid("wrapperShade")})`} />

        {/* Glossy centre */}
        <ellipse cx="60" cy="45" rx="38" ry="32" fill={gradient} />

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
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="3"
          paintOrder="stroke"
        >
          {label}
        </text>
      </svg>
    </button>
  );
}
