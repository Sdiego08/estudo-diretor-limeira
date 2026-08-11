import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone-192.png', 'icone-512.png', 'icone-maskable-512.png', 'fontes/*.woff2'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,json}'],
      },
      manifest: {
        name: 'Diretor de Escola — Limeira 2026',
        short_name: 'Estudo',
        description: 'Questões e cartões para o concurso de Diretor de Escola de Limeira/SP.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF7EF',
        theme_color: '#2F4F43',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
