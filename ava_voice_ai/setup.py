"""
Setup script for Ava AI Voice Assistant
Run this script to install dependencies and configure the environment
"""

import subprocess
import sys
import os
from pathlib import Path


def install_requirements():
    """Install required packages"""
    print("📦 Installing Python packages...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✅ Python packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        print(f"Error output: {e.stderr}")
        return False


def setup_env_file():
    """Set up .env file if it doesn't exist"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("📝 Creating .env file from template...")
            with open(env_example, 'r') as f:
                content = f.read()
            with open(env_file, 'w') as f:
                f.write(content)
            print("✅ .env file created! Please add your API keys.")
        else:
            print("❌ .env.example not found!")
            return False
    else:
        print("✅ .env file already exists!")
    
    return True


def check_microphone():
    """Check if microphone is accessible"""
    print("🎤 Testing microphone access...")
    try:
        import speech_recognition as sr
        r = sr.Recognizer()
        mic = sr.Microphone()
        
        with mic as source:
            r.adjust_for_ambient_noise(source, duration=0.5)
        
        print("✅ Microphone is accessible!")
        return True
    except Exception as e:
        print(f"❌ Microphone test failed: {e}")
        return False


def main():
    """Main setup function"""
    print("🚀 Setting up Ava AI Voice Assistant...")
    print("=" * 50)
    
    success = True
    
    # Install requirements
    if not install_requirements():
        success = False
    
    # Setup environment file
    if not setup_env_file():
        success = False
    
    # Test microphone
    if not check_microphone():
        print("⚠️  Microphone test failed, but you can still try running the app")
    
    print("=" * 50)
    
    if success:
        print("🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Edit .env file and add your API keys:")
        print("   - GOOGLE_API_KEY (from Google AI Studio)")
        print("   - MURF_API_KEY (from Murf.ai)")
        print("2. Run the application: python main.py")
    else:
        print("❌ Setup encountered errors. Please check the output above.")
        print("You may need to manually install packages or fix permissions.")
    
    return success


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Setup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        sys.exit(1)
