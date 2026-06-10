import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isPagesBuild = process.env.VITE_DEMO_MODE === 'true';

export default defineConfig({
  base: isPagesBuild ? '/lieferradar/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@lieferradar/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
