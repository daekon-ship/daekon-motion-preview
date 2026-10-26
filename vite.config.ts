import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://daekon-ship.github.io/daekon-motion-preview/
export default defineConfig({
  base: '/daekon-motion-preview/',
  plugins: [react()],
  build: { target: 'es2022', cssCodeSplit: false },
})
