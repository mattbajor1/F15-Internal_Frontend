import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// change ONLY the proxy block if you already have a config:
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // send /api/* from Vite dev server -> Functions emulator
      '/api': {
        target: 'http://127.0.0.1:5001/f15-internal/us-central1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/api'),
      },
    },
  },
});