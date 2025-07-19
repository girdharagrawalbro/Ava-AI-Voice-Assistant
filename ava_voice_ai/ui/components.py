"""
Reusable UI components for Ava AI Assistant
"""

import flet as ft
from typing import Optional, Callable


class ChatBubble(ft.Container):
    def __init__(self, message: str, is_user: bool = True, timestamp: Optional[str] = None):
        """
        Create a chat bubble
        
        Args:
            message: The message text
            is_user: True for user messages, False for AI messages
            timestamp: Optional timestamp string
        """
        # Choose colors and alignment based on sender
        if is_user:
            bg_color = ft.Colors.BLUE_400
            text_color = ft.Colors.WHITE
            alignment = ft.alignment.center_right
            margin_left = 50
            margin_right = 10
        else:
            bg_color = ft.Colors.GREY_200
            text_color = ft.Colors.BLACK87
            alignment = ft.alignment.center_left
            margin_left = 10
            margin_right = 50
        
        # Create message content
        message_content = [
            ft.Text(
                message,
                color=text_color,
                size=14,
                weight=ft.FontWeight.W_400,
            )
        ]
        
        if timestamp:
            message_content.append(
                ft.Text(
                    timestamp,
                    color=text_color if is_user else ft.Colors.GREY_600,
                    size=10,
                    italic=True,
                )
            )
        
        super().__init__(
            content=ft.Column(
                controls=message_content,
                spacing=2,
                tight=True,
            ),
            bgcolor=bg_color,
            border_radius=15,
            padding=ft.padding.all(12),
            margin=ft.margin.only(
                left=margin_left,
                right=margin_right,
                top=5,
                bottom=5
            ),
            alignment=alignment,
        )
        
        # Store these after super().__init__
        self.message = message
        self.is_user = is_user
        self.timestamp = timestamp


class MicrophoneButton(ft.Container):
    def __init__(self, on_click: Callable, is_listening: bool = False):
        """
        Create a microphone button
        
        Args:
            on_click: Function to call when button is clicked
            is_listening: Whether the microphone is currently listening
        """
        # Choose icon and color based on state
        if is_listening:
            icon = "mic"
            color = ft.Colors.RED_400
            tooltip = "Click to stop listening"
        else:
            icon = "mic_none"
            color = ft.Colors.BLUE_400
            tooltip = "Click to start voice input"
        
        super().__init__(
            content=ft.IconButton(
                icon=icon,
                icon_size=30,
                icon_color=ft.Colors.WHITE,
                tooltip=tooltip,
                on_click=lambda _: on_click(),
            ),
            bgcolor=color,
            border_radius=50,
            width=70,
            height=70,
            alignment=ft.alignment.center,
        )
        
        # Store these after super().__init__
        self.on_click = on_click
        self.is_listening = is_listening
    
    def update_state(self, is_listening: bool):
        """Update button state"""
        self.is_listening = is_listening
        
        if is_listening:
            self.content.icon = "mic"
            self.bgcolor = ft.Colors.RED_400
            self.content.tooltip = "Click to stop listening"
        else:
            self.content.icon = "mic_none"
            self.bgcolor = ft.Colors.BLUE_400
            self.content.tooltip = "Click to start voice input"


class StatusIndicator(ft.Container):
    def __init__(self, status: str = "Ready", color: str = ft.Colors.GREEN):
        """
        Create a status indicator
        
        Args:
            status: Status text to display
            color: Color of the indicator
        """
        super().__init__(
            content=ft.Row(
                controls=[
                    ft.Container(
                        width=10,
                        height=10,
                        bgcolor=color,
                        border_radius=5,
                    ),
                    ft.Text(
                        status,
                        size=12,
                        color=ft.Colors.GREY_700,
                    ),
                ],
                spacing=8,
                alignment=ft.MainAxisAlignment.CENTER,
            ),
            padding=ft.padding.symmetric(horizontal=12, vertical=6),
            border_radius=20,
            bgcolor=ft.Colors.GREY_100,
        )
        
        # Store these after super().__init__
        self.status = status
        self.indicator_color = color
    
    def update_status(self, status: str, color: str = ft.Colors.GREEN):
        """Update status indicator"""
        self.status = status
        self.indicator_color = color
        
        # Update the indicator color
        self.content.controls[0].bgcolor = color
        # Update the status text
        self.content.controls[1].value = status


class VolumeButton(ft.Container):
    def __init__(self, on_click: Callable, is_muted: bool = False):
        """
        Create a volume/mute button
        
        Args:
            on_click: Function to call when button is clicked
            is_muted: Whether audio is currently muted
        """
        # Choose icon based on state
        icon = "volume_off" if is_muted else "volume_up"
        tooltip = "Unmute" if is_muted else "Mute"
        
        super().__init__(
            content=ft.IconButton(
                icon=icon,
                icon_size=20,
                icon_color=ft.Colors.GREY_700,
                tooltip=tooltip,
                on_click=lambda _: on_click(),
            ),
            width=40,
            height=40,
            alignment=ft.alignment.center,
        )
        
        # Store these after super().__init__
        self.on_click = on_click
        self.is_muted = is_muted
    
    def update_state(self, is_muted: bool):
        """Update button state"""
        self.is_muted = is_muted
        self.content.icon = "volume_off" if is_muted else "volume_up"
        self.content.tooltip = "Unmute" if is_muted else "Mute"


class ClearChatButton(ft.Container):
    def __init__(self, on_click: Callable):
        """
        Create a clear chat button
        
        Args:
            on_click: Function to call when button is clicked
        """
        super().__init__(
            content=ft.IconButton(
                icon="delete_outline",
                icon_size=20,
                icon_color=ft.Colors.GREY_700,
                tooltip="Clear conversation",
                on_click=lambda _: on_click(),
            ),
            width=40,
            height=40,
            alignment=ft.alignment.center,
        )


class TypingIndicator(ft.Container):
    def __init__(self):
        """Create a typing indicator animation"""
        super().__init__(
            content=ft.Row(
                controls=[
                    ft.Text("Ava is thinking", size=12, color=ft.Colors.GREY_600, italic=True),
                    ft.ProgressRing(width=16, height=16, stroke_width=2),
                ],
                spacing=8,
                alignment=ft.MainAxisAlignment.CENTER,
            ),
            padding=ft.padding.all(10),
            margin=ft.margin.only(left=10, right=50, top=5, bottom=5),
            bgcolor=ft.Colors.GREY_100,
            border_radius=15,
        )


class WelcomeMessage(ft.Container):
    def __init__(self):
        """Create a welcome message"""
        super().__init__(
            content=ft.Column(
                controls=[
                    ft.Text(
                        "👋 Hi! I'm Ava",
                        size=24,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.BLUE_600,
                        text_align=ft.TextAlign.CENTER,
                    ),
                    ft.Text(
                        "Your AI voice assistant",
                        size=16,
                        color=ft.Colors.GREY_600,
                        text_align=ft.TextAlign.CENTER,
                    ),
                    ft.Text(
                        "Click the microphone button to start talking!",
                        size=14,
                        color=ft.Colors.GREY_500,
                        text_align=ft.TextAlign.CENTER,
                        italic=True,
                    ),
                ],
                spacing=8,
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            padding=ft.padding.all(20),
            margin=ft.margin.all(20),
            bgcolor=ft.Colors.BLUE_50,
            border_radius=15,
            border=ft.border.all(1, ft.Colors.BLUE_200),
        )


def create_error_dialog(title: str, message: str) -> ft.AlertDialog:
    """
    Create an error dialog
    
    Args:
        title: Dialog title
        message: Error message
        
    Returns:
        AlertDialog instance
    """
    return ft.AlertDialog(
        title=ft.Text(title, weight=ft.FontWeight.BOLD),
        content=ft.Text(message),
        actions=[
            ft.TextButton("OK", on_click=lambda e: e.control.page.close(e.control.parent))
        ],
    )


def create_info_dialog(title: str, message: str) -> ft.AlertDialog:
    """
    Create an info dialog
    
    Args:
        title: Dialog title
        message: Info message
        
    Returns:
        AlertDialog instance
    """
    return ft.AlertDialog(
        title=ft.Text(title, weight=ft.FontWeight.BOLD),
        content=ft.Text(message),
        actions=[
            ft.TextButton("OK", on_click=lambda e: e.control.page.close(e.control.parent))
        ],
    )


class LoadingOverlay(ft.Container):
    def __init__(self, message: str = "Loading..."):
        """
        Create a loading overlay
        
        Args:
            message: Loading message to display
        """
        super().__init__(
            content=ft.Column(
                controls=[
                    ft.ProgressRing(width=50, height=50, stroke_width=4),
                    ft.Text(
                        message,
                        size=16,
                        color=ft.Colors.WHITE,
                        text_align=ft.TextAlign.CENTER,
                    ),
                ],
                spacing=20,
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                alignment=ft.MainAxisAlignment.CENTER,
            ),
            bgcolor=ft.Colors.with_opacity(0.8, ft.Colors.BLACK),
            alignment=ft.alignment.center,
            width=200,
            height=150,
            border_radius=10,
        )
