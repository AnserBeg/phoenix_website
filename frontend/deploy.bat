@echo off
echo 🚀 Starting Netlify deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Build the project
echo 🔨 Building project...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 📁 Build output is in the 'build' directory
    echo.
    echo 🌐 To deploy to Netlify:
    echo 1. Go to netlify.com and create a new site
    echo 2. Connect your GitHub repository
    echo 3. Set build directory to: frontend
    echo 4. Set publish directory to: build
    echo 5. Set build command to: npm ci ^&^& npm run build
    echo.
    echo 🔧 Don't forget to set environment variables:
    echo    REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
    echo    REACT_APP_API_URL=https://your-backend-url.railway.app/api
) else (
    echo ❌ Build failed! Check the error messages above.
    pause
    exit /b 1
)

pause
