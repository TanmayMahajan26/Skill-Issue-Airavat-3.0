"""
Generate plain-language case status in 10+ Indian languages.
Uses Gemini for generation + legal glossary for term simplification.
"""
import os
import json
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-2.0-flash')
except Exception:
    gemini_model = None

# Load glossary
GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "legal_glossary.json")
try:
    with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
        LEGAL_GLOSSARY = json.load(f)
except FileNotFoundError:
    LEGAL_GLOSSARY = {}

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi", "bn": "Bengali",
    "ta": "Tamil", "te": "Telugu", "kn": "Kannada", "gu": "Gujarati",
    "or": "Odia", "pa": "Punjabi"
}

VERIFIED_LANGUAGES = {"en", "hi"}  # These have been human-reviewed


def generate_plain_status(case_summary: str, language: str = "hi") -> Dict:
    """
    Generate plain-language case status for families with no legal literacy.
    Called by Laptop A's backend via: POST /api/v1/comms/chat-simulate
    """
    lang_name = LANGUAGE_NAMES.get(language, "Hindi")

    if not gemini_model:
        return {
            "text": f"[Gemini unavailable] Case status: {case_summary}",
            "language": language,
            "needs_human_review": True,
        }

    prompt = f"""You are a helpful legal aid assistant. Generate a SIMPLE case status
update in {lang_name} language.

CRITICAL RULES:
- The reader has ZERO legal literacy. Use everyday words only.
- Do NOT use ANY legal jargon without explaining it in simple words.
- Do NOT give legal advice or predict outcomes.
- Do NOT use words like "likely", "probably", "will win/lose".
- Keep it under 100 words.
- Be compassionate and clear.

Case Information:
{case_summary}

Generate the status update in {lang_name}:"""

    try:
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()

        return {
            "text": text,
            "language": language,
            "needs_human_review": language not in VERIFIED_LANGUAGES,
        }
    except Exception as e:
        return {
            "text": f"Status generation error: {str(e)}",
            "language": language,
            "needs_human_review": True,
        }


def lookup_legal_term(term: str, language: str = "hi") -> Optional[str]:
    """
    Look up a legal term in the glossary.
    Called when user asks "what does X mean?"
    """
    term_lower = term.lower().strip()

    if term_lower in LEGAL_GLOSSARY:
        translations = LEGAL_GLOSSARY[term_lower]
        return translations.get(language, translations.get("en", "Definition not available."))

    # Try Gemini for terms not in glossary
    if gemini_model:
        try:
            lang_name = LANGUAGE_NAMES.get(language, "Hindi")
            prompt = f"""Explain the legal term "{term}" in {lang_name} in very simple words.
The reader has no legal education. Use everyday language only. Keep it under 30 words."""
            response = gemini_model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            pass

    return None


def process_chat_message(message: str, language: str = "hi", case_data: dict = None) -> Dict:
    """
    Process a family member's message via WhatsApp simulator.
    Called by Laptop A: POST /api/v1/comms/chat-simulate

    Input: {"message": "...", "language": "hi", "case_data": {...}}
    Output: {"response_text": "...", "language": "hi", "intent": "...", "offer_helpline": false}
    """
    message_lower = message.lower().strip()

    # Intent detection
    intent = "case_query"
    offer_helpline = False

    # Check for glossary lookup ("what does X mean?", "X kya hai?", "X என்ன?")
    glossary_triggers = ["what does", "meaning of", "kya hai", "kya hota", "matlab",
                         "என்ன", "কি", "काय आहे", "enmaanam"]
    for trigger in glossary_triggers:
        if trigger in message_lower:
            intent = "glossary_lookup"
            # Extract the term
            for term in LEGAL_GLOSSARY.keys():
                if term in message_lower:
                    explanation = lookup_legal_term(term, language)
                    return {
                        "response_text": explanation or f"Sorry, I cannot explain '{term}' right now.",
                        "language": language,
                        "intent": "glossary_lookup",
                        "offer_helpline": False,
                    }
            break

    # Check for distress/confusion
    distress_words = ["help", "confused", "don't understand", "samajh nahi", "kuch samajh",
                      "pareshan", "problem", "puratchi", "sahayata"]
    if any(w in message_lower for w in distress_words):
        offer_helpline = True
        intent = "distressed"

    # Generate response based on case data
    if case_data:
        case_summary = f"""Case: {case_data.get('case_number', 'Unknown')}
Status: {case_data.get('eligibility_status', 'Pending')}
Next hearing: {case_data.get('next_hearing_date', 'Not scheduled')}
Detained: {case_data.get('detention_days', '?')} days"""

        result = generate_plain_status(case_summary, language)
        response_text = result["text"]
    else:
        response_text = lookup_legal_term("next_hearing", language) or "Please provide a case number to check status."

    if offer_helpline:
        helpline_text = {
            "hi": "\n\nक्या आप DLSA हेल्पलाइन से बात करना चाहते हैं? हम आपको जोड़ सकते हैं।",
            "en": "\n\nWould you like to speak to the DLSA helpline? We can connect you.",
            "ta": "\n\nDLSA உதவி எண்ணுடன் பேச விரும்புகிறீர்களா?",
            "bn": "\n\nআপনি কি DLSA হেল্পলাইনে কথা বলতে চান?",
            "mr": "\n\nतुम्हाला DLSA हेल्पलाइनशी बोलायचे आहे का?",
        }
        response_text += helpline_text.get(language, helpline_text["en"])

    return {
        "response_text": response_text,
        "language": language,
        "intent": intent,
        "offer_helpline": offer_helpline,
    }
