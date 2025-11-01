import { Plugin } from 'vite';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * TypeScript-based HTML generator
 * Generates index.html programmatically without any static HTML files
 */
interface HTMLMeta {
  charset: string;
  viewport: string;
  title: string;
  lang: string;
}

interface HTMLStructure {
  meta: HTMLMeta;
  rootId: string;
  scriptPath: string;
}

class HTMLGenerator {
  private static defaultMeta: HTMLMeta = {
    charset: 'UTF-8',
    viewport: 'width=device-width, initial-scale=1.0',
    title: '🍭 GummyBear - AI-Powered Chat Platform',
    lang: 'en'
  };

  static generateHTML(structure: Partial<HTMLStructure> = {}): string {
    const config: HTMLStructure = {
      meta: { ...this.defaultMeta, ...structure.meta },
      rootId: structure.rootId || 'root',
      scriptPath: structure.scriptPath || '/main.tsx'
    };

    return this.buildHTMLString(config);
  }

  private static buildHTMLString(config: HTMLStructure): string {
    const { meta, rootId, scriptPath } = config;
    
    const parts: string[] = [
      '<!DOCTYPE html>',
      `<html lang="${meta.lang}">`,
      '  <head>',
      `    <meta charset="${meta.charset}" />`,
      `    <meta name="viewport" content="${meta.viewport}" />`,
      `    <title>${meta.title}</title>`,
      '  </head>',
      '  <body>',
      `    <div id="${rootId}"></div>`,
      `    <script type="module" src="${scriptPath}"></script>`,
      '  </body>',
      '</html>'
    ];

    return parts.join('\n');
  }

  static generateHTMLWithAssets(
    structure: Partial<HTMLStructure>,
    assets: { js?: string[]; css?: string[] }
  ): string {
    const config: HTMLStructure = {
      meta: { ...this.defaultMeta, ...structure.meta },
      rootId: structure.rootId || 'root',
      scriptPath: structure.scriptPath || '/main.tsx'
    };

    const parts: string[] = [
      '<!DOCTYPE html>',
      `<html lang="${config.meta.lang}">`,
      '  <head>',
      `    <meta charset="${config.meta.charset}" />`,
      `    <meta name="viewport" content="${config.meta.viewport}" />`,
      `    <title>${config.meta.title}</title>`
    ];

    // Add CSS links
    if (assets.css) {
      assets.css.forEach(css => {
        parts.push(`    <link rel="stylesheet" crossorigin href="${css}">`);
      });
    }

    parts.push('  </head>');
    parts.push('  <body>');
    parts.push(`    <div id="${config.rootId}"></div>`);

    // Add JS scripts
    if (assets.js) {
      assets.js.forEach(js => {
        parts.push(`    <script type="module" crossorigin src="${js}"></script>`);
      });
    } else {
      parts.push(`    <script type="module" src="${config.scriptPath}"></script>`);
    }

    parts.push('  </body>');
    parts.push('</html>');

    return parts.join('\n');
  }
}

/**
 * Vite plugin that generates index.html programmatically from TypeScript
 * This replaces the need for a static HTML file
 */
export function generateHtmlPlugin(): Plugin {
  return {
    name: 'generate-html',
    enforce: 'pre',
    config(config, { command }) {
      const projectRoot = process.cwd();
      const frontendRoot = resolve(projectRoot, 'src', 'frontend');
      const htmlPath = resolve(frontendRoot, 'index.html');
      
      if (!existsSync(htmlPath)) {
        const htmlContent = HTMLGenerator.generateHTML();
        writeFileSync(htmlPath, htmlContent, 'utf-8');
      }
    },
    transformIndexHtml(html: string) {
      // This is called during dev mode - return our generated HTML
      return HTMLGenerator.generateHTML();
    },
    generateBundle(_options, bundle) {
      // Extract asset files from bundle
      const jsFiles: string[] = [];
      const cssFiles: string[] = [];

      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];
        // Extract just the filename without any directory prefix
        const baseFileName = fileName.split('/').pop() || fileName;
        
        if (file.type === 'chunk' && fileName.endsWith('.js')) {
          jsFiles.push(`/assets/${baseFileName}`);
        }
        if (file.type === 'asset' && fileName.endsWith('.css')) {
          cssFiles.push(`/assets/${baseFileName}`);
        }
      });

      // Generate HTML with assets for production build
      if (jsFiles.length > 0) {
        const htmlContent = HTMLGenerator.generateHTMLWithAssets(
          {},
          { js: jsFiles, css: cssFiles }
        );

        this.emitFile({
          type: 'asset',
          fileName: 'index.html',
          source: htmlContent
        });
      }
    }
  };
}

export { HTMLGenerator };
