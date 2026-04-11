"""
IVR (Interactive Voice Response) handler — state machine for phone-based case queries.
Flow: greeting → language_select → case_input → status → repeat/explain/helpline

For hackathon demo, this provides the menu logic.
Frontend renders via Web Speech API (browser-native, no cost).
"""
from typing import Dict, Optional
from enum import Enum


class IVRState(str, Enum):
    GREETING = "greeting"
    LANGUAGE_SELECT = "language_select"
    CASE_INPUT = "case_input"
    STATUS_DELIVERY = "status_delivery"
    EXPLAIN = "explain"
    HELPLINE = "helpline"
    END = "end"


# IVR menu text in multiple languages
IVR_PROMPTS = {
    "greeting": {
        "en": "Welcome to JusticeGrid Legal Aid Helpline. Press 1 for Hindi, 2 for English, 3 for Tamil, 4 for Bengali.",
        "hi": "JusticeGrid कानूनी सहायता हेल्पलाइन में आपका स्वागत है। हिंदी के लिए 1 दबाएं, अंग्रेजी के लिए 2, तमिल के लिए 3।",
    },
    "case_input": {
        "en": "Please enter your case number. For example: MH-2024-CR-10001.",
        "hi": "कृपया अपना केस नंबर बताएं। उदाहरण: MH-2024-CR-10001।",
        "ta": "உங்கள் வழக்கு எண்ணை உள்ளிடவும்.",
        "bn": "আপনার মামলার নম্বর দিন।",
    },
    "not_found": {
        "en": "Sorry, we could not find that case number. Please try again or press 9 for help.",
        "hi": "क्षमा करें, यह केस नंबर नहीं मिला। फिर से कोशिश करें या मदद के लिए 9 दबाएं।",
        "ta": "மன்னிக்கவும், வழக்கு எண் கிடைக்கவில்லை.",
        "bn": "দুঃখিত, মামলার নম্বর পাওয়া যায়নি।",
    },
    "menu": {
        "en": "Press 1 to hear the status again. Press 2 to ask 'what does that mean?'. Press 9 to speak to the DLSA helpline.",
        "hi": "1 दबाएं दोबारा सुनने के लिए। 2 दबाएं 'इसका मतलब क्या है?' जानने के लिए। 9 दबाएं DLSA हेल्पलाइन से बात करने के लिए।",
        "ta": "மீண்டும் கேட்க 1 அழுத்தவும். விளக்கம் கேட்க 2 அழுத்தவும். DLSA உதவிக்கு 9 அழுத்தவும்.",
    },
    "helpline": {
        "en": "Connecting you to the DLSA helpline. Please hold.",
        "hi": "आपको DLSA हेल्पलाइन से जोड़ रहे हैं। कृपया प्रतीक्षा करें।",
        "ta": "DLSA உதவி எண்ணுடன் இணைக்கிறோம். தயவுசெய்து காத்திருக்கவும்.",
        "bn": "DLSA হেল্পলাইনে সংযুক্ত করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।",
    },
}

# Language key selection
LANGUAGE_KEY_MAP = {
    "1": "hi",
    "2": "en",
    "3": "ta",
    "4": "bn",
    "5": "mr",
    "6": "te",
}


class IVRSession:
    """State machine for one IVR call session."""

    def __init__(self):
        self.state = IVRState.GREETING
        self.language = "hi"
        self.case_number = None
        self.last_status = None
        self.repeat_count = 0
        self.explain_count = 0

    def process_input(self, key_press: str, case_data: Optional[Dict] = None) -> Dict:
        """
        Process a keypad input and return the response.

        Returns: {
            "speech_text": str,    # Text for TTS to speak
            "state": str,          # Current IVR state
            "language": str,       # Current language
            "offer_helpline": bool,
        }
        """
        key = key_press.strip()

        if self.state == IVRState.GREETING:
            return self._handle_greeting(key)
        elif self.state == IVRState.LANGUAGE_SELECT:
            return self._handle_language_select(key)
        elif self.state == IVRState.CASE_INPUT:
            return self._handle_case_input(key, case_data)
        elif self.state == IVRState.STATUS_DELIVERY:
            return self._handle_status_menu(key)
        elif self.state == IVRState.EXPLAIN:
            return self._handle_explain(key)
        elif self.state == IVRState.HELPLINE:
            return self._connect_helpline()
        else:
            return self._handle_greeting(key)

    def _handle_greeting(self, key: str) -> Dict:
        self.state = IVRState.LANGUAGE_SELECT
        return {
            "speech_text": IVR_PROMPTS["greeting"].get("en", ""),
            "state": self.state,
            "language": "en",
            "offer_helpline": False,
        }

    def _handle_language_select(self, key: str) -> Dict:
        if key in LANGUAGE_KEY_MAP:
            self.language = LANGUAGE_KEY_MAP[key]
        self.state = IVRState.CASE_INPUT
        return {
            "speech_text": IVR_PROMPTS["case_input"].get(self.language, IVR_PROMPTS["case_input"]["en"]),
            "state": self.state,
            "language": self.language,
            "offer_helpline": False,
        }

    def _handle_case_input(self, case_number: str, case_data: Optional[Dict]) -> Dict:
        self.case_number = case_number

        if case_data:
            status = case_data.get("eligibility_status", "PENDING")
            days = case_data.get("detention_days", 0)

            status_texts = {
                "en": f"Case {case_number}. The person has been detained for {days} days. Status: {status}.",
                "hi": f"केस {case_number}। व्यक्ति {days} दिनों से हिरासत में है। स्थिति: {status}।",
                "ta": f"வழக்கு {case_number}. {days} நாட்களாக காவலில் உள்ளார். நிலை: {status}.",
            }
            self.last_status = status_texts.get(self.language, status_texts["en"])
            self.state = IVRState.STATUS_DELIVERY

            speech = self.last_status + "\n" + IVR_PROMPTS["menu"].get(self.language, IVR_PROMPTS["menu"]["en"])
        else:
            speech = IVR_PROMPTS["not_found"].get(self.language, IVR_PROMPTS["not_found"]["en"])
            self.state = IVRState.CASE_INPUT

        return {
            "speech_text": speech,
            "state": self.state,
            "language": self.language,
            "offer_helpline": False,
        }

    def _handle_status_menu(self, key: str) -> Dict:
        if key == "1":
            # Repeat status
            self.repeat_count += 1
            offer_helpline = self.repeat_count >= 3  # If asked 3+ times, offer helpline
            speech = self.last_status or "No status available."
            if offer_helpline:
                speech += "\n" + IVR_PROMPTS["helpline"].get(self.language, IVR_PROMPTS["helpline"]["en"])
            return {
                "speech_text": speech,
                "state": self.state,
                "language": self.language,
                "offer_helpline": offer_helpline,
            }
        elif key == "2":
            # Explain — "What does that mean?"
            self.explain_count += 1
            self.state = IVRState.EXPLAIN
            explain_texts = {
                "en": "Let me explain in simpler words. The person is in jail waiting for their court case. The court has not yet decided if they can go home.",
                "hi": "आसान शब्दों में समझाता हूं। व्यक्ति जेल में है और कोर्ट के फैसले का इंतज़ार कर रहा है। अभी कोर्ट ने फ़ैसला नहीं किया है कि वे घर जा सकते हैं या नहीं।",
                "ta": "எளிமையாக விளக்குகிறேன். நபர் சிறையில் உள்ளார், நீதிமன்ற முடிவுக்காக காத்திருக்கிறார்.",
            }
            return {
                "speech_text": explain_texts.get(self.language, explain_texts["en"]),
                "state": self.state,
                "language": self.language,
                "offer_helpline": self.explain_count >= 2,
            }
        elif key == "9":
            return self._connect_helpline()
        else:
            return {
                "speech_text": IVR_PROMPTS["menu"].get(self.language, IVR_PROMPTS["menu"]["en"]),
                "state": self.state,
                "language": self.language,
                "offer_helpline": False,
            }

    def _handle_explain(self, key: str) -> Dict:
        self.state = IVRState.STATUS_DELIVERY
        return {
            "speech_text": IVR_PROMPTS["menu"].get(self.language, IVR_PROMPTS["menu"]["en"]),
            "state": self.state,
            "language": self.language,
            "offer_helpline": False,
        }

    def _connect_helpline(self) -> Dict:
        self.state = IVRState.HELPLINE
        return {
            "speech_text": IVR_PROMPTS["helpline"].get(self.language, IVR_PROMPTS["helpline"]["en"]),
            "state": self.state,
            "language": self.language,
            "offer_helpline": True,
        }
