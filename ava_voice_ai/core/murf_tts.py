"""
Murf TTS (Text-to-Speech) module for Ava AI Assistant
Handles voice synthesis using Murf AI Official SDK
"""

import os
import time
from typing import Optional, Callable
from dotenv import load_dotenv
import threading
import requests
import base64

# Try to import Murf SDK
try:
    from murf import Murf
    MURF_SDK_AVAILABLE = True
except ImportError:
    MURF_SDK_AVAILABLE = False
    print("⚠️  Murf SDK not available. Install with: pip install murf")

# Try to import fallback TTS
try:
    from .fallback_tts import FallbackTTS
    FALLBACK_AVAILABLE = True
except ImportError:
    FALLBACK_AVAILABLE = False

# For audio playback
from audioplayer import AudioPlayer

# Load environment variables
load_dotenv()


class MurfTTS:
    def __init__(self):
        self.api_key = os.getenv('MURF_API_KEY')
        
        if not self.api_key:
            print("⚠️  MURF_API_KEY not found - using fallback TTS")
        
        # Default voice settings - define before testing connection
        self.default_voice_id = "en-US-terrell"  # Using voice from documentation
        
        # Initialize Murf client if SDK is available
        self.murf_client = None
        self.use_murf = False
        
        if MURF_SDK_AVAILABLE and self.api_key:
            try:
                self.murf_client = Murf(api_key=self.api_key)
                self.use_murf = self._test_murf_connection()
                if self.use_murf:
                    print("✅ Murf SDK initialized successfully")
                else:
                    print("⚠️  Murf SDK connection failed")
            except Exception as e:
                print(f"⚠️  Error initializing Murf SDK: {e}")
                self.use_murf = False
        self.audio_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "audio")
        
        # Ensure audio folder exists
        os.makedirs(self.audio_folder, exist_ok=True)
        
        # Audio player for playback
        self.current_player = None
        self.is_playing = False
        
        # Initialize fallback TTS
        self.fallback_tts = None
        self.use_fallback = not self.use_murf
        
        if FALLBACK_AVAILABLE:
            try:
                self.fallback_tts = FallbackTTS()
                print("✅ Fallback TTS initialized")
            except Exception as e:
                print(f"⚠️  Could not initialize fallback TTS: {e}")
    
    def _test_murf_connection(self) -> bool:
        """Test if Murf SDK connection is working"""
        if not self.murf_client:
            return False
        
        try:
            # Try a simple generation to test the connection
            response = self.murf_client.text_to_speech.generate(
                text="Test",
                voice_id=self.default_voice_id
            )
            return hasattr(response, 'audio_file') or hasattr(response, 'encoded_audio')
        except Exception as e:
            print(f"Murf connection test failed: {e}")
            return False

    def get_available_voices(self) -> Optional[dict]:
        """
        Get information about available voices
        
        Returns:
            Dictionary with voice information or None if failed
        """
        if self.use_murf and self.murf_client:
            return {
                "message": f"Murf SDK voices available (using {self.default_voice_id})",
                "voices": [{"id": self.default_voice_id, "name": "Default Murf Voice"}]
            }
        elif self.fallback_tts:
            return {
                "message": "Fallback TTS (pyttsx3) voices available", 
                "voices": [{"id": "fallback", "name": "System TTS"}]
            }
        else:
            return None

    def text_to_speech(self, text: str, voice_id: Optional[str] = None, 
                      style: Optional[str] = None, speed: float = 1.0) -> Optional[str]:
        """
        Convert text to speech using Murf SDK
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (defaults to self.default_voice_id)
            style: Speaking style (ignored for now)
            speed: Speaking speed (ignored for now)
            
        Returns:
            Path to the generated audio file or None if failed
        """
        if not text or not text.strip():
            return None
        
        # Use fallback immediately if Murf SDK is not working
        if not self.use_murf or not self.murf_client:
            return None  # Let the caller handle fallback
        
        voice_id = voice_id or self.default_voice_id
        
        try:
            print(f"Converting text to speech: '{text[:50]}{'...' if len(text) > 50 else ''}'")
            
            # Use Murf SDK to generate speech
            response = self.murf_client.text_to_speech.generate(
                text=text.strip(),
                voice_id=voice_id,
                format="MP3",
                channel_type="STEREO",
                sample_rate=44100
            )
            
            # Handle the response
            audio_data = None
            
            if hasattr(response, 'audio_file') and response.audio_file:
                # Response contains a URL to download the audio
                print(f"Downloading audio from: {response.audio_file}")
                download_response = requests.get(response.audio_file, timeout=30)
                download_response.raise_for_status()
                audio_data = download_response.content
                
            elif hasattr(response, 'encoded_audio') and response.encoded_audio:
                # Response contains base64 encoded audio
                print("Decoding base64 audio...")
                audio_data = base64.b64decode(response.encoded_audio)
            
            else:
                print("Unknown response format from Murf SDK")
                return None
            
            # Save the audio file
            timestamp = int(time.time() * 1000)
            filename = f"ava_speech_{timestamp}.mp3"
            filepath = os.path.join(self.audio_folder, filename)
            
            with open(filepath, 'wb') as f:
                f.write(audio_data)
            
            print(f"Audio saved to: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"Error in Murf SDK text-to-speech conversion: {e}")
            # Switch to fallback for future requests
            self.use_murf = False
            self.use_fallback = True
            return None

    def play_audio(self, audio_path: str, callback: Optional[callable] = None):
        """
        Play audio file
        
        Args:
            audio_path: Path to audio file
            callback: Optional callback function to call when playback finishes
        """
        if not os.path.exists(audio_path):
            print(f"Audio file not found: {audio_path}")
            return
        
        def play_in_thread():
            try:
                self.is_playing = True
                print(f"Playing audio: {audio_path}")
                
                self.current_player = AudioPlayer(audio_path)
                self.current_player.play(block=True)
                
                self.is_playing = False
                print("Audio playback completed")
                
                if callback:
                    callback()
                    
            except Exception as e:
                print(f"Error playing audio: {e}")
                self.is_playing = False
        
        # Play audio in separate thread to avoid blocking UI
        audio_thread = threading.Thread(target=play_in_thread, daemon=True)
        audio_thread.start()

    def stop_audio(self):
        """Stop currently playing audio"""
        # Stop fallback TTS if being used
        if self.use_fallback and self.fallback_tts:
            self.fallback_tts.stop_audio()
            return
            
        # Stop regular audio playback
        if self.current_player and self.is_playing:
            try:
                self.current_player.close()
                self.is_playing = False
                print("Audio playback stopped")
            except Exception as e:
                print(f"Error stopping audio: {e}")

    def speak_text(self, text: str, voice_id: Optional[str] = None, 
                  style: Optional[str] = None, callback: Optional[Callable] = None):
        """
        Convert text to speech and play it immediately
        
        Args:
            text: Text to speak
            voice_id: Voice ID to use
            style: Speaking style
            callback: Optional callback when speaking finishes
        """
        # Use fallback TTS if Murf API is not available
        if self.use_fallback and self.fallback_tts:
            print("🔄 Using fallback TTS...")
            self.fallback_tts.speak_text(text, callback)
            return
            
        def speak_in_thread():
            audio_path = self.text_to_speech(text, voice_id, style)
            if audio_path:
                self.play_audio(audio_path, callback)
            else:
                print("Failed to generate speech with Murf, trying fallback...")
                if self.fallback_tts:
                    self.fallback_tts.speak_text(text, callback)
                elif callback:
                    callback()
        
        # Run in separate thread to avoid blocking
        speak_thread = threading.Thread(target=speak_in_thread, daemon=True)
        speak_thread.start()

    def test_connection(self) -> bool:
        """
        Test connection to Murf SDK or fallback TTS
        
        Returns:
            True if any TTS method is available, False otherwise
        """
        # Test Murf SDK first if available
        if self.use_murf and self.murf_client:
            return True
        
        # Test fallback TTS
        if self.fallback_tts:
            return self.fallback_tts.test_connection()
        
        return False

    def cleanup_audio_files(self, max_files: int = 10):
        """
        Clean up old audio files to save disk space
        
        Args:
            max_files: Maximum number of audio files to keep
        """
        try:
            audio_files = []
            for filename in os.listdir(self.audio_folder):
                if filename.startswith("ava_speech_") and filename.endswith(".mp3"):
                    filepath = os.path.join(self.audio_folder, filename)
                    creation_time = os.path.getctime(filepath)
                    audio_files.append((filepath, creation_time))
            
            # Sort by creation time (newest first)
            audio_files.sort(key=lambda x: x[1], reverse=True)
            
            # Remove old files if we have too many
            if len(audio_files) > max_files:
                files_to_remove = audio_files[max_files:]
                for filepath, _ in files_to_remove:
                    try:
                        os.remove(filepath)
                        print(f"Removed old audio file: {os.path.basename(filepath)}")
                    except Exception as e:
                        print(f"Error removing file {filepath}: {e}")
                        
        except Exception as e:
            print(f"Error during audio cleanup: {e}")


# Convenience function for simple usage
def speak_text(text: str, voice_id: Optional[str] = None) -> bool:
    """
    Simple function to speak text using Murf TTS
    
    Args:
        text: Text to speak
        voice_id: Optional voice ID
        
    Returns:
        True if successful, False otherwise
    """
    try:
        murf = MurfTTS()
        audio_path = murf.text_to_speech(text, voice_id)
        if audio_path:
            murf.play_audio(audio_path)
            return True
        return False
    except Exception as e:
        print(f"Error speaking text: {e}")
        return False


if __name__ == "__main__":
    # Test the Murf TTS functionality
    print("Testing Murf TTS Integration...")
    
    try:
        murf = MurfTTS()
        
        # Test connection
        if murf.test_connection():
            print("✅ Murf TTS connection successful!")
        else:
            print("❌ Murf TTS connection failed!")
            exit(1)
        
        # Test voice list
        print("\nFetching available voices...")
        voices = murf.get_available_voices()
        if voices:
            print(f"✅ Found {len(voices.get('voices', []))} available voices")
        
        # Test text-to-speech
        test_text = "Hello! This is Ava, your AI voice assistant. I'm testing the text-to-speech functionality."
        print(f"\nConverting text to speech: '{test_text}'")
        
        audio_path = murf.text_to_speech(test_text)
        if audio_path:
            print(f"✅ Audio generated: {audio_path}")
            
            # Test playback
            print("Playing audio...")
            murf.play_audio(audio_path)
            
            # Wait for playback to finish
            while murf.is_playing:
                time.sleep(0.1)
            
            print("✅ Audio playback test completed!")
        else:
            print("❌ Failed to generate audio")
            
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Make sure to set your MURF_API_KEY in the .env file!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
