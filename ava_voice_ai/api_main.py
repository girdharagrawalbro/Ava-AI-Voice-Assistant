import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import asyncio
import threading
from typing import Optional, Dict, Any
import json

# Set UTF-8 encoding for Windows
if sys.platform.startswith('win'):
    import locale
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.voice_input import VoiceInput
from core.gemini_response import GeminiResponse
from core.murf_tts import MurfTTS

# Initialize services
voice_input: Optional[VoiceInput] = None
gemini_response: Optional[GeminiResponse] = None
murf_tts: Optional[MurfTTS] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    global voice_input, gemini_response, murf_tts
    
    # Startup
    try:
        print("Initializing Ava AI services...")
        
        # Initialize Voice Input
        voice_input = VoiceInput()
        if not voice_input.test_microphone():
            print("WARNING: Microphone test failed")
        else:
            print("SUCCESS: Voice input initialized")
        
        # Initialize Gemini
        gemini_response = GeminiResponse()
        if not gemini_response.test_connection():
            print("WARNING: Gemini AI connection failed")
        else:
            print("SUCCESS: Gemini AI initialized")
        
        # Initialize Murf TTS
        murf_tts = MurfTTS()
        if not murf_tts.test_connection():
            print("WARNING: Murf TTS connection failed")
        else:
            print("SUCCESS: Murf TTS initialized")
            
        print("API server ready!")
        
    except Exception as e:
        print(f"ERROR: Error initializing services: {e}")
        # Don't prevent startup, use fallback services
    
    yield
    
    # Shutdown
    print("Shutting down Ava AI services...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Ava AI Voice Assistant API",
    description="HTTP API for Ava AI Voice Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Electron app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static audio files
audio_dir = os.path.join(os.path.dirname(__file__), "assets", "audio")
os.makedirs(audio_dir, exist_ok=True)
app.mount("/audio", StaticFiles(directory=audio_dir), name="audio")

# Request/Response Models
class VoiceRequest(BaseModel):
    timeout: int = 10
    phrase_time_limit: int = 15

class GeminiRequest(BaseModel):
    text: str
    conversation_history: Optional[list] = None

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    style: Optional[str] = None
    speed: float = 1.0

class APIResponse(BaseModel):
    success: bool
    data: Optional[Dict[Any, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None

# API Endpoints
            
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Ava AI Voice Assistant API", 
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/status")
async def get_status():
    """Get service status"""
    status = {
        "voice_input": voice_input.test_microphone() if voice_input else False,
        "gemini_ai": gemini_response.test_connection() if gemini_response else False,
        "murf_tts": murf_tts.test_connection() if murf_tts else False
    }
    
    return APIResponse(
        success=True,
        data=status,
        message="Service status retrieved"
    )

@app.post("/voice")
async def start_voice_recognition(request: VoiceRequest):
    """Start voice recognition and return transcribed text"""
    if not voice_input:
        raise HTTPException(status_code=503, detail="Voice input service not available")
    
    try:
        # Run voice recognition in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(
            None, 
            voice_input.listen_once, 
            request.timeout, 
            request.phrase_time_limit
        )
        
        if text:
            return APIResponse(
                success=True,
                data={"text": text, "duration": request.timeout},
                message="Voice recognition successful"
            )
        else:
            return APIResponse(
                success=False,
                message="No speech detected",
                error="TIMEOUT_OR_NO_SPEECH"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice recognition failed: {str(e)}")

@app.post("/gemini")
async def get_gemini_response(request: GeminiRequest):
    """Get AI response from Gemini"""
    if not gemini_response:
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        # Run Gemini request in thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            gemini_response.get_response,
            request.text
        )
        
        if response:
            return APIResponse(
                success=True,
                data={
                    "response": response,
                    "input": request.text
                },
                message="AI response generated"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to get AI response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini AI error: {str(e)}")

@app.post("/murf")
async def convert_to_speech(request: TTSRequest):
    """Convert text to speech using Murf TTS"""
    if not murf_tts:
        raise HTTPException(status_code=503, detail="Murf TTS service not available")
    
    try:
        # Run TTS in thread pool
        loop = asyncio.get_event_loop()
        audio_path = await loop.run_in_executor(
            None,
            murf_tts.text_to_speech,
            request.text,
            request.voice_id,
            request.style,
            request.speed
        )
        
        if audio_path and os.path.exists(audio_path):
            # Return relative path for frontend
            filename = os.path.basename(audio_path)
            audio_url = f"/audio/{filename}"
            
            return APIResponse(
                success=True,
                data={
                    "audio_url": audio_url,
                    "audio_path": audio_path,
                    "filename": filename,
                    "text": request.text
                },
                message="Text-to-speech conversion successful"
            )
        else:
            # Try fallback TTS
            if murf_tts.fallback_tts:
                return APIResponse(
                    success=True,
                    data={
                        "fallback": True,
                        "text": request.text,
                        "message": "Using system TTS (no audio file generated)"
                    },
                    message="Using fallback TTS"
                )
            else:
                raise HTTPException(status_code=500, detail="Text-to-speech conversion failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.get("/voices")
async def get_available_voices():
    """Get available voices"""
    if not murf_tts:
        raise HTTPException(status_code=503, detail="Murf TTS service not available")
    
    try:
        voices = murf_tts.get_available_voices()
        return APIResponse(
            success=True,
            data=voices,
            message="Available voices retrieved"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting voices: {str(e)}")

@app.delete("/audio/{filename}")
async def delete_audio_file(filename: str):
    """Delete a specific audio file"""
    try:
        file_path = os.path.join(audio_dir, filename)
        if os.path.exists(file_path) and filename.startswith("ava_speech_"):
            os.remove(file_path)
            return APIResponse(
                success=True,
                message=f"Audio file {filename} deleted"
            )
        else:
            raise HTTPException(status_code=404, detail="Audio file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

@app.post("/cleanup")
async def cleanup_audio_files():
    """Clean up old audio files"""
    if not murf_tts:
        raise HTTPException(status_code=503, detail="Murf TTS service not available")
    
    try:
        murf_tts.cleanup_audio_files(max_files=10)
        return APIResponse(
            success=True,
            message="Audio files cleaned up"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning up files: {str(e)}")

@app.post("/stop-audio")
async def stop_audio_playback():
    """Stop current audio playback"""
    if not murf_tts:
        raise HTTPException(status_code=503, detail="Murf TTS service not available")
    
    try:
        murf_tts.stop_audio()
        return APIResponse(
            success=True,
            message="Audio playback stopped"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error stopping audio: {str(e)}")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"success": False, "error": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )

import socket

def find_free_port(start_port: int = 8000) -> int:
    """Find a free port starting from the given port"""
    for port in range(start_port, start_port + 10):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"No free port found in range {start_port} to {start_port + 9}")

def run_api_server(host: str = "127.0.0.1", port: int = 8000):
    """Run the FastAPI server"""
    # Find a free port
    try:
        free_port = find_free_port(port)
        if free_port != port:
            print(f"Port {port} not available, using port {free_port}")
        port = free_port
    except RuntimeError as e:
        print(f"ERROR: {e}")
        return
    
    print(f"Starting Ava AI API server on http://{host}:{port}")
    print("Endpoints available:")
    print(f"   - GET  http://{host}:{port}/")
    print(f"   - GET  http://{host}:{port}/status")
    print(f"   - POST http://{host}:{port}/voice")
    print(f"   - POST http://{host}:{port}/gemini")
    print(f"   - POST http://{host}:{port}/murf")
    print(f"   - GET  http://{host}:{port}/voices")
    print(f"   - GET  http://{host}:{port}/audio/{{filename}}")
    print(f"   - POST http://{host}:{port}/cleanup")
    print(f"   - POST http://{host}:{port}/stop-audio")
    
    uvicorn.run(
        app, 
        host=host, 
        port=port, 
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Ava AI Voice Assistant API Server")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    
    args = parser.parse_args()
    
    try:
        run_api_server(args.host, args.port)
    except KeyboardInterrupt:
        print("\nAPI server stopped by user")
    except Exception as e:
        print(f"Fatal error: {e}")
