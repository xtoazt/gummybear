#!/bin/bash

echo "🍭 Building GummyBear Chat Platform..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npx tsc

# Build with Vite
echo "⚡ Building with Vite..."
npx vite build

echo "✅ Build complete!"
echo "🚀 You can now run: php -S localhost:8000"
