import React, { useEffect, useRef } from 'react'
import '../styles/AdBanner.css'

export default function AdBanner() {
  const adRef = useRef(false);

  useEffect(() => {
    if (!adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      } catch (e) {
        console.log('AdSense not loaded yet');
      }
    }
  }, []);

  return (
    <div className="ad-banner">
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-0876677807197566"
        data-ad-format="auto"
        data-full-width-responsive="true">
      </ins>
    </div>
  );
}