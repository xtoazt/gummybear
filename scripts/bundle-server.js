import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

try {
  console.log('📦 Bundling server...');
  
  await build({
    entryPoints: [join(projectRoot, 'dist', 'server.js')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: join(projectRoot, 'dist', 'server.bundle.js'),
    external: [
      'express',
      'cors',
      'helmet',
      'dotenv',
      'jsonwebtoken',
      'pg',
      'bcryptjs',
      'uuid',
      '@octokit/rest'
    ],
    banner: {
      js: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);"
    },
    allowOverwrite: true,
    minify: false,
    sourcemap: false,
  });

  console.log('✅ Server bundled successfully');
  console.log('📦 Bundle created at: dist/server.bundle.js');
} catch (error) {
  console.error('❌ Bundling failed:', error);
  process.exit(1);
}

