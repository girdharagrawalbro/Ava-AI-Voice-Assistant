"""
Main layout for Ava AI Assistant
Handles the chat interface and user interactions
"""

import flet as ft
import threading
import time
from datetime import datetime
from typing import List, Optional

from ui.components import (
    ChatBubble, MicrophoneButton, StatusIndicator, VolumeButton,
    ClearChatButton, TypingIndicator, WelcomeMessage, create_error_dialog,
    create_info_dialog, LoadingOverlay
)
from core.voice_input import VoiceInput
from core.gemini_response import GeminiResponse
from core.murf_tts import MurfTTS


class AvaLayout:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "Ava – AI Voice Assistant"
        self.page.theme_mode = ft.ThemeMode.LIGHT
        
        # Initialize components
        self.voice_input = None
        self.gemini_response = None
        self.murf_tts = None
        
        # UI state
        self.is_listening = False
        self.is_speaking = False
        self.is_muted = False
        self.chat_messages: List[ChatBubble] = []
        
        # Initialize UI components
        self.chat_column = ft.Column(
            controls=[],
            spacing=0,
            scroll=ft.ScrollMode.AUTO,
            expand=True,
            auto_scroll=True,
        )
        
        self.status_indicator = StatusIndicator("Initializing...", ft.Colors.ORANGE)
        self.mic_button = MicrophoneButton(self.on_mic_click, False)
        self.volume_button = VolumeButton(self.on_volume_click, False)
        self.clear_button = ClearChatButton(self.on_clear_chat)
        
        self.typing_indicator = None
        
        # Initialize the layout
        self.create_layout()
        
        # Initialize services in background
        self.initialize_services()

    def create_layout(self):
        """Create the main UI layout"""
        
        # Enhanced Header with modern styling
        header = ft.Container(
            content=ft.Row(
                controls=[
                    # Enhanced logo section
                    ft.Row(
                        controls=[
                            ft.Container(
                                content=ft.Text("🤖", size=24),
                                bgcolor=ft.Colors.BLUE_600,
                                border_radius=ft.border_radius.all(12),
                                padding=ft.padding.all(8),
                                shadow=ft.BoxShadow(
                                    spread_radius=1,
                                    blur_radius=6,
                                    color=ft.Colors.BLUE_200,
                                    offset=ft.Offset(0, 2),
                                ),
                            ),
                            ft.Column(
                                controls=[
                                    ft.Text(
                                        "Ava AI Assistant",
                                        size=22,
                                        weight=ft.FontWeight.BOLD,
                                        color=ft.Colors.BLUE_800,
                                    ),
                                    ft.Text(
                                        "✨ Your Intelligent Voice Helper",
                                        size=12,
                                        color=ft.Colors.BLUE_600,
                                        italic=True,
                                    ),
                                ],
                                spacing=0,
                                tight=True,
                            ),
                        ],
                        spacing=12,
                        alignment=ft.MainAxisAlignment.START,
                    ),
                    ft.Row(
                        controls=[
                            self.volume_button,
                            self.clear_button,
                        ],
                        spacing=8,
                    ),
                ],
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            ),
            padding=ft.padding.symmetric(horizontal=24, vertical=16),
            bgcolor=ft.Colors.with_opacity(0.95, ft.Colors.WHITE),
            border=ft.border.only(bottom=ft.border.BorderSide(1, ft.Colors.BLUE_100)),
            shadow=ft.BoxShadow(
                spread_radius=0,
                blur_radius=8,
                color=ft.Colors.with_opacity(0.1, ft.Colors.BLACK),
                offset=ft.Offset(0, 2),
            ),
        )
        
        # Enhanced Chat area with gradient background
        chat_container = ft.Container(
            content=self.chat_column,
            expand=True,
            padding=ft.padding.all(16),
            bgcolor=ft.Colors.GREY_50,
            gradient=ft.LinearGradient(
                begin=ft.alignment.top_center,
                end=ft.alignment.bottom_center,
                colors=[
                    ft.Colors.WHITE,
                    ft.Colors.BLUE_50,
                    ft.Colors.WHITE,
                ],
            ),
        )
        
        # Add enhanced welcome message initially
        self.chat_column.controls.append(WelcomeMessage())
        
        # Enhanced Bottom controls with modern styling
        bottom_controls = ft.Container(
            content=ft.Column(
                controls=[
                    # Enhanced Status indicator
                    ft.Container(
                        content=self.status_indicator,
                        alignment=ft.alignment.center,
                        padding=ft.padding.only(bottom=12),
                    ),
                    # Enhanced Microphone button
                    ft.Container(
                        content=self.mic_button,
                        alignment=ft.alignment.center,
                        padding=ft.padding.only(bottom=24),
                    ),
                ],
                spacing=0,
            ),
            bgcolor=ft.Colors.with_opacity(0.98, ft.Colors.WHITE),
            border=ft.border.only(top=ft.border.BorderSide(1, ft.Colors.BLUE_100)),
            shadow=ft.BoxShadow(
                spread_radius=0,
                blur_radius=12,
                color=ft.Colors.with_opacity(0.08, ft.Colors.BLACK),
                offset=ft.Offset(0, -2),
            ),
            gradient=ft.LinearGradient(
                begin=ft.alignment.top_center,
                end=ft.alignment.bottom_center,
                colors=[
                    ft.Colors.WHITE,
                    ft.Colors.BLUE_50,
                ],
                stops=[0.0, 1.0],
            ),
        )
        
        # Main layout
        self.page.add(
            ft.Column(
                controls=[
                    header,
                    chat_container,
                    bottom_controls,
                ],
                spacing=0,
                expand=True,
            )
        )
        
        self.page.update()

    def initialize_services(self):
        """Initialize AI services in background"""
        def init_services():
            try:
                self.update_status("Initializing voice recognition...", ft.Colors.ORANGE)
                
                # Initialize voice input
                self.voice_input = VoiceInput()
                if not self.voice_input.test_microphone():
                    self.show_error("Microphone Error", "Could not access microphone. Please check your microphone permissions.")
                    return
                
                self.update_status("Connecting to AI services...", ft.Colors.ORANGE)
                
                # Initialize Gemini
                self.gemini_response = GeminiResponse()
                if not self.gemini_response.test_connection():
                    self.show_error("AI Service Error", "Could not connect to Gemini AI. Please check your API key.")
                    return
                
                # Initialize Murf TTS
                self.murf_tts = MurfTTS()
                if not self.murf_tts.test_connection():
                    self.show_error("TTS Service Error", "Could not connect to Murf TTS. Please check your API key.")
                    return
                
                self.update_status("Ready to chat!", ft.Colors.GREEN)
                
            except Exception as e:
                print(f"Error initializing services: {e}")
                self.show_error("Initialization Error", f"Failed to initialize services: {str(e)}")
                self.update_status("Error - Check console", ft.Colors.RED)
        
        # Run initialization in background thread
        init_thread = threading.Thread(target=init_services, daemon=True)
        init_thread.start()

    def on_mic_click(self):
        """Handle microphone button click"""
        if not self.voice_input or not self.gemini_response or not self.murf_tts:
            self.show_error("Not Ready", "Services are still initializing. Please wait a moment.")
            return
        
        if self.is_listening:
            self.stop_listening()
        else:
            self.start_listening()

    def start_listening(self):
        """Start listening for voice input"""
        if self.is_speaking:
            # Stop current speech first
            self.murf_tts.stop_audio()
            self.is_speaking = False
        
        self.is_listening = True
        self.mic_button.update_state(True)
        self.update_status("Listening...", ft.Colors.RED)
        self.page.update()
        
        def listen_thread():
            try:
                # Listen for voice input
                text = self.voice_input.listen_once(timeout=10, phrase_time_limit=15)
                
                self.is_listening = False
                self.mic_button.update_state(False)
                
                if text:
                    self.process_voice_input(text)
                else:
                    self.update_status("No speech detected", ft.Colors.ORANGE)
                    time.sleep(2)
                    self.update_status("Ready to chat!", ft.Colors.GREEN)
                
                self.page.update()
                
            except Exception as e:
                print(f"Error in listening thread: {e}")
                self.is_listening = False
                self.mic_button.update_state(False)
                self.update_status("Error listening", ft.Colors.RED)
                self.page.update()
        
        # Run listening in background thread
        listen_thread = threading.Thread(target=listen_thread, daemon=True)
        listen_thread.start()

    def stop_listening(self):
        """Stop listening for voice input"""
        self.is_listening = False
        self.mic_button.update_state(False)
        self.update_status("Ready to chat!", ft.Colors.GREEN)
        self.page.update()

    def process_voice_input(self, text: str):
        """Process recognized voice input"""
        # Add user message to chat
        timestamp = datetime.now().strftime("%H:%M")
        user_bubble = ChatBubble(text, is_user=True, timestamp=timestamp)
        self.chat_column.controls.append(user_bubble)
        
        # Add typing indicator
        self.typing_indicator = TypingIndicator()
        self.chat_column.controls.append(self.typing_indicator)
        
        self.update_status("Thinking...", ft.Colors.BLUE)
        self.page.update()
        
        def process_thread():
            try:
                # Get AI response
                response = self.gemini_response.get_response(text)
                
                # Remove typing indicator
                if self.typing_indicator in self.chat_column.controls:
                    self.chat_column.controls.remove(self.typing_indicator)
                
                if response:
                    # Add AI response to chat
                    timestamp = datetime.now().strftime("%H:%M")
                    ai_bubble = ChatBubble(response, is_user=False, timestamp=timestamp)
                    self.chat_column.controls.append(ai_bubble)
                    self.page.update()
                    
                    # Convert to speech and play
                    if not self.is_muted:
                        self.speak_response(response)
                    else:
                        self.update_status("Ready to chat!", ft.Colors.GREEN)
                else:
                    self.update_status("Error getting response", ft.Colors.RED)
                
                self.page.update()
                
            except Exception as e:
                print(f"Error processing voice input: {e}")
                # Remove typing indicator
                if self.typing_indicator in self.chat_column.controls:
                    self.chat_column.controls.remove(self.typing_indicator)
                self.update_status("Error processing", ft.Colors.RED)
                self.page.update()
        
        # Run processing in background thread
        process_thread = threading.Thread(target=process_thread, daemon=True)
        process_thread.start()

    def speak_response(self, text: str):
        """Convert text to speech and play it"""
        self.is_speaking = True
        self.update_status("Speaking...", ft.Colors.PURPLE)
        
        def speak_finished():
            self.is_speaking = False
            self.update_status("Ready to chat!", ft.Colors.GREEN)
            self.page.update()
        
        # Use Murf TTS to speak the response
        self.murf_tts.speak_text(text, callback=speak_finished)

    def on_volume_click(self):
        """Handle volume button click"""
        self.is_muted = not self.is_muted
        self.volume_button.update_state(self.is_muted)
        
        if self.is_speaking and self.is_muted:
            self.murf_tts.stop_audio()
            self.is_speaking = False
            self.update_status("Ready to chat!", ft.Colors.GREEN)
        
        status = "Muted" if self.is_muted else "Unmuted"
        self.show_info("Audio", f"Audio {status.lower()}")
        self.page.update()

    def on_clear_chat(self):
        """Handle clear chat button click"""
        # Clear chat messages (keep welcome message)
        self.chat_column.controls = [WelcomeMessage()]
        
        # Reset conversation history
        if self.gemini_response:
            self.gemini_response.reset_conversation()
        
        # Clean up audio files
        if self.murf_tts:
            self.murf_tts.cleanup_audio_files(max_files=5)
        
        self.show_info("Chat Cleared", "Conversation history has been cleared")
        self.page.update()

    def update_status(self, status: str, color: str = ft.Colors.GREEN):
        """Update status indicator"""
        self.status_indicator.update_status(status, color)
        self.page.update()

    def show_error(self, title: str, message: str):
        """Show error dialog"""
        dialog = create_error_dialog(title, message)
        self.page.dialog = dialog
        dialog.open = True
        self.page.update()

    def show_info(self, title: str, message: str):
        """Show info dialog"""
        dialog = create_info_dialog(title, message)
        self.page.dialog = dialog
        dialog.open = True
        self.page.update()


def create_main_layout(page: ft.Page):
    """Create and initialize the main layout"""
    # Set page properties
    page.window_width = 400
    page.window_height = 700
    page.window_min_width = 350
    page.window_min_height = 500
    page.window_resizable = True
    page.padding = 0
    page.spacing = 0
    
    # Create the layout
    layout = AvaLayout(page)
    
    return layout
