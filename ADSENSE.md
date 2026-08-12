# AdSense setup

What's in the code, and the three things only you can do from your own accounts.

---

## What the code does now

| Piece | File | Status |
|---|---|---|
| Site verification meta | `index.html` | ✅ |
| Auto ads script | `index.html` | ✅ |
| `ads.txt` | `public/ads.txt` | ✅ correct format, correct Google TAG ID |
| Publisher ID + slot config | `src/utils/ads.js` | ✅ one place |
| Display units | `src/components/AdBanner.jsx` | ⏳ needs your slot IDs |
| Non-personalised ads | `src/utils/ads.js` | ✅ on |

Three placements: **home page**, **score summary**, **in-game**.

Each renders **nothing at all** until its slot ID is set. That's deliberate — an
`<ins>` without a `data-ad-slot` cannot fill for a standard display unit, so
the old code left empty ad containers on the page. Better to show nothing.

---

## 1. Create three ad units and set the slot IDs

In AdSense: **Ads → By ad unit → Display ads**. Create three units, then copy the
`data-ad-slot` value out of each generated snippet (a ~10-digit number).

Set them as environment variables rather than editing code — that way the IDs
aren't in the repo and you can differ between preview and production:

**Vercel → your project → Settings → Environment Variables**

| Variable | Placement |
|---|---|
| `VITE_ADSENSE_SLOT_HOME` | Bottom of the home page |
| `VITE_ADSENSE_SLOT_RESULTS` | Score summary, after a round |
| `VITE_ADSENSE_SLOT_INGAME` | Bottom bar during a game |

Redeploy after setting them — Vite inlines `VITE_*` variables at build time, so
changing them does not affect an existing deployment.

For local testing, create `.env` in the project root (already gitignored):

```
VITE_ADSENSE_SLOT_HOME=1234567890
VITE_ADSENSE_SLOT_RESULTS=1234567891
VITE_ADSENSE_SLOT_INGAME=1234567892
```

---

## 2. Tag the site as child-directed — do this one

KidLearn is aimed at 4–10 year olds, which makes it child-directed content
under COPPA. Google's documentation is explicit that the site-level
designation is made **through Search Console**, not from page code and not from
the AdSense interface. Google's stated effect: *"If you tag your site for
treatment as age restricted, we will take steps to disable interest-based
advertising and remarketing ads for that content."*

The code sets non-personalised ads (`requestNonPersonalizedAds = 1`), which is
the page-level protection, but **that is not a substitute for the site-level
designation.** Do both.

Worth knowing: Google is mid-migration here. The old `tagForChildDirectedTreatment`
(TFCD) and `tagForUnderAgeOfConsent` (TFUA) request tags are being replaced by a
unified **Tag for Age Treatment (TFAT)** signal with `CHILD` / `TEEN` /
`UNSPECIFIED` values, documented as of May 2026. The request-level TFAT syntax
Google documents is for **GPT / Ad Manager**, not the plain `adsbygoogle` tag
this app uses — which is another reason the Search Console designation is the
one that matters for you today. If you later move to Ad Manager, add
`tagForAgeTreatment: 1`.

I am not able to advise on the legal side of COPPA compliance. Please confirm
the current requirements in your own AdSense account and, given this is a
children's product with real regulatory exposure, consider getting the
compliance question reviewed properly.

---

## 3. Check the in-game placement yourself

The in-game slot replaced a fake "PLAY GAMES! [AD]" button that was styled
exactly like the game's own purple call-to-action buttons and did nothing when
tapped. The replacement is a real unit, labelled "Advertisement", and styled to
look deliberately unlike anything interactive in the game.

Be aware of the residual risk regardless: an ad inside a game screen, played by
young children, is the placement most likely to generate accidental clicks —
and invalid traffic is the usual reason accounts get restricted. If in doubt,
leave `VITE_ADSENSE_SLOT_INGAME` unset. The placement then renders nothing and
the other two still earn.

---

## Verifying it works

```bash
npm run build
npm run preview
```

Then in the browser:

- **View source** → `ads.txt`, `robots.txt` and `sitemap.xml` all resolve at the
  site root. (Vercel gives the filesystem precedence over rewrites, so these are
  served directly — the explicit rewrites that used to be in `vercel.json` for
  them were no-ops and have been removed.)
- **Elements panel** → each `<ins class="adsbygoogle">` carries both
  `data-ad-client` and `data-ad-slot`.
- **Console** → no `adsbygoogle` errors. "All `ins` elements in the DOM with
  class adsbygoogle already have ads in them" means a unit was pushed twice;
  `AdBanner` guards against that in StrictMode.
- Ads generally do not fill on `localhost`. Test on the Vercel preview URL.
