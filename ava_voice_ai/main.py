# import flet as ft
# import sys
# import os
# from pathlib import Path

# # Add the project root to Python path
# project_root = Path(__file__).parent
# sys.path.insert(0, str(project_root))

# from ui.layout import create_main_layout


# # def main(page: ft.Page):
# #     try:
# #         # Set application-wide properties
# #         page.title = "Ava - AI Voice Assistant"
# #         page.theme_mode = ft.ThemeMode.LIGHT
# #         page.window.title = "Ava AI Assistant"
        
# #         # Create the main layout
# #         layout = create_main_layout(page)
        
# #         print("🚀 Ava AI Assistant started successfully!")
# #         print("📱 UI is now available in the desktop app window")
# #         print("🎤 Click the microphone button to start voice conversations")
# #         print("⚙️  Make sure to set your API keys in the .env file")
        
# #     except Exception as e:
# #         print(f"❌ Error starting Ava AI Assistant: {e}")
        
# #         # Show error in UI
# #         error_text = ft.Text(
# #             f"Error starting application:\n{str(e)}",
# #             size=14,
# #             color=ft.Colors.RED,
# #             text_align=ft.TextAlign.CENTER,
# #         )
        
# #         page.add(
# #             ft.Container(
# #                 content=ft.Column(
# #                     controls=[
# #                         ft.Text(
# #                             "❌ Ava AI Assistant",
# #                             size=20,
# #                             weight=ft.FontWeight.BOLD,
# #                             color=ft.Colors.RED,
# #                             text_align=ft.TextAlign.CENTER,
# #                         ),
# #                         error_text,
# #                         ft.Text(
# #                             "Please check your configuration and try again.",
# #                             size=12,
# #                             color=ft.Colors.GREY_600,
# #                             text_align=ft.TextAlign.CENTER,
# #                             italic=True,
# #                         ),
# #                     ],
# #                     spacing=10,
# #                     horizontal_alignment=ft.CrossAxisAlignment.CENTER,
# #                 ),
# #                 padding=ft.padding.all(20),
# #                 alignment=ft.alignment.center,
# #                 expand=True,
# #             )
# #         )
        
# #         page.update()


# def check_environment():
#     """Check if environment is properly configured"""
#     issues = []
    
#     # Check if .env file exists
#     env_file = project_root / ".env"
#     if not env_file.exists():
#         issues.append("❌ .env file not found. Copy .env.example to .env and add your API keys.")
    
#     # Check for required packages (basic check)
#     try:
#         import speech_recognition
#         import google.generativeai
#         import requests
#         import audioplayer
#     except ImportError as e:
#         issues.append(f"❌ Missing required package: {e}")
    
#     return issues


# if __name__ == "__main__":
#     print("🤖 Starting Ava AI Voice Assistant...")
#     print("=" * 50)
    
#     # Check environment
#     issues = check_environment()
    
#     if issues:
#         print("⚠️  Configuration Issues Found:")
#         for issue in issues:
#             print(f"   {issue}")
#         print("\n📋 To fix these issues:")
#         print("   1. Copy .env.example to .env")
#         print("   2. Add your Google API key and Murf API key to .env")
#         print("   3. Install dependencies: pip install -r requirements.txt")
#         print("   4. Run the app again")
#         print("\n" + "=" * 50)
    
#     # Start the Flet app
#     try:
#         ft.app(
#             target=main,
#             assets_dir="assets",  # Include assets directory
#             port=0,  # Use any available port
#             view=ft.AppView.FLET_APP,  # Desktop app mode
#         )
#     except KeyboardInterrupt:
#         print("\n👋 Goodbye! Thanks for using Ava AI Assistant.")
#     except Exception as e:
#         print(f"\n❌ Fatal error: {e}")
#         print("Please check the console output above for more details.")
