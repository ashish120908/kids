import React, { useEffect, useRef } from 'react'
import { AD_CLIENT, AD_SLOTS, configureAds } from '../utils/ads'
import '../styles/AdBanner.css'

/**
 * A single AdSense display unit.
 *
 * Renders nothing unless a slot ID is configured. An <ins> with no
 * data-ad-slot can never fill, so the old version left an empty ad container
 * on the page — which looks broken and, next to real ads, is the kind of empty
 * placeholder worth avoiding.
 */
export default function AdBanner({ slot = 'home', label = 'Advertisement', className = '' }) {
  const insRef = useRef(null);
  const pushed = useRef(false);
  const slotId = AD_SLOTS[slot] || '';

  useEffect(() => {
    if (!slotId || pushed.current) return;
    // In React StrictMode the effect runs twice in development; pushing the
    // same <ins> twice makes AdSense throw "All ins elements already have ads".
    pushed.current = true;
    configureAds();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* script blocked or offline — nothing to do */ }
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div className={`ad-banner ${className}`.trim()}>
      {/* Labelling paid space is required by AdSense policy and matters more
          here than usual: children can't be expected to tell an advert from
          part of the game. */}
      <span className="ad-banner-label">{label}</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
