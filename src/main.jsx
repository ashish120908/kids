import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/variables.css'
import './App.css'
import './styles/animations.css'
import './styles/components.css'
import './styles/layout.css'

/**
 * Service worker registration.
 *
 * This used to be an inline script in index.html that registered
 * unconditionally — including during `npm run dev`. In dev, Vite serves modules
 * from stable URLs (`/src/main.jsx`, `/src/components/*.jsx`) with no content
 * hash, and sw.js caches static assets cache-first. The result: the very first
 * version of every module you ever loaded is served from cache forever, so
 * edits appear to do nothing and the app "reflects old code".
 *
 * Now it only registers in a production build, and in dev it actively tears
 * down any worker and cache left behind by the old behaviour.
 */
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (window.caches) {
      caches.keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
