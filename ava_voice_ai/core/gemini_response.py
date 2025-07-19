"""
Gemini AI response module for Ava AI Assistant
Handles conversation with Google's Gemini AI
"""

import google.generativeai as genai
from dotenv import load_dotenv
import os
from typing import Optional, List, Dict
import time

# Load environment variables
load_dotenv()


class GeminiResponse:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')
        
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables. Please check your .env file.")
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Initialize conversation history
        self.conversation_history: List[Dict[str, str]] = []
        
        # Set personality for Ava
        self.system_prompt = """You are Ava, a friendly and helpful AI voice assistant. 
        You should:
        - Be conversational and natural in your responses
        - Keep responses concise but informative (1-3 sentences typically)
        - Be helpful, empathetic, and engaging
        - Remember the context of our conversation
        - Ask follow-up questions when appropriate
        - Sound like you're having a natural conversation, not reading a manual
        
        Since this is a voice conversation, avoid using formatting like bullet points, 
        numbered lists, or special characters unless absolutely necessary."""
        
        # Add system prompt to conversation history
        self.conversation_history.append({
            "role": "system", 
            "content": self.system_prompt
        })

    def get_response(self, user_input: str, max_retries: int = 3) -> Optional[str]:
        """
        Get response from Gemini AI
        
        Args:
            user_input: User's message/question
            max_retries: Maximum number of retry attempts
            
        Returns:
            AI response text or None if failed
        """
        if not user_input or not user_input.strip():
            return "I didn't catch that. Could you please repeat?"
        
        # Add user input to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_input.strip()
        })
        
        # Prepare the full conversation context
        conversation_text = self._build_conversation_context()
        
        for attempt in range(max_retries):
            try:
                print(f"Sending to Gemini (attempt {attempt + 1})...")
                
                # Generate response
                response = self.model.generate_content(conversation_text)
                
                if response.text:
                    ai_response = response.text.strip()
                    
                    # Add AI response to conversation history
                    self.conversation_history.append({
                        "role": "assistant",
                        "content": ai_response
                    })
                    
                    # Keep conversation history manageable (last 20 exchanges)
                    if len(self.conversation_history) > 41:  # 1 system + 20 exchanges
                        # Keep system prompt + last 20 exchanges
                        self.conversation_history = [self.conversation_history[0]] + self.conversation_history[-40:]
                    
                    print(f"Gemini response: {ai_response}")
                    return ai_response
                else:
                    print("Empty response from Gemini")
                    if attempt < max_retries - 1:
                        time.sleep(1)
                        continue
                        
            except Exception as e:
                print(f"Error getting Gemini response (attempt {attempt + 1}): {e}")
                
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
        
        # If all attempts failed, return a fallback response
        fallback_response = "I'm having trouble connecting right now. Could you try asking again?"
        
        self.conversation_history.append({
            "role": "assistant",
            "content": fallback_response
        })
        
        return fallback_response

    def _build_conversation_context(self) -> str:
        """
        Build conversation context for Gemini
        
        Returns:
            Formatted conversation string
        """
        context_parts = []
        
        for message in self.conversation_history:
            role = message["role"]
            content = message["content"]
            
            if role == "system":
                context_parts.append(f"System: {content}")
            elif role == "user":
                context_parts.append(f"User: {content}")
            elif role == "assistant":
                context_parts.append(f"Ava: {content}")
        
        return "\n\n".join(context_parts) + "\n\nAva:"

    def reset_conversation(self):
        """Reset the conversation history"""
        self.conversation_history = [{
            "role": "system",
            "content": self.system_prompt
        }]
        print("Conversation history reset!")

    def get_conversation_summary(self) -> str:
        """
        Get a summary of the current conversation
        
        Returns:
            Summary of conversation history
        """
        if len(self.conversation_history) <= 1:  # Only system prompt
            return "No conversation yet."
        
        user_messages = len([msg for msg in self.conversation_history if msg["role"] == "user"])
        ai_messages = len([msg for msg in self.conversation_history if msg["role"] == "assistant"])
        
        return f"Conversation: {user_messages} user messages, {ai_messages} AI responses"

    def test_connection(self) -> bool:
        """
        Test the connection to Gemini API
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            test_response = self.model.generate_content("Hello! Please respond with just 'Hello back!' to test the connection.")
            return test_response.text is not None
        except Exception as e:
            print(f"Gemini connection test failed: {e}")
            return False


# Convenience function for simple usage
def ask_gemini(question: str) -> Optional[str]:
    """
    Simple function to ask Gemini a question
    
    Args:
        question: Question to ask
        
    Returns:
        Gemini's response or None if failed
    """
    try:
        gemini = GeminiResponse()
        return gemini.get_response(question)
    except Exception as e:
        print(f"Error asking Gemini: {e}")
        return None


if __name__ == "__main__":
    # Test the Gemini integration
    print("Testing Gemini Integration...")
    
    try:
        gemini = GeminiResponse()
        
        # Test connection
        if gemini.test_connection():
            print("✅ Gemini connection successful!")
        else:
            print("❌ Gemini connection failed!")
            exit(1)
        
        # Test conversation
        print("\nTesting conversation...")
        
        response1 = gemini.get_response("Hello! What's your name?")
        print(f"Response 1: {response1}")
        
        response2 = gemini.get_response("What can you help me with?")
        print(f"Response 2: {response2}")
        
        print(f"\n{gemini.get_conversation_summary()}")
        
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Make sure to set your GOOGLE_API_KEY in the .env file!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
