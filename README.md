# KidLearn 🎓

A fun, interactive learning app for kids featuring multiplication tables, color matching, shape identification, and counting games — built with React + Vite.

## Games
- **Times Tables** ✖️ — Practice multiplication (1–12 tables)
- **Color Match** 🎨 — Match color names to their visual colors
- **Shape Match** 🔷 — Identify circle, square, triangle, and more
- **Counting Game** 🔢 — Count emoji objects and choose the right number
- **Alphabet Match** 🔤 — Tap letters in A–Z order
- **Spelling Bee** 🐝 — Spell simple words with fun hints
- **Addition Game** ➕ — Solve simple addition questions
- **Subtraction Game** ➖ — Practice subtraction with fun questions
- **Memory Flip** 🃏 — Flip cards to find matching pairs
- **Progress Dashboard** 📊 — Track stars and scores across all games

## Run Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy on GitHub Pages

1. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. In `vite.config.js`, set `base` to your repo name:
   ```js
   base: '/your-repo-name/',
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```

## Deploy on Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import your repository.
3. Vercel auto-detects Vite — click **Deploy**.
4. For every future push to `main`, Vercel redeploys automatically.

## Add Google AdSense

1. Sign up at [Google AdSense](https://adsense.google.com) and get your Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
2. In `index.html`, replace the `<!-- AdSense script goes here -->` comment with:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
3. In `src/components/AdBanner.jsx`, replace the placeholder `<div>` with your AdSense `<ins>` tag:
   ```jsx
   <ins className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true" />
   ```
4. Add the push call in `AdBanner.jsx` inside a `useEffect`:
   ```jsx
   useEffect(() => {
     try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
   }, []);
   ```

## Convert to PWA

1. Install the Vite PWA plugin:
   ```bash
   npm install --save-dev vite-plugin-pwa
   ```
2. Update `vite.config.js`:
   ```js
   import { VitePWA } from 'vite-plugin-pwa'
   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'KidLearn',
           short_name: 'KidLearn',
           icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
           theme_color: '#667eea',
           background_color: '#667eea',
           display: 'standalone',
         }
       })
     ],
   })
   ```
3. Add icon files to the `public/` directory.
4. Run `npm run build` — a service worker is generated automatically.

## Google Analytics

This app uses **Google Analytics 4 (GA4)** to track visitor traffic and engagement.

- **Measurement ID**: `G-6272B66ETB`
- **COPPA-compliant configuration**: Personalized advertising and Google Signals are disabled, ensuring no personal data is collected from child users.
  - `restricted_data_processing: true`
  - `allow_google_signals: false`
  - `allow_ad_personalization_signals: false`
- **View analytics**: Sign in at [analytics.google.com](https://analytics.google.com) with your Google account to see real-time visitors, traffic sources, popular games, and more.

## COPPA Compliance Notes

This app is designed for children under 13. If you publish it publicly, consider the following:

- **No personal data collection**: The app only uses `localStorage` for game scores — no accounts, no names, no emails.
- **No behavioral advertising**: Do not use interest-based ad targeting. If using AdSense, enable [non-personalized ads](https://support.google.com/adsense/answer/9007336) for all users.
- **Privacy Policy**: Publish a clear privacy policy disclosing what data (if any) is collected. Even if no data is collected, a policy is recommended.
- **Parental consent**: If you ever add user accounts or collect any personal information from children under 13 in the US, you must obtain verifiable parental consent under COPPA.
- **AdSense child-directed content**: In your AdSense settings, mark your site as child-directed so Google can serve appropriate ads.
- **No third-party tracking**: Audit any third-party scripts before adding them. Avoid tracking pixels, analytics SDKs, or social widgets that collect data.
Learning corner for kids

## React Native Android App (`mobile/`)

A vibrant mobile companion app now lives in `/mobile` with:
- 6 screens: Home, Subject, Lesson, Quiz, Progress, Parent Zone
- Bottom tabs: Home 🏠, Learn 📚, Progress 🏆, Settings ⚙️
- Reusable components (`KidCard`, `KidButton`, `ProgressBar`, `Badge`, etc.)
- Theme system with 3 variants (Candy, Sunset, Ocean)
- Sample content in JSON (12 lessons, 20 quiz questions)

To run:
```bash
cd mobile
npm install
npm run android
```

## Web Design-System Styling

The web app now includes reusable styling layers under `src/styles/`:
- `variables.css` (tokens + gradients)
- `animations.css` (fade/slide/bounce/starburst)
- `components.css` (glass cards, gradient buttons)
- `layout.css` (shell/layout utilities)

These are imported in `src/main.jsx` and applied to the home experience for a more eye-catching, playful UI.


## Testing

Two suites, both runnable with no extra setup beyond `npm install`:

```bash
npm test            # pure logic: question generators, level configs, star thresholds
npm run test:e2e    # real browser: plays all 15 games and checks the scores
```

`npm test` needs no dev dependency at all — it uses a small Node resolve hook
(`scripts/resolve-hook.mjs`) so plain Node can follow Vite's extensionless
imports. It runs the same on Windows, macOS and Linux.

`npm run test:e2e` additionally needs a browser binary, once:

```bash
npx playwright install chromium
```

`npm test` (`scripts/test-engine.mjs`) exercises every question generator across
levels 1–15 over thousands of rounds and asserts the things that actually break
in a quiz game: the correct answer is always among the options, the arithmetic
is right, subtraction never goes negative, counting never asks for zero objects,
difficulty follows `levelConfig.js`, and no question repeats inside a round.

`npm run test:e2e` (`scripts/e2e.mjs`) builds the app, serves it, and plays each
game in Chromium — reading the question off the screen, computing the correct
answer, clicking it, and asserting the summary shows 10/10 with 3 stars. A game
that can't be won is a game with a scoring bug. It also checks every route for
console errors and for horizontal overflow at a 390px viewport.

## Architecture notes

- `src/utils/levelConfig.js` is the single source of truth for difficulty.
  Generators read from it; they never invent their own ranges.
- `src/utils/questionEngine.js` generates a whole round at once, which is what
  makes "no repeats inside a round" possible.
- `src/hooks/useQuizGame.js` holds the phase machine (pick → play → done),
  scoring, feedback timing and skip behaviour shared by the multiple-choice
  games. Previously each game carried its own copy and they had drifted apart.
- `src/components/SpaceGameLayout.jsx` is the shared game chrome. Every game
  uses it, so the header, progress bar and bottom bar stay consistent.
