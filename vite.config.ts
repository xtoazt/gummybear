import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Use fileURLToPath for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);
const frontendRoot = path.resolve(projectRoot, 'src', 'frontend');
const outputDir = path.resolve(projectRoot, 'dist', 'client');

export default defineConfig({
  plugins: [react()],
  root: frontendRoot,
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html'
    }
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
  publicDir: path.resolve(projectRoot, 'public'),
  clearScreen: false
});
