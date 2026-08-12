import React from 'react';

/**
 * Real vector shapes instead of emoji.
 *
 * The old game used characters like ⬟ and ⬢ for Pentagon/Hexagon — those are
 * text glyphs, not emoji, so on Windows and most Android builds they rendered
 * as a blank box or a plain black outline and the child was asked to identify
 * an invisible shape. Drawing them ourselves means every shape looks the same
 * on every device.
 */

function polygonPoints(sides, cx, cy, r, rotation = -90) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = ((rotation + (360 / sides) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

function starPoints(cx, cy, outer, inner, points = 5) {
  const coords = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = ((-90 + (180 / points) * i) * Math.PI) / 180;
    coords.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return coords.join(' ');
}

const DRAW = {
  Circle: (f) => <circle cx="50" cy="50" r="38" fill={f} />,
  Square: (f) => <rect x="14" y="14" width="72" height="72" rx="6" fill={f} />,
  Rectangle: (f) => <rect x="6" y="26" width="88" height="48" rx="6" fill={f} />,
  Triangle: (f) => <polygon points={polygonPoints(3, 50, 54, 42)} fill={f} />,
  Star: (f) => <polygon points={starPoints(50, 50, 44, 18)} fill={f} />,
  Heart: (f) => (
    <path
      d="M50 88 C 18 66 6 46 6 32 A 22 22 0 0 1 50 24 A 22 22 0 0 1 94 32 C 94 46 82 66 50 88 Z"
      fill={f}
    />
  ),
  Diamond: (f) => <polygon points="50,8 90,50 50,92 10,50" fill={f} />,
  Pentagon: (f) => <polygon points={polygonPoints(5, 50, 52, 42)} fill={f} />,
  Hexagon: (f) => <polygon points={polygonPoints(6, 50, 50, 42, 0)} fill={f} />,
  Octagon: (f) => <polygon points={polygonPoints(8, 50, 50, 42, 22.5)} fill={f} />,
  Oval: (f) => <ellipse cx="50" cy="50" rx="44" ry="28" fill={f} />,
  Crescent: (f) => (
    <path d="M64 8 A 44 44 0 1 0 64 92 A 34 34 0 1 1 64 8 Z" fill={f} />
  ),
};

export const SHAPE_NAMES = Object.keys(DRAW);

export default function ShapeGlyph({ name, color = '#FFD54F', size = 150 }) {
  const draw = DRAW[name];
  if (!draw) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={name}
      style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))' }}
    >
      {draw(color)}
    </svg>
  );
}
