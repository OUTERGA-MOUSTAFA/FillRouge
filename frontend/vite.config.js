import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Augmenter la limite pour ne pas voir l'avertissement
    chunkSizeWarningLimit: 1000,
    // Code splitting automatique
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Mettre node_modules dans des chunks séparés
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('@heroicons') || id.includes('@headlessui')) {
              return 'vendor-ui';
            }
            if (id.includes('axios') || id.includes('zustand')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})