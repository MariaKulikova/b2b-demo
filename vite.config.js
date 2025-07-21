import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.CI
  
  return {
    plugins: [react(), tailwindcss()],
    base: '/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      // Optimizations for production
      minify: isProduction,
      sourcemap: !isProduction,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  }
})
