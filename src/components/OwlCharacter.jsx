import React, { useId } from 'react';

export default function OwlCharacter() {
  // Unique per instance: the owl appears in both the layout and the level
  // picker, and duplicate SVG ids are invalid.
  const uid = useId().replace(/:/g, "");
  const gid = (name) => `${name}-${uid}`;

  return (
    <div className="owl-character-wrapper">
      <svg width="100" height="100" viewBox="0 0 100 100" className="owl-character-svg">
        <defs>
          {/* Owl Body Gradient */}
          <radialGradient id={gid("owlBodyGrad")} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C07000" />
            <stop offset="60%" stopColor="#7E4200" />
            <stop offset="100%" stopColor="#4D2600" />
          </radialGradient>

          {/* Owl Belly Gradient */}
          <radialGradient id={gid("owlBellyGrad")} cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFEAA7" />
            <stop offset="100%" stopColor="#DFE6E9" />
          </radialGradient>

          {/* Eye Gradient */}
          <radialGradient id={gid("owlEyeGrad")} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#FFEAA7" />
            <stop offset="100%" stopColor="#B2BEC3" />
          </radialGradient>

          {/* Pupil Gradient */}
          <radialGradient id={gid("owlPupilGrad")} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2D3436" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Chalkboard Frame Gradient */}
          <linearGradient id={gid("boardFrame")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E17055" />
            <stop offset="100%" stopColor="#D63031" />
          </linearGradient>

          {/* Chalkboard Slate */}
          <linearGradient id={gid("boardSlate")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006266" />
            <stop offset="100%" stopColor="#1B1464" />
          </linearGradient>
        </defs>

        {/* Ear Tufts */}
        <polygon points="28,25 18,5 38,18" fill="#7E4200" />
        <polygon points="72,25 82,5 62,18" fill="#7E4200" />

        {/* Owl Main Head & Body */}
        <ellipse cx="50" cy="52" rx="38" ry="40" fill={`url(#${gid("owlBodyGrad")})`} />

        {/* Owl Fluffy Belly */}
        <ellipse cx="50" cy="64" rx="24" ry="22" fill={`url(#${gid("owlBellyGrad")})`} />

        {/* Big 3D Cartoon Eyes (Outer Rim) */}
        <circle cx="36" cy="40" r="16" fill="#5A2E00" />
        <circle cx="64" cy="40" r="16" fill="#5A2E00" />

        {/* Eye White Base */}
        <circle cx="36" cy="40" r="14" fill={`url(#${gid("owlEyeGrad")})`} />
        <circle cx="64" cy="40" r="14" fill={`url(#${gid("owlEyeGrad")})`} />

        {/* Pupils */}
        <circle cx="38" cy="40" r="8" fill={`url(#${gid("owlPupilGrad")})`} />
        <circle cx="62" cy="40" r="8" fill={`url(#${gid("owlPupilGrad")})`} />

        {/* Eye Catchlight Highlights */}
        <circle cx="35" cy="37" r="3" fill="#ffffff" />
        <circle cx="59" cy="37" r="3" fill="#ffffff" />

        {/* Cute Beak */}
        <polygon points="50,46 44,54 56,54" fill="#E67E22" />

        {/* Mini Chalkboard held by Owl */}
        <rect x="22" y="62" width="56" height="32" rx="6" fill={`url(#${gid("boardFrame")})`} />
        <rect x="26" y="65" width="48" height="26" rx="4" fill={`url(#${gid("boardSlate")})`} />

        {/* Chalk Scribble on Board */}
        <path d="M 32 75 L 42 75 M 48 72 L 64 82" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

        {/* Wings Holding the Board */}
        <path d="M 12 50 Q 24 64 26 72 Q 18 70 12 50 Z" fill="#4D2600" />
        <path d="M 88 50 Q 76 64 74 72 Q 82 70 88 50 Z" fill="#4D2600" />
      </svg>
    </div>
  );
}
