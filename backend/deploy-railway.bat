@echo off
echo 🚂 Starting Railway deployment...

REM Check if we're in the right directory
if not exist "server.py" (
    echo ❌ Error: Please run this script from the backend directory
    pause
    exit /b 1
)

echo ✅ Backend directory found
echo.
echo 🚀 To deploy to Railway:
echo.
echo 🔧 Option 1 - Railway UI (Recommended):
echo 1. Go to [railway.app](https://railway.app)
echo 2. New Project → Deploy from GitHub repo
echo 3. Select phoenix_website repository
echo 4. Set root directory to: backend
echo 5. Deploy Now
echo.
echo 🔧 Option 2 - Railway CLI:
echo 1. Install CLI: npm install -g @railway/cli
echo 2. Login: railway login
echo 3. Initialize: railway init
echo 4. Deploy: railway up
echo.
echo 📋 Don't forget to set environment variables:
echo    SECRET_KEY=your-super-secret-key
echo    CORS_ORIGINS=https://your-site.netlify.app
echo    MONGODB_URI=your-mongodb-connection-string
echo.
echo 🌐 After deployment, get your Railway URL and update Netlify:
echo    REACT_APP_BACKEND_URL=https://your-app.railway.app
echo    REACT_APP_API_URL=https://your-app.railway.app/api
echo.
echo 📚 For detailed instructions, see: RAILWAY_DEPLOYMENT.md

pause
