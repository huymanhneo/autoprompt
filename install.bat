@echo off
cls
echo ========================================
echo   YouTube Video Automation Installer
echo   Developed by Mr.Manh - 0979.121.097
echo ========================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check FFmpeg
echo.
echo [2/4] Checking FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: FFmpeg is not installed!
    echo.
    echo Installing FFmpeg using Chocolatey...
    echo If Chocolatey is not installed, please install FFmpeg manually from: https://ffmpeg.org/download.html
    echo.
    choco --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Chocolatey not found. Please install FFmpeg manually.
        echo Visit: https://ffmpeg.org/download.html
        pause
        exit /b 1
    )
    choco install ffmpeg -y
)
echo ✓ FFmpeg found

REM Install dependencies
echo.
echo [3/4] Installing dependencies (this may take 5-10 minutes)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

REM Success
echo.
echo [4/4] Installation complete!
echo.
echo ========================================
echo   READY TO USE!
echo ========================================
echo.
echo To start the application, run:
echo   npm run electron:dev
echo.
echo First-time setup wizard will guide you through API configuration.
echo.
echo Developed by Mr.Manh - 0979.121.097
echo ========================================
echo.
pause
