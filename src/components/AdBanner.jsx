import React from 'react'
import '../styles/AdBanner.css'

// Replace the placeholder div below with your Google AdSense <ins> tag.
// Example AdSense snippet:
// <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
//      data-ad-slot="XXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>
// Then add the AdSense script to index.html.

export default function AdBanner() {
  return (
    <div className="ad-banner">
      <span className="ad-label">Advertisement</span>
      {/* Replace this div with real AdSense code */}
      <div className="ad-placeholder">Ad Space (728×90)</div>
    </div>
  );
}
