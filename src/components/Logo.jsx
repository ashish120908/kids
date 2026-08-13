import React from 'react'
import '../styles/Logo.css'

/**
 * The KidLearn lockup.
 *
 * Two things the brand guide requires that are easy to get wrong:
 *
 * 1. The full-colour wordmark sets "Kid" in deep navy (#243B7A), which measures
 *    1.61:1 against this app's dark background — invisible. The dark variants
 *    recolour only the three wordmark letterforms to white and lighten the
 *    tagline. The owl itself is untouched, including its navy pupils, because
 *    the guide forbids recolouring the mark.
 *
 * 2. Minimum size for the horizontal lockup is 140px wide; below that the guide
 *    says to use the owl mark alone. Rather than let it shrink past that on a
 *    phone, both are rendered and CSS swaps them at the breakpoint.
 */
export default function Logo({ onDark = true, height = 40, className = '', showTagline = true }) {
  // Separate assets rather than cropping with CSS: the tagline sits beside the
  // owl, not below it, so clipping the box cut the owl's book off.
  const lockup = showTagline
    ? (onDark ? '/brand/logo-horizontal-dark.svg' : '/brand/logo-horizontal.svg')
    : (onDark ? '/brand/logo-horizontal-dark-notag.svg' : '/brand/logo-horizontal-notag.svg');

  return (
    <span className={`brand-logo ${className}`.trim()} style={{ '--logo-height': `${height}px` }}>
      <img
        className="brand-logo-lockup"
        src={lockup}
        alt="KidLearn"
        width="605"
        height="190"
        decoding="async"
      />
      {/* Shown instead of the lockup below the minimum width. aria-hidden on
          one of the two, so the name isn't announced twice. */}
      <img
        className="brand-logo-mark"
        src="/brand/logo-mark.svg"
        alt=""
        aria-hidden="true"
        width="120"
        height="120"
        decoding="async"
      />
    </span>
  );
}
