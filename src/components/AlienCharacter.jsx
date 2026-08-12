import React from 'react';

export default function AlienCharacter() {
  return (
    <div className="alien-character-wrapper">
      <svg width="80" height="80" viewBox="0 0 80 80" className="alien-character-svg">
        <defs>
          <radialGradient id="alienBodyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#80E5FF" />
            <stop offset="60%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#0051B5" />
          </radialGradient>

          <radialGradient id="alienEyeGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#E0F7FA" />
          </radialGradient>
        </defs>

        {/* Antennas */}
        <line x1="28" y1="25" x2="20" y2="10" stroke="#00B0FF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="9" r="5" fill="#00E676" filter="drop-shadow(0px 0px 6px #00E676)" />

        <line x1="52" y1="25" x2="60" y2="10" stroke="#00B0FF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="9" r="5" fill="#00E676" filter="drop-shadow(0px 0px 6px #00E676)" />

        {/* Body */}
        <ellipse cx="40" cy="48" rx="28" ry="26" fill="url(#alienBodyGrad)" filter="drop-shadow(0px 6px 12px rgba(0,0,0,0.5))" />

        {/* Big Friendly Eyes */}
        <circle cx="30" cy="42" r="10" fill="url(#alienEyeGrad)" />
        <circle cx="50" cy="42" r="10" fill="url(#alienEyeGrad)" />

        <circle cx="30" cy="42" r="5" fill="#002171" />
        <circle cx="50" cy="42" r="5" fill="#002171" />

        <circle cx="28" cy="40" r="2" fill="#ffffff" />
        <circle cx="48" cy="40" r="2" fill="#ffffff" />

        {/* Happy Smile */}
        <path d="M 32 54 Q 40 62 48 54" stroke="#002171" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Waving Arm */}
        <path d="M 14 48 Q 4 36 8 28" stroke="#00B0FF" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="27" r="4" fill="#80E5FF" />
      </svg>
    </div>
  );
}
