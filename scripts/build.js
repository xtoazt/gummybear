#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🍭 Building GummyBear Chat Platform...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Compile TypeScript
console.log('🔨 Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Copy static files
console.log('📁 Copying static files...');
const staticDir = path.join(__dirname, '..', 'static');
if (fs.existsSync(staticDir)) {
  const distStaticDir = path.join(distDir, 'static');
  if (!fs.existsSync(distStaticDir)) {
    fs.mkdirSync(distStaticDir, { recursive: true });
  }
  
  // Copy all files from static to dist/static
  const files = fs.readdirSync(staticDir);
  files.forEach(file => {
    const srcPath = path.join(staticDir, file);
    const destPath = path.join(distStaticDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Copy directory recursively
      execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'inherit' });
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('✅ Static files copied');
}

// Copy HTML files
console.log('📄 Copying HTML files...');
const srcDir = path.join(__dirname, '..', 'src');
const htmlFiles = ['index.html', 'app.html', 'landing.html'];

htmlFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file}`);
  }
});

console.log('✅ Build complete!');
console.log('🚀 You can now deploy to Vercel or run: php -S localhost:8000');
