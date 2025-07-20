#!/usr/bin/env python3
"""
Ava AI Assistant - Setup Checker
Verifies that all components are properly configured
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_python_packages():
    """Check if required Python packages are installed"""
    print("🐍 Checking Python dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'speech_recognition',
        'google-generativeai',
        'requests',
        'audioplayer',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"  ❌ {package}")
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All Python packages are installed!")
    return True

def check_env_file():
    """Check if .env file exists and has required keys"""
    print("\n🔑 Checking environment configuration...")
    
    env_file = Path("ava_voice_ai/.env")
    
    if not env_file.exists():
        print("❌ .env file not found!")
        print("Please create ava_voice_ai/.env from .env.example")
        return False
    
    print("✅ .env file exists")
    
    # Check for required environment variables
    required_keys = ['GOOGLE_API_KEY', 'MURF_API_KEY']
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    missing_keys = []
    for key in required_keys:
        if key not in content or f"{key}=" not in content:
            missing_keys.append(key)
    
    if missing_keys:
        print(f"⚠️  Missing API keys: {', '.join(missing_keys)}")
        return True  # File exists but keys might be empty
    
    print("✅ All required API keys are configured")
    return True

def check_node_setup():
    """Check if Node.js and dependencies are set up"""
    print("\n📦 Checking Node.js setup...")
    
    # Check if Node.js is installed
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js version: {result.stdout.strip()}")
        else:
            print("❌ Node.js not found!")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found!")
        return False
    
    # Check if package.json exists
    package_json = Path("electron-app/package.json")
    if not package_json.exists():
        print("❌ electron-app/package.json not found!")
        return False
    
    print("✅ package.json found")
    
    # Check if node_modules exists
    node_modules = Path("electron-app/node_modules")
    if not node_modules.exists():
        print("⚠️  node_modules not found. Run: cd electron-app && npm install")
        return False
    
    print("✅ Node.js dependencies are installed")
    return True

def check_ports():
    """Check if required ports are available"""
    print("\n🌐 Checking port availability...")
    
    import socket
    
    ports_to_check = [
        (8000, "Backend API"),
        (5173, "Frontend Dev Server")
    ]
    
    for port, description in ports_to_check:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            result = s.connect_ex(('127.0.0.1', port))
            if result == 0:
                print(f"⚠️  Port {port} ({description}) is already in use")
            else:
                print(f"✅ Port {port} ({description}) is available")
    
    return True

def test_fastapi_import():
    """Test if FastAPI can be imported and basic functionality works"""
    print("\n🚀 Testing FastAPI setup...")
    
    try:
        from fastapi import FastAPI
        from uvicorn import run
        print("✅ FastAPI imports successful")
        
        # Try to create a simple FastAPI app
        app = FastAPI()
        print("✅ FastAPI app creation successful")
        
        return True
    except Exception as e:
        print(f"❌ FastAPI test failed: {e}")
        return False

def main():
    """Main setup checker"""
    print("🔍 Ava AI Assistant - Setup Checker")
    print("=" * 40)
    
    checks = [
        check_python_packages,
        check_env_file,
        check_node_setup,
        check_ports,
        test_fastapi_import
    ]
    
    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print(f"❌ Check failed with error: {e}")
            results.append(False)
    
    print("\n" + "=" * 40)
    print("📊 Setup Summary:")
    
    if all(results):
        print("🎉 All checks passed! Your setup looks good.")
        print("\nNext steps:")
        print("1. Run: python ava_voice_ai/api_main.py")
        print("2. In another terminal: cd electron-app && npm run dev:frontend")
        print("3. In a third terminal: cd electron-app && npm run electron:dev")
        print("\nOr simply run: start-ava.bat")
    else:
        print("⚠️  Some checks failed. Please resolve the issues above.")
        print("\nCommon solutions:")
        print("- Install missing Python packages: pip install -r ava_voice_ai/requirements.txt")
        print("- Install FastAPI: pip install fastapi uvicorn")
        print("- Create .env file from .env.example and add your API keys")
        print("- Install Node.js dependencies: cd electron-app && npm install")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
