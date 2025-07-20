@echo off
echo [*] Checking for processes using port 8000...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [!] Found processes using port 8000. Attempting to stop them...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :8000') do (
        echo [!] Stopping process with PID %%i...
        taskkill /F /PID %%i >nul 2>&1
        if %errorlevel% equ 0 (
            echo [+] Process %%i stopped successfully
        ) else (
            echo [-] Failed to stop process %%i
        )
    )
    echo [*] Waiting for port to be released...
    timeout /t 2 /nobreak >nul
) else (
    echo [+] Port 8000 is already free
)
