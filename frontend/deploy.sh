#!/bin/bash

# Netlify Deployment Script
echo "🚀 Starting Netlify deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output is in the 'build' directory"
    echo ""
    echo "🌐 To deploy to Netlify:"
    echo "1. Go to netlify.com and create a new site"
    echo "2. Connect your GitHub repository"
    echo "3. Set build directory to: frontend"
    echo "4. Set publish directory to: build"
    echo "5. Set build command to: npm ci && npm run build"
    echo ""
    echo "🔧 Don't forget to set environment variables:"
    echo "   REACT_APP_BACKEND_URL=https://your-backend-url.railway.app"
    echo "   REACT_APP_API_URL=https://your-backend-url.railway.app/api"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi
