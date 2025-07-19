"""
Test script for Ava AI Voice Assistant
Tests all core components individually
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.voice_input import VoiceInput
from core.gemini_response import GeminiResponse
from core.murf_tts import MurfTTS


def test_voice_input():
    """Test voice input functionality"""
    print("🎤 Testing Voice Input...")
    print("-" * 30)
    
    try:
        voice = VoiceInput()
        
        # Test microphone access
        if voice.test_microphone():
            print("✅ Microphone accessible")
        else:
            print("❌ Microphone not accessible")
            return False
        
        # List available microphones
        mics = voice.list_microphones()
        print(f"📱 Found {len(mics)} microphone(s)")
        
        # Optional: Test actual recording
        test_recording = input("🎙️  Test voice recording? (y/n): ").lower().strip()
        if test_recording == 'y':
            print("Say something (5 seconds)...")
            result = voice.listen_once(timeout=5)
            if result:
                print(f"✅ Recognized: '{result}'")
            else:
                print("❌ No speech recognized")
        
        return True
        
    except Exception as e:
        print(f"❌ Voice input test failed: {e}")
        return False


def test_gemini_response():
    """Test Gemini AI functionality"""
    print("\n🧠 Testing Gemini AI...")
    print("-" * 30)
    
    try:
        gemini = GeminiResponse()
        
        # Test connection
        if gemini.test_connection():
            print("✅ Gemini connection successful")
        else:
            print("❌ Gemini connection failed")
            return False
        
        # Test conversation
        print("🤖 Testing AI conversation...")
        response = gemini.get_response("Hello! Please respond with a brief greeting.")
        
        if response:
            print(f"✅ AI Response: '{response}'")
            
            # Test follow-up
            follow_up = gemini.get_response("What's your name?")
            if follow_up:
                print(f"✅ Follow-up Response: '{follow_up}'")
        else:
            print("❌ No response from Gemini")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini test failed: {e}")
        return False


def test_murf_tts():
    """Test Murf TTS functionality"""
    print("\n🔊 Testing Murf TTS...")
    print("-" * 30)
    
    try:
        murf = MurfTTS()
        
        # Test connection
        if murf.test_connection():
            print("✅ Murf TTS connection successful")
        else:
            print("❌ Murf TTS connection failed")
            return False
        
        # Test available voices
        voices = murf.get_available_voices()
        if voices:
            voice_count = len(voices.get('voices', []))
            print(f"🎵 Found {voice_count} available voices")
        
        # Test text-to-speech
        test_speech = input("🗣️  Test speech generation? (y/n): ").lower().strip()
        if test_speech == 'y':
            test_text = "Hello! This is a test of the Murf text-to-speech system."
            print(f"🔄 Converting: '{test_text}'")
            
            audio_path = murf.text_to_speech(test_text)
            if audio_path:
                print(f"✅ Audio generated: {os.path.basename(audio_path)}")
                
                # Test playback
                play_audio = input("▶️  Play generated audio? (y/n): ").lower().strip()
                if play_audio == 'y':
                    print("🔊 Playing audio...")
                    murf.play_audio(audio_path)
                    
                    # Wait for playback
                    import time
                    while murf.is_playing:
                        time.sleep(0.1)
                    print("✅ Audio playback completed")
            else:
                print("❌ Failed to generate audio")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Murf TTS test failed: {e}")
        return False


def test_integration():
    """Test full integration workflow"""
    print("\n🔄 Testing Full Integration...")
    print("-" * 30)
    
    try:
        voice = VoiceInput()
        gemini = GeminiResponse()
        murf = MurfTTS()
        
        test_integration_flow = input("🎯 Test full voice → AI → speech workflow? (y/n): ").lower().strip()
        if test_integration_flow != 'y':
            print("⏭️  Skipping integration test")
            return True
        
        print("🎤 Say something to test the full workflow...")
        print("(You have 10 seconds)")
        
        # Voice input
        user_text = voice.listen_once(timeout=10)
        if not user_text:
            print("❌ No speech detected")
            return False
        
        print(f"🎤 You said: '{user_text}'")
        
        # AI processing
        print("🧠 Getting AI response...")
        ai_response = gemini.get_response(user_text)
        if not ai_response:
            print("❌ No AI response")
            return False
        
        print(f"🤖 AI Response: '{ai_response}'")
        
        # Text-to-speech
        print("🔊 Converting to speech...")
        audio_path = murf.text_to_speech(ai_response)
        if not audio_path:
            print("❌ TTS conversion failed")
            return False
        
        print("▶️  Playing AI response...")
        murf.play_audio(audio_path)
        
        # Wait for completion
        import time
        while murf.is_playing:
            time.sleep(0.1)
        
        print("✅ Full integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False


def main():
    """Main test function"""
    print("🧪 Ava AI Voice Assistant - Component Tests")
    print("=" * 50)
    
    results = {
        "Voice Input": test_voice_input(),
        "Gemini AI": test_gemini_response(), 
        "Murf TTS": test_murf_tts(),
    }
    
    # Integration test only if all components work
    if all(results.values()):
        results["Integration"] = test_integration()
    else:
        print("\n⚠️  Skipping integration test - some components failed")
        results["Integration"] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("-" * 25)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:15} : {status}")
    
    passed = sum(results.values())
    total = len(results)
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Ava setup is working correctly.")
        print("🚀 You can now run 'python main.py' to start the application.")
    else:
        print("⚠️  Some tests failed. Please check your configuration:")
        print("   - Verify API keys in .env file")
        print("   - Check microphone permissions")  
        print("   - Ensure all dependencies are installed")
    
    return passed == total


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n👋 Tests cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during testing: {e}")
        sys.exit(1)
