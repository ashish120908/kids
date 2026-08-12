import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Vite's default is 5173, which is also what Laravel's own Vite dev server
// claims — so whichever project started second was silently sliding to 5174.
// KidLearn pins 3000 (where this project has always run) so the URL is stable.
//
// To change the port, in order of precedence:
//   1. npm run dev -- --port 6000        (works in every shell)
//   2. PORT=6000 in a .env file          (works in every shell)
//   3. a PORT environment variable       (shell-specific syntax)
//
// `PORT=6000 npm run dev` is bash syntax and does NOT work in Windows
// cmd or PowerShell — hence the .env option, which is shell-agnostic.
export default defineConfig(({ mode }) => {
  // Third argument '' disables the VITE_ prefix filter, so a plain PORT= line
  // in .env is picked up.
  const env = loadEnv(mode, process.cwd(), '')
  const port = (key, fallback) => Number(process.env[key] || env[key]) || fallback

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: port('PORT', 3000),
      strictPort: true,   // fail loudly instead of drifting to another port
      open: true,
    },
    preview: {
      port: port('PREVIEW_PORT', 3001),
      strictPort: true,
    },
  }
})
