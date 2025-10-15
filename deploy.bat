@echo off
REM Smart Education System Deployment Script for Windows
REM This script helps you deploy your application to various platforms

echo 🚀 Smart Education System Deployment Script
echo =============================================

:menu
echo.
echo Select deployment option:
echo 1) Docker (Local)
echo 2) Docker (Production Build)
echo 3) Vercel
echo 4) Netlify
echo 5) Build Only
echo 6) Exit
echo.
set /p choice="Enter your choice [1-6]: "

if "%choice%"=="1" goto docker_local
if "%choice%"=="2" goto docker_prod
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto netlify
if "%choice%"=="5" goto build_only
if "%choice%"=="6" goto exit
echo ❌ Invalid option. Please try again.
goto menu

:build_production
echo 📦 Building production version...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)
echo ✅ Production build completed successfully!
echo 📁 Built files are in: dist/demo/browser/
goto :eof

:docker_local
echo 🐳 Deploying with Docker...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Docker deployment failed!
    exit /b 1
)
echo ✅ Docker deployment completed!
echo 🌐 Frontend: http://localhost:80
echo 🔧 Backend: http://localhost:4000
echo 🗄️  MongoDB: localhost:27017
goto menu

:docker_prod
echo 🐳 Building and deploying with Docker...
call docker-compose up -d --build
if %errorlevel% neq 0 (
    echo ❌ Docker production deployment failed!
    exit /b 1
)
echo ✅ Docker production deployment completed!
echo 🌐 Frontend: http://localhost:80
echo 🔧 Backend: http://localhost:4000
echo 🗄️  MongoDB: localhost:27017
goto menu

:vercel
echo ⚡ Deploying to Vercel...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    call npm install -g vercel
)
call :build_production
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed!
    exit /b 1
)
echo ✅ Vercel deployment completed!
goto menu

:netlify
echo 🌐 Deploying to Netlify...
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI not found. Installing...
    call npm install -g netlify-cli
)
call :build_production
call netlify deploy --prod --dir=dist/demo/browser
if %errorlevel% neq 0 (
    echo ❌ Netlify deployment failed!
    exit /b 1
)
echo ✅ Netlify deployment completed!
goto menu

:build_only
call :build_production
goto menu

:exit
echo 👋 Goodbye!
exit /b 0
