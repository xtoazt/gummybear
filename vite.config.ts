import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Use process.cwd() for better compatibility with build environments like Vercel
const projectRoot = process.cwd();
const frontendRoot = path.resolve(projectRoot, 'src', 'frontend');
const outputDir = path.resolve(projectRoot, 'dist', 'client');
const indexHtmlPath = path.resolve(frontendRoot, 'index.html');

export default defineConfig({
  plugins: [react()],
  root: frontendRoot,
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    rollupOptions: {
      input: indexHtmlPath
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
