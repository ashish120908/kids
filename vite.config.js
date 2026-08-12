import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 5173 is Vite's default, which means Laravel's own Vite dev server
// claims it too. Rather than whichever project starts second silently sliding
// to 5174, KidLearn pins its own ports so the URL is always the same.
// Override with: PORT=6000 npm run dev   (or `npm run dev -- --port 6000`)
const DEV_PORT = Number(process.env.PORT) || 5180
const PREVIEW_PORT = Number(process.env.PREVIEW_PORT) || 5181

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: DEV_PORT,
    strictPort: true,   // fail loudly instead of drifting to another port
    open: true,
  },
  preview: {
    port: PREVIEW_PORT,
    strictPort: true,
  },
})
