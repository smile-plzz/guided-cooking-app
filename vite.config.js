import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/favicon-32.png'],
      manifest: {
        name: 'Mise — Guided Cooking',
        short_name: 'Mise',
        description:
          'Find a recipe, scale it, and cook it hands-free with guided steps and timers.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FBF8F5',
        theme_color: '#D25334',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Everything the guided-cooking flow needs — the app shell and the
        // bundled catalog — precaches for instant, offline-capable launches.
        // The external recipe API is deliberately excluded: those results
        // are only ever additive to the bundled catalog, so stale/offline
        // responses here should surface as "unavailable", not silently
        // serve a cached answer for a live search.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/commons\.wikimedia\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'recipe-photos',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@data': path.resolve(process.cwd(), 'data'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // `vercel dev` serves the /api functions on 3001 during local development.
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          // The bundled recipe catalog is ~1.8MB of static data that rarely
          // changes between deploys; splitting it out lets browsers keep it
          // cached across app-code releases instead of re-downloading it.
          catalog: ['@data/catalog.js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
