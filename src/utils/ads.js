/**
 * AdSense configuration — one place for the publisher ID and every ad slot.
 *
 * Slot IDs come from your AdSense account: Ads → By ad unit → Display ads →
 * create a unit → copy the `data-ad-slot` value out of the generated code.
 * Set them as environment variables (Vercel → Project → Settings →
 * Environment Variables) so they are not baked into the repository:
 *
 *   VITE_ADSENSE_SLOT_HOME
 *   VITE_ADSENSE_SLOT_RESULTS
 *   VITE_ADSENSE_SLOT_INGAME
 *
 * An <ins> without a data-ad-slot cannot fill for a standard AdSense display
 * unit — the slot ID is what identifies the unit. The previous AdBanner omitted
 * it, so both of its placements were dead. Any slot left unset here renders
 * nothing at all rather than an empty ad container.
 */

export const AD_CLIENT = 'ca-pub-0876677807197566';

export const AD_SLOTS = {
  home: import.meta.env?.VITE_ADSENSE_SLOT_HOME || '',
  results: import.meta.env?.VITE_ADSENSE_SLOT_RESULTS || '',
  inGame: import.meta.env?.VITE_ADSENSE_SLOT_INGAME || '',
};

/**
 * KidLearn is aimed at 4–10 year olds, so ads must not be interest-based.
 *
 * Note on what this does and does not cover: the authoritative, site-wide
 * child-directed designation is made through Search Console, not from page
 * code (see ADSENSE.md). This flag is the code-level protection that turns off
 * personalised/interest-based ads for requests from this page. Keep both.
 */
export const NON_PERSONALIZED_ADS = true;

let configured = false;

/** Applies the account-wide ad settings exactly once per page load. */
export function configureAds() {
  if (configured || typeof window === 'undefined') return;
  configured = true;
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    if (NON_PERSONALIZED_ADS) {
      window.adsbygoogle.requestNonPersonalizedAds = 1;
    }
  } catch { /* the AdSense script is blocked or not loaded; ads simply won't show */ }
}
