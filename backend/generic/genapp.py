import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json
import re

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def create_app(user_prompt: str):
    prompt = f'''
Create a complete, fully functional HTML application for: {user_prompt}

CRITICAL Requirements:
1. Create a WORKING, PLAYABLE application - not a demo or placeholder
2. Include ALL CSS in <style> tags
3. DO NOT include any <script> tags in the HTML
4. Use event listeners properly (onclick, addEventListener, etc.)
5. Make all interactive elements actually work (buttons, clicks, keyboard input)
6. Include game logic, win conditions, score tracking if applicable
7. Use modern JavaScript (ES6+) with proper DOM manipulation
8. Make it visually appealing with modern CSS
9. Test logic carefully - make sure everything functions correctly
10. Add proper game state management if it's a game
11. Make it responsive for different screen sizes

**CRITICAL: DO NOT use localStorage, sessionStorage, or any browser storage APIs. Store all data in JavaScript variables only.**

For games specifically:
- Implement full game mechanics (not just UI)
- Add win/lose conditions
- Include restart functionality
- Make all controls responsive to user input
- Add visual feedback for all interactions
- Use in-memory state management (variables) instead of localStorage

IMPORTANT OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object, nothing else. No markdown, no backticks, no explanations.
The JSON should have exactly TWO fields:

{{
  "html": "<!DOCTYPE html><html><head><style>...</style></head><body>...</body></html>",
  "script": "const gameBoard = ...; function handleClick() {{ ... }}"
}}

The "html" field contains complete HTML with styles but NO <script> tags.
The "script" field contains all JavaScript code as a plain string (no <script> wrapper).

Make sure the application is FULLY FUNCTIONAL and READY TO USE immediately.'''

    response = client.models.generate_content(
                model = "gemini-flash-latest",
                contents = prompt)
    
    import json
    import re
    
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        text = response.text.strip()
        
        if text.startswith('```'):
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            text = text.strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print("Failed to parse response:")
            print(response.text[:500]) 
            raise ValueError(f"Could not parse JSON from Gemini response: {e}")