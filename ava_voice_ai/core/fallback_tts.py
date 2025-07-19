"""
Alternative TTS implementation for testing
Uses pyttsx3 (offline TTS) as fallback when Murf API is not available
"""

import os
import time
import threading
from typing import Optional, Callable

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    print("pyttsx3 not available - install with: pip install pyttsx3")

from audioplayer import AudioPlayer


class FallbackTTS:
    def __init__(self):
        self.is_playing = False
        self.current_player = None
        
        # Initialize pyttsx3 if available
        if PYTTSX3_AVAILABLE:
            try:
                self.engine = pyttsx3.init()
                # Set properties
                voices = self.engine.getProperty('voices')
                if voices:
                    # Prefer female voice if available
                    for voice in voices:
                        if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                            self.engine.setProperty('voice', voice.id)
                            break
                
                # Set speech rate
                self.engine.setProperty('rate', 180)  # Speed of speech
                self.engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
                
                self.tts_available = True
                print("✅ Fallback TTS (pyttsx3) initialized successfully")
            except Exception as e:
                print(f"❌ Error initializing pyttsx3: {e}")
                self.tts_available = False
        else:
            self.tts_available = False

    def speak_text(self, text: str, callback: Optional[Callable] = None):
        """
        Speak text using pyttsx3
        
        Args:
            text: Text to speak
            callback: Optional callback when speaking finishes
        """
        if not self.tts_available:
            print("TTS not available")
            if callback:
                callback()
            return
        
        def speak_thread():
            try:
                self.is_playing = True
                print(f"🗣️  Speaking: {text[:50]}{'...' if len(text) > 50 else ''}")
                
                self.engine.say(text)
                self.engine.runAndWait()
                
                self.is_playing = False
                print("✅ Speech completed")
                
                if callback:
                    callback()
                    
            except Exception as e:
                print(f"❌ Error during speech: {e}")
                self.is_playing = False
                if callback:
                    callback()
        
        # Run in separate thread
        speech_thread = threading.Thread(target=speak_thread, daemon=True)
        speech_thread.start()

    def stop_audio(self):
        """Stop current speech"""
        if self.tts_available and self.is_playing:
            try:
                self.engine.stop()
                self.is_playing = False
                print("🔇 Speech stopped")
            except Exception as e:
                print(f"Error stopping speech: {e}")

    def test_connection(self) -> bool:
        """Test if TTS is working"""
        return self.tts_available


# Update the requirements.txt to include pyttsx3
def update_requirements():
    """Add pyttsx3 to requirements if not present"""
    req_file = "requirements.txt"
    if os.path.exists(req_file):
        with open(req_file, 'r') as f:
            content = f.read()
        
        if 'pyttsx3' not in content:
            with open(req_file, 'a') as f:
                f.write('\npyttsx3>=2.90')
            print("✅ Added pyttsx3 to requirements.txt")


if __name__ == "__main__":
    print("Testing Fallback TTS...")
    
    # Update requirements
    update_requirements()
    
    # Test TTS
    tts = FallbackTTS()
    
    if tts.test_connection():
        print("✅ Fallback TTS is working")
        test_text = "Hello! This is a test of the fallback text-to-speech system."
        tts.speak_text(test_text)
        
        # Wait for completion
        while tts.is_playing:
            time.sleep(0.1)
        
        print("✅ Test completed!")
    else:
        print("❌ Fallback TTS not available")
