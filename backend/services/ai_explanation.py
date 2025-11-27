from services.rag_engine import search_knowledge
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")


def generate_explanation(data):
    """
    Vector-RAG powered Gemini explanation engine
    """

    # ✅ 1. Build safe query using correct keys from main.py
    query = f"""
    {data.get('metal_type')} 
    {data.get('process_type')} 
    circularity sustainability recycling LCA standards
    """

    research_context = search_knowledge(query)

    if not research_context:
        research_context = "No specific research found. Use general sustainability principles."

    # ✅ 2. Build structured smart prompt
    prompt = f"""
You are a professional sustainability expert.

Use ONLY the following verified research context:
{research_context}

Now analyze this project data:
{data}

Explain clearly:
- What the sustainability performance means
- Whether it is good, moderate, or poor
- Why the impact is at this level
- How circularity can be improved
- Which scenario is best and why
- Provide practical improvement suggestions
- Reference the research where relevant

Use clear professional language.
"""

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    try:
        response = requests.post(
            f"{url}?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {"parts": [{"text": prompt}]}
                ]
            },
            timeout=30
        )

        result = response.json()

        if "candidates" not in result:
            return f"Gemini Error: {result}"

        return result["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"AI Explanation Error: {str(e)}"
