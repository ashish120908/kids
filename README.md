# KidLearn 🎓

A fun, interactive learning app for kids featuring multiplication tables, color matching, shape identification, and counting games — built with React + Vite.

## Games
- **Times Tables** ✖️ — Practice multiplication (1–12 tables)
- **Color Match** 🎨 — Match color names to their visual colors
- **Shape Match** 🔷 — Identify circle, square, triangle, and more
- **Counting Game** 🔢 — Count emoji objects and choose the right number
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
