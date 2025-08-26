#!/bin/bash

# Railway Deployment Script
echo "🚂 Starting Railway deployment..."

# Check if we're in the right directory
if [ ! -f "server.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"
echo ""
echo "🚀 To deploy to Railway:"
echo "1. Run: railway init"
echo "2. Run: railway up"
echo ""
echo "🔧 Or deploy via Railway UI:"
echo "1. Go to [railway.app](https://railway.app)"
echo "2. New Project → Deploy from GitHub repo"
echo "3. Select phoenix_website repository"
echo "4. Set root directory to: backend"
echo "5. Deploy Now"
echo ""
echo "📋 Don't forget to set environment variables:"
echo "   SECRET_KEY=your-super-secret-key"
echo "   CORS_ORIGINS=https://your-site.netlify.app"
echo "   MONGODB_URI=your-mongodb-connection-string"
echo ""
echo "🌐 After deployment, get your Railway URL and update Netlify:"
echo "   REACT_APP_BACKEND_URL=https://your-app.railway.app"
echo "   REACT_APP_API_URL=https://your-app.railway.app/api"
