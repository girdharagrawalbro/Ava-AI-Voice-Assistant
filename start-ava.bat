@echo off
chcp 65001 >nul 2>&1
echo [*] Starting Ava AI Assistant - Full Stack
echo ==========================================
echo.

echo [1] Step 1: Installing backend dependencies...
cd "%~dp0ava_voice_ai"
if not exist .env (
    echo [X] .env file not found! Please create it from .env.example
    echo     and add your API keys.
    pause
    exit /b 1
)

echo.
echo [2] Step 2: Installing FastAPI dependencies...
pip install -q fastapi uvicorn python-multipart
if %errorlevel% neq 0 (
    echo [X] Failed to install FastAPI dependencies
    pause
    exit /b 1
)

echo.
echo [3] Step 3: Installing frontend dependencies...
cd "%~dp0electron-app"
if not exist node_modules (
    echo Installing Node.js dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo.
echo [4] Step 4: Starting backend server (Python FastAPI)...
cd "%~dp0ava_voice_ai"

echo [!] Checking if port 8000 is available...
netstat -an | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [!] Port 8000 is already in use. Attempting to find and stop existing process...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :8000') do (
        echo [!] Stopping process with PID %%i...
        taskkill /F /PID %%i >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

start "Ava Backend" /min cmd /c "python api_main.py --port 8000"

echo.
echo [~] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [5] Step 5: Starting frontend (Electron + Vite)...
cd "%~dp0electron-app"
call npm run dev:frontend-only

echo.
echo [*] Ava AI Assistant should now be running!
echo     - Backend API: http://127.0.0.1:8000
echo     - Frontend: http://localhost:5173
echo     - Electron app should have opened automatically
echo.
echo Press any key to exit...
pause
