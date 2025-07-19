"""
Voice input module for Ava AI Assistant
Handles speech recognition and audio recording
"""

import speech_recognition as sr
import pyaudio
import threading
import time
from typing import Optional, Callable


class VoiceInput:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.is_listening = False
        self.audio_data = None
        
        # Adjust for ambient noise on initialization
        with self.microphone as source:
            print("Calibrating microphone for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            print("Microphone calibrated!")

    def listen_once(self, timeout: int = 5, phrase_time_limit: int = 10) -> Optional[str]:
        """
        Listen for a single phrase and return the transcribed text
        
        Args:
            timeout: Maximum time to wait for speech to start
            phrase_time_limit: Maximum time to record after speech starts
            
        Returns:
            Transcribed text or None if recognition failed
        """
        try:
            with self.microphone as source:
                print("Listening...")
                # Listen for audio with timeout
                audio = self.recognizer.listen(
                    source, 
                    timeout=timeout, 
                    phrase_time_limit=phrase_time_limit
                )
                
            print("Processing speech...")
            # Use Google's speech recognition
            text = self.recognizer.recognize_google(audio)
            print(f"Recognized: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("Listening timeout - no speech detected")
            return None
        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during speech recognition: {e}")
            return None

    def listen_continuously(self, callback: Callable[[str], None], stop_event: threading.Event):
        """
        Continuously listen for voice input until stop_event is set
        
        Args:
            callback: Function to call with recognized text
            stop_event: Event to signal when to stop listening
        """
        print("Starting continuous listening...")
        
        while not stop_event.is_set():
            try:
                with self.microphone as source:
                    # Quick ambient noise adjustment
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    
                    # Listen for audio
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                
                # Recognize speech in background thread
                def recognize_audio():
                    try:
                        text = self.recognizer.recognize_google(audio)
                        if text.strip():
                            callback(text)
                    except sr.UnknownValueError:
                        pass  # Ignore unrecognized audio
                    except sr.RequestError as e:
                        print(f"Recognition service error: {e}")
                        
                # Start recognition in separate thread to avoid blocking
                recognition_thread = threading.Thread(target=recognize_audio, daemon=True)
                recognition_thread.start()
                
            except sr.WaitTimeoutError:
                # Timeout is expected in continuous mode
                continue
            except Exception as e:
                print(f"Error in continuous listening: {e}")
                time.sleep(1)  # Brief pause before retrying

    def test_microphone(self) -> bool:
        """
        Test if microphone is working
        
        Returns:
            True if microphone is accessible, False otherwise
        """
        try:
            with self.microphone as source:
                # Just test if we can access the microphone, timeout is expected
                self.recognizer.listen(source, timeout=0.5, phrase_time_limit=0.5)
                return True
        except sr.WaitTimeoutError:
            # Timeout is normal - microphone is accessible but no speech
            return True
        except Exception as e:
            print(f"Microphone test failed: {e}")
            return False

    def list_microphones(self) -> list:
        """
        Get list of available microphones
        
        Returns:
            List of microphone names
        """
        return sr.Microphone.list_microphone_names()


# Convenience function for simple usage
def record_and_transcribe(timeout: int = 5) -> Optional[str]:
    """
    Simple function to record audio and return transcribed text
    
    Args:
        timeout: Maximum time to wait for speech
        
    Returns:
        Transcribed text or None if failed
    """
    voice_input = VoiceInput()
    return voice_input.listen_once(timeout=timeout)


if __name__ == "__main__":
    # Test the voice input functionality
    print("Testing Voice Input...")
    
    voice = VoiceInput()
    
    # Test microphone
    if voice.test_microphone():
        print("✅ Microphone is working!")
    else:
        print("❌ Microphone test failed!")
        exit(1)
    
    # Test single recording
    print("\nSay something (you have 10 seconds)...")
    result = voice.listen_once(timeout=10)
    
    if result:
        print(f"✅ You said: '{result}'")
    else:
        print("❌ No speech detected or recognition failed")
