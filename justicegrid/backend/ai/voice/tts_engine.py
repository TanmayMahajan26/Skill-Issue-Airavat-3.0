"""
Text-to-Speech engine — gTTS integration for case status playback.
Supports Hindi, Tamil, Bengali, Marathi, Telugu, English.
Fallback: returns text for browser Web Speech API.
"""
import os
from typing import Dict, Optional

# Language code mapping for gTTS
GTTS_LANG_MAP = {
    "hi": "hi",
    "en": "en",
    "ta": "ta",
    "bn": "bn",
    "mr": "mr",
    "te": "te",
    "kn": "kn",
    "gu": "gu",
    "pa": "pa",
    "or": "or",  # May not be supported by gTTS — fallback to Hindi
}


def text_to_speech(text: str, language: str = "hi", output_path: str = None) -> Dict:
    """
    Convert text to speech audio.

    For hackathon demo, returns text + language for browser Web Speech API.
    When gTTS is available, generates actual MP3 files.

    Input: text string + language code
    Output: {text, language, audio_available, audio_path?, ssml_text}
    """
    gtts_lang = GTTS_LANG_MAP.get(language, "hi")

    # Try gTTS for actual audio generation
    try:
        from gtts import gTTS

        if output_path is None:
            output_path = os.path.join(os.path.dirname(__file__), f"output_{language}.mp3")

        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        tts.save(output_path)

        return {
            "text": text,
            "language": language,
            "audio_available": True,
            "audio_path": output_path,
            "ssml_text": f'<speak xml:lang="{gtts_lang}">{text}</speak>',
        }
    except ImportError:
        # gTTS not installed — return text for browser Web Speech API
        return {
            "text": text,
            "language": language,
            "audio_available": False,
            "audio_path": None,
            "ssml_text": f'<speak xml:lang="{gtts_lang}">{text}</speak>',
            "note": "Install gTTS for audio files. Browser Web Speech API can render this text.",
        }
    except Exception as e:
        return {
            "text": text,
            "language": language,
            "audio_available": False,
            "error": str(e),
        }


def get_supported_languages() -> list:
    """Return list of supported TTS languages."""
    return [
        {"code": "hi", "name": "Hindi"},
        {"code": "en", "name": "English"},
        {"code": "ta", "name": "Tamil"},
        {"code": "bn", "name": "Bengali"},
        {"code": "mr", "name": "Marathi"},
        {"code": "te", "name": "Telugu"},
        {"code": "kn", "name": "Kannada"},
        {"code": "gu", "name": "Gujarati"},
        {"code": "pa", "name": "Punjabi"},
    ]
