@echo off
echo 🤖 Starting Ava AI Voice Assistant...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Please run setup.py first to configure your API keys.
    pause
    exit /b 1
)

REM Run the application
echo 🚀 Launching Ava...
python main.py

REM Pause if there was an error
if errorlevel 1 (
    echo.
    echo ❌ Application ended with error. Check the output above.
    pause
)

echo.
echo 👋 Thanks for using Ava AI Assistant!
pause
