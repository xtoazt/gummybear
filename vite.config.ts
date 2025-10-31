import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const projectRoot = process.cwd();
const frontendRoot = path.join(projectRoot, 'src/frontend');
const outputDir = path.join(projectRoot, 'dist/client');

export default defineConfig({
  plugins: [react()],
  root: frontendRoot,
  build: {
    outDir: outputDir,
    emptyOutDir: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': frontendRoot
    }
  },
  publicDir: false,
  clearScreen: false
});
