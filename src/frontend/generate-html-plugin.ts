import { Plugin } from 'vite';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Vite plugin that generates index.html programmatically from TypeScript
 * This replaces the need for a static HTML file
 */
export function generateHtmlPlugin(): Plugin {
  return {
    name: 'generate-html',
    enforce: 'pre', // Run before other plugins
    config(config, { command }) {
      // Generate HTML file early in the config phase
      const projectRoot = process.cwd();
      const frontendRoot = resolve(projectRoot, 'src', 'frontend');
      const htmlPath = resolve(frontendRoot, 'index.html');
      
      if (!existsSync(htmlPath)) {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🛡️ ChromeOS Vulnerability Tester</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;
        
        writeFileSync(htmlPath, htmlContent, 'utf-8');
      }
    }
  };
}

