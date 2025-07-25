@echo off
echo ========================================
echo Ava AI Voice Assistant - Database Setup
echo ========================================
echo.

echo 1. Installing dependencies...
pip install -r requirements.txt
echo.

echo 2. Testing database integration...
python test_database.py
echo.

echo 3. Running database setup...
python setup_database.py
echo.

echo 4. Setup complete!
echo.
echo You can now start the API server with:
echo python main.py
echo.
pause
