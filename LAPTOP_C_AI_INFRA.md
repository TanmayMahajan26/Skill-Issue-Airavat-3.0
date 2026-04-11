# LAPTOP C — AI/NLP + Infrastructure Lead: Complete Instructions

> **Your role**: You are the INTELLIGENCE and the DEPLOYER. Every ML model, NLP pipeline, Gemini call, and the final deployment is yours.
> **Your folder**: `ai/` — ONLY you edit files here. You also handle deployment (Render + Vercel).
> **You start after Laptop A pushes** (minute ~10). You work independently until integration with A at ~Hour 14.

---

## Pre-requisites (Install BEFORE the hackathon)

```bash
# Python 3.11+
python --version

# Install packages
pip install google-generativeai scikit-learn xgboost pandas numpy
pip install python-Levenshtein indic-transliteration
pip install easyocr pdfplumber Pillow
pip install flwr[simulation] opacus torch
pip install joblib faker gTTS
pip install httpx python-dotenv

# Git
git --version

# Docker (for federated learning demo + deployment)
docker --version
```

---

## Step-by-Step Instructions

### STEP 1 (Minute 10): Clone the repo

Wait for Laptop A to message that the repo is ready.

```bash
git clone https://github.com/THEIR_USERNAME/justicegrid.git
cd justicegrid
```

Create `.env` with the Gemini API key and other values A shares.

---

### STEP 2 (Minute 15-30): Setup AI project

Create `ai/requirements.txt`:
```
google-generativeai==0.8.0
scikit-learn==1.4.0
xgboost==2.0.3
pandas==2.2.0
numpy==1.26.3
python-Levenshtein==0.25.1
indic-transliteration==2.3.44
easyocr==1.7.1
pdfplumber==0.11.0
Pillow==10.2.0
flwr[simulation]==1.7.0
joblib==1.3.2
faker==22.0.0
gTTS==2.5.0
python-dotenv==1.0.0
httpx==0.26.0
```

```bash
cd ai
pip install -r requirements.txt
```

---

### STEP 3 (Hours 0-4): Charge Section Extractor

Create `ai/nlp/charge_extractor.py`:
```python
"""
Extract IPC/BNSS charge sections from multilingual FIR text.
Uses regex for structured references + Gemini API for narrative-embedded sections.
Handles 10 Indian languages, OCR errors, and mixed scripts.
"""
import re
import os
import json
from typing import List, Dict, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-2.0-flash')
except:
    gemini_model = None
    print("WARNING: Gemini API not configured. Using regex-only extraction.")

@dataclass
class ChargeSection:
    section: str
    act: str  # "IPC" or "BNSS/BNS"
    description: str
    confidence: float
    source: str  # "regex" or "gemini"
    max_years: Optional[int] = None
    life_or_death: bool = False
    bnss_equivalent: Optional[str] = None

# IPC → BNSS mapping (key sections)
IPC_TO_BNSS = {
    "302": {"bnss": "101", "desc": "Murder"},
    "304": {"bnss": "105", "desc": "Culpable Homicide"},
    "304B": {"bnss": "80", "desc": "Dowry Death"},
    "306": {"bnss": "108", "desc": "Abetment of Suicide"},
    "307": {"bnss": "109", "desc": "Attempt to Murder"},
    "323": {"bnss": "115", "desc": "Voluntarily Causing Hurt"},
    "354": {"bnss": "74", "desc": "Assault on Woman"},
    "376": {"bnss": "63", "desc": "Rape"},
    "379": {"bnss": "303", "desc": "Theft"},
    "380": {"bnss": "305", "desc": "Theft in Dwelling"},
    "392": {"bnss": "309", "desc": "Robbery"},
    "394": {"bnss": "310", "desc": "Hurt in Robbery"},
    "406": {"bnss": "316", "desc": "Criminal Breach of Trust"},
    "420": {"bnss": "318", "desc": "Cheating"},
    "454": {"bnss": "331", "desc": "Lurking House-trespass"},
    "457": {"bnss": "333", "desc": "Lurking at Night"},
    "468": {"bnss": "338", "desc": "Forgery for Cheating"},
    "498A": {"bnss": "85", "desc": "Cruelty by Husband"},
    "506": {"bnss": "351", "desc": "Criminal Intimidation"},
    "120B": {"bnss": "61", "desc": "Criminal Conspiracy"},
    "34": {"bnss": "3(5)", "desc": "Common Intention"},
}

# Max sentences (years) - for eligibility calculation
MAX_SENTENCES = {
    "302": {"years": 100, "life_or_death": True},  # Death/Life
    "304": {"years": 10, "life_or_death": False},
    "304B": {"years": 100, "life_or_death": True},  # Death/Life
    "306": {"years": 10, "life_or_death": False},
    "307": {"years": 10, "life_or_death": False},
    "323": {"years": 1, "life_or_death": False},
    "354": {"years": 5, "life_or_death": False},
    "376": {"years": 20, "life_or_death": False},
    "379": {"years": 3, "life_or_death": False},
    "380": {"years": 7, "life_or_death": False},
    "392": {"years": 10, "life_or_death": False},
    "394": {"years": 100, "life_or_death": True},  # Life
    "406": {"years": 3, "life_or_death": False},
    "420": {"years": 7, "life_or_death": False},
    "454": {"years": 10, "life_or_death": False},
    "457": {"years": 5, "life_or_death": False},
    "468": {"years": 7, "life_or_death": False},
    "498A": {"years": 3, "life_or_death": False},
    "506": {"years": 2, "life_or_death": False},
    "120B": {"years": 7, "life_or_death": False},
    "34": {"years": 0, "life_or_death": False},
}

# Common OCR errors in Devanagari
OCR_CORRECTIONS = {
    "धारा ३७९": "धारा 379",
    "धारा ३०२": "धारा 302",
    "धारा ४२०": "धारा 420",
    "आई.पी.सी": "IPC",
    "आईपीसी": "IPC",
    "भा.दं.सं": "IPC",
    "भारतीय दंड संहिता": "IPC",
}

# Regex patterns for charge sections across languages
SECTION_PATTERNS = [
    # English patterns
    r'(?:section|sec\.?|s\.?)\s*(\d{1,3}[A-Za-z]?)\s*(?:of\s*)?(?:IPC|I\.P\.C|Indian\s*Penal\s*Code|BNS|BNSS)',
    r'(?:u/?s\.?)\s*(\d{1,3}[A-Za-z]?)\s*(?:IPC|I\.P\.C|BNS)',
    r'(\d{1,3}[A-Za-z]?)\s*/?\s*(?:IPC|I\.P\.C|BNS)',
    # Hindi/Devanagari patterns
    r'धारा\s*(\d{1,3}[A-Za-z]?)',
    r'(?:आईपीसी|भा\.?दं\.?सं\.?)\s*(?:की\s*)?धारा\s*(\d{1,3}[A-Za-z]?)',
    # Tamil patterns
    r'பிரிவு\s*(\d{1,3}[A-Za-z]?)',
    # Bengali patterns  
    r'ধারা\s*(\d{1,3}[A-Za-z]?)',
    # Marathi patterns
    r'कलम\s*(\d{1,3}[A-Za-z]?)',
]


def correct_ocr_errors(text: str) -> str:
    """Fix common OCR mistakes in Indian language FIR text."""
    for wrong, correct in OCR_CORRECTIONS.items():
        text = text.replace(wrong, correct)
    # Convert Devanagari numerals to Arabic
    devanagari_digits = str.maketrans('०१२३४५६७८९', '0123456789')
    text = text.translate(devanagari_digits)
    return text


def extract_with_regex(text: str) -> List[ChargeSection]:
    """Fast regex extraction of charge sections."""
    found = []
    seen = set()
    
    for pattern in SECTION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.UNICODE)
        for m in matches:
            section = m.group(1).upper()
            if section in seen:
                continue
            seen.add(section)
            
            sentence = MAX_SENTENCES.get(section, {"years": 3, "life_or_death": False})
            mapping = IPC_TO_BNSS.get(section, {})
            
            found.append(ChargeSection(
                section=section,
                act="IPC",
                description=mapping.get("desc", f"Section {section} IPC"),
                confidence=0.90,
                source="regex",
                max_years=sentence["years"],
                life_or_death=sentence["life_or_death"],
                bnss_equivalent=mapping.get("bnss"),
            ))
    
    return found


def extract_with_gemini(text: str, language: str) -> List[ChargeSection]:
    """Use Gemini to extract charges from narrative prose."""
    if not gemini_model:
        return []
    
    prompt = f"""You are a legal expert. Extract ALL IPC (Indian Penal Code) and BNS 
(Bharatiya Nyaya Sanhita) charge sections from this FIR text.
The text is in {language} and may have OCR errors or mixed scripts.

IMPORTANT:
- Look for sections mentioned in narrative prose, not just structured fields
- Common sections: 302, 307, 376, 379, 380, 392, 420, 457, 468, 498A, 306, 323, 354, 406, 506
- Return ONLY valid JSON array, nothing else

Return format: [{{"section": "379", "act": "IPC", "confidence": 0.85}}]
If no charges found, return: []

FIR Text:
{text[:3000]}"""

    try:
        response = gemini_model.generate_content(prompt)
        # Parse JSON from response
        text_response = response.text.strip()
        # Remove markdown code blocks if present
        if text_response.startswith("```"):
            text_response = text_response.split("```")[1]
            if text_response.startswith("json"):
                text_response = text_response[4:]
        
        charges = json.loads(text_response)
        
        result = []
        for c in charges:
            section = str(c.get("section", "")).upper()
            sentence = MAX_SENTENCES.get(section, {"years": 3, "life_or_death": False})
            mapping = IPC_TO_BNSS.get(section, {})
            
            result.append(ChargeSection(
                section=section,
                act=c.get("act", "IPC"),
                description=mapping.get("desc", f"Section {section}"),
                confidence=float(c.get("confidence", 0.75)),
                source="gemini",
                max_years=sentence["years"],
                life_or_death=sentence["life_or_death"],
                bnss_equivalent=mapping.get("bnss"),
            ))
        return result
    except Exception as e:
        print(f"Gemini extraction error: {e}")
        return []


def extract_charges(fir_text: str, language: str = "en") -> List[Dict]:
    """
    Main entry point — called by Laptop A's backend.
    Returns list of charge dicts ready for API response.
    """
    # 1. OCR correction
    corrected = correct_ocr_errors(fir_text)
    
    # 2. Regex extraction (fast, high precision)
    regex_results = extract_with_regex(corrected)
    
    # 3. Gemini extraction (catches narrative-embedded sections)
    gemini_results = extract_with_gemini(corrected, language)
    
    # 4. Merge and deduplicate (regex takes precedence for same section)
    seen = {r.section for r in regex_results}
    merged = list(regex_results)
    for g in gemini_results:
        if g.section not in seen:
            merged.append(g)
            seen.add(g.section)
    
    # 5. Convert to dicts for API
    return [{
        "section": c.section,
        "act": c.act,
        "description": c.description,
        "confidence": c.confidence,
        "source": c.source,
        "max_years": c.max_years,
        "life_or_death": c.life_or_death,
        "bnss_equivalent": c.bnss_equivalent,
    } for c in merged]


# --- Test ---
if __name__ == "__main__":
    test_fir_en = """FIR lodged at PS Kotwali, Lucknow. The accused was found in 
    possession of stolen goods. Charges under Section 379 IPC (theft) and Section 
    411 IPC (receiving stolen property) have been applied. The accused was also 
    found carrying a weapon, adding Section 25 Arms Act."""
    
    test_fir_hi = """प्रथम सूचना रिपोर्ट - थाना कोतवाली, पटना। आरोपी ने दुकान से चोरी की। 
    धारा 379 आईपीसी एवं धारा 457 भारतीय दंड संहिता के तहत मामला दर्ज।"""
    
    print("=== English FIR ===")
    results = extract_charges(test_fir_en, "en")
    for r in results:
        print(f"  S.{r['section']} {r['act']} — {r['description']} (conf: {r['confidence']}, max: {r['max_years']}y)")
    
    print("\n=== Hindi FIR ===")
    results = extract_charges(test_fir_hi, "hi")
    for r in results:
        print(f"  S.{r['section']} {r['act']} — {r['description']} (conf: {r['confidence']}, max: {r['max_years']}y)")
```

```bash
cd ai
python nlp/charge_extractor.py
# Should print extracted sections from both test FIRs

cd ..
git add .
git commit -m "Charge extractor: regex + Gemini, 10 languages, OCR correction, IPC-BNSS mapping"
git push
```

**→ Message group: "PUSHED — Charge extractor works. Import: `from ai.nlp.charge_extractor import extract_charges`"**

---

### STEP 4 (Hours 4-8): Plain Language Generator + Name Normalizer + Legal Glossary

Create `ai/nlp/legal_glossary.json`:
```json
{
  "remand": {
    "en": "The court has ordered that you stay in jail until the next hearing date.",
    "hi": "कोर्ट ने अगली सुनवाई तक जेल में रखने का आदेश दिया है।",
    "mr": "न्यायालयाने पुढील सुनावणीपर्यंत तुरुंगात ठेवण्याचा आदेश दिला आहे.",
    "bn": "আদালত পরবর্তী শুনানি পর্যন্ত জেলে রাখার নির্দেশ দিয়েছে।",
    "ta": "அடுத்த விசாரணை வரை சிறையில் இருக்க நீதிமன்றம் உத்தரவிட்டுள்ளது.",
    "te": "తదుపరి విచారణ వరకు జైలులో ఉంచాలని కోర్టు ఆదేశించింది.",
    "kn": "ಮುಂದಿನ ವಿಚಾರಣೆ ವರೆಗೆ ಜೈಲಿನಲ್ಲಿ ಇರಿಸಲು ನ್ಯಾಯಾಲಯ ಆದೇಶಿಸಿದೆ.",
    "gu": "કોર્ટે આગામી સુનાવણી સુધી જેલમાં રાખવાનો આદેશ આપ્યો છે.",
    "or": "ପରବର୍ତ୍ତୀ ଶୁଣାଣୀ ପର୍ଯ୍ୟନ୍ତ ଜେଲରେ ରଖିବାକୁ ବିଚାରାଳୟ ନିର୍ଦ୍ଦେଶ ଦେଇଛନ୍ତି।",
    "pa": "ਅਦਾਲਤ ਨੇ ਅਗਲੀ ਸੁਣਵਾਈ ਤੱਕ ਜੇਲ੍ਹ ਵਿੱਚ ਰੱਖਣ ਦਾ ਹੁਕਮ ਦਿੱਤਾ ਹੈ।"
  },
  "bail": {
    "en": "You can leave jail, but you must follow certain rules and come back to court when called.",
    "hi": "आप जेल से बाहर आ सकते हैं, लेकिन कुछ नियमों का पालन करना होगा और कोर्ट बुलाने पर आना होगा।",
    "ta": "நீங்கள் சிறையிலிருந்து வெளியே வரலாம், ஆனால் சில விதிகளைப் பின்பற்ற வேண்டும்.",
    "bn": "আপনি জেল থেকে বের হতে পারেন, তবে কিছু নিয়ম মানতে হবে।",
    "mr": "तुम्ही तुरुंगातून बाहेर येऊ शकता, पण काही नियम पाळावे लागतील."
  },
  "charge_sheet": {
    "en": "A formal document by police listing all the evidence and charges against you. It is sent to the court.",
    "hi": "पुलिस द्वारा तैयार किया गया कागज जिसमें आपके खिलाफ सबूत और आरोप लिखे हैं। यह कोर्ट में भेजा जाता है।",
    "ta": "உங்கள் மீதான குற்றச்சாட்டுகள் மற்றும் ஆதாரங்களை பட்டியலிடும் காவல்துறை ஆவணம்.",
    "bn": "পুলিশ কর্তৃক তৈরি নথি যেখানে আপনার বিরুদ্ধে প্রমাণ ও অভিযোগ লেখা আছে।"
  },
  "surety": {
    "en": "An amount of money that must be deposited or guaranteed to get out of jail on bail.",
    "hi": "जमानत पर छूटने के लिए जो पैसा जमा करना होता है या गारंटी देनी होती है।",
    "ta": "ஜாமீனில் விடுவிக்க டெபாசிட் செய்ய வேண்டிய தொகை."
  },
  "next_hearing": {
    "en": "The date when the court will next look at your case. You or your lawyer must be present.",
    "hi": "वह तारीख जब कोर्ट आपके केस को अगली बार देखेगा। आपका या वकील का होना जरूरी है।",
    "ta": "நீதிமன்றம் உங்கள் வழக்கை அடுத்ததாக பரிசீலிக்கும் தேதி."
  },
  "adjournment": {
    "en": "The hearing was postponed to another date. No decision was made today.",
    "hi": "सुनवाई दूसरी तारीख पर टाल दी गई। आज कोई फैसला नहीं हुआ।",
    "ta": "விசாரணை வேறொரு தேதிக்கு ஒத்திவைக்கப்பட்டது. இன்று முடிவு எடுக்கப்படவில்லை."
  },
  "FIR": {
    "en": "First Information Report — the document filed with police when a crime is reported.",
    "hi": "प्रथम सूचना रिपोर्ट — जब अपराध की शिकायत की जाती है तो पुलिस में दर्ज होने वाला कागज।",
    "ta": "முதல் தகவல் அறிக்கை — குற்றம் நடந்ததாக காவல்துறையில் பதிவு செய்யப்படும் ஆவணம்."
  }
}
```

Create `ai/nlp/plain_language.py`:
```python
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
except:
    gemini_model = None

# Load glossary
GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "legal_glossary.json")
with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
    LEGAL_GLOSSARY = json.load(f)

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
        except:
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
    
    # Check for distress/confusion (ask 3+ times, contains distress words)
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
        }
        response_text += helpline_text.get(language, helpline_text["en"])
    
    return {
        "response_text": response_text,
        "language": language,
        "intent": intent,
        "offer_helpline": offer_helpline,
    }
```

Create `ai/nlp/name_normalizer.py`:
```python
"""
Conservative name matching across transliterations.
NEVER auto-merges uncertain matches — flags for human review.
"""
from dataclasses import dataclass
from typing import Tuple
import Levenshtein

@dataclass
class MatchResult:
    action: str  # "AUTO_MATCH", "HUMAN_REVIEW", "NO_MATCH"
    confidence: float
    normalized_a: str
    normalized_b: str

def normalize_name(name: str) -> str:
    """Basic normalization: lowercase, remove titles, standardize spacing."""
    name = name.lower().strip()
    # Remove common Indian titles/prefixes
    for title in ["shri", "smt", "mr", "mrs", "ms", "dr", "adv", "sri", "श्री", "श्रीमती"]:
        name = name.replace(title + " ", "").replace(title + ".", "")
    # Standardize common abbreviations
    name = name.replace("mohd.", "mohammed").replace("mohd ", "mohammed ")
    name = name.replace("md.", "mohammed").replace("md ", "mohammed ")
    # Remove extra whitespace
    name = " ".join(name.split())
    return name

def match_names(name_a: str, name_b: str) -> dict:
    """
    Match two names across transliterations.
    Called by Laptop A: POST /api/v1/nlp/name-match
    
    Returns: {"action": "AUTO_MATCH|HUMAN_REVIEW|NO_MATCH", "confidence": 0.xx}
    """
    norm_a = normalize_name(name_a)
    norm_b = normalize_name(name_b)
    
    # Exact match after normalization
    if norm_a == norm_b:
        return {"action": "AUTO_MATCH", "confidence": 1.0, "normalized_a": norm_a, "normalized_b": norm_b}
    
    # Edit distance similarity
    max_len = max(len(norm_a), len(norm_b), 1)
    edit_score = 1 - (Levenshtein.distance(norm_a, norm_b) / max_len)
    
    # Phonetic similarity (simplified — compare first/last name components)
    parts_a = norm_a.split()
    parts_b = norm_b.split()
    
    # Compare individual name parts
    if len(parts_a) == len(parts_b):
        part_scores = []
        for pa, pb in zip(parts_a, parts_b):
            part_scores.append(1 - Levenshtein.distance(pa, pb) / max(len(pa), len(pb), 1))
        phonetic_score = sum(part_scores) / len(part_scores)
    else:
        phonetic_score = edit_score * 0.8  # Penalty for different number of name parts
    
    # Combined score
    score = 0.6 * phonetic_score + 0.4 * edit_score
    
    # CONSERVATIVE thresholds — NEVER auto-merge uncertain cases
    if score > 0.95:
        action = "AUTO_MATCH"
    elif score > 0.70:
        action = "HUMAN_REVIEW"  # Flag for human, NEVER auto-merge
    else:
        action = "NO_MATCH"
    
    return {
        "action": action,
        "confidence": round(score, 3),
        "normalized_a": norm_a,
        "normalized_b": norm_b,
    }
```

```bash
git add .
git commit -m "Plain language generator + name normalizer + legal glossary (10 languages)"
git push
```

**→ Message group: "PUSHED — NLP modules ready. A can import: `from ai.nlp.plain_language import process_chat_message` and `from ai.nlp.name_normalizer import match_names`"**

---

### STEP 5 (Hours 8-14): Train ML Models

Create `ai/ml/train.py`:
```python
"""
Train adjournment predictor and bail success predictor.
Uses synthetic data from Laptop A's seed generator patterns.
Saves models as .pkl files for backend to load.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import xgboost as xgb
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_training_data(n=10000):
    """Generate synthetic training data matching seed data patterns."""
    np.random.seed(42)
    
    data = pd.DataFrame({
        'court_adj_rate': np.random.uniform(0.3, 0.9, n),
        'consecutive_adjournments': np.random.randint(0, 12, n),
        'day_of_week': np.random.randint(0, 5, n),
        'days_to_vacation': np.random.randint(1, 90, n),
        'charge_sheet_filed': np.random.choice([0, 1], n, p=[0.35, 0.65]),
        'case_age_days': np.random.randint(30, 1000, n),
        'court_load': np.random.randint(20, 80, n),
        'bail_grant_rate': np.random.uniform(0.3, 0.85, n),
    })
    
    # Adjournment target — correlated with features
    adj_prob = (
        0.4 * data['court_adj_rate'] +
        0.05 * np.minimum(data['consecutive_adjournments'], 6) / 6 +
        0.1 * (1 - data['charge_sheet_filed']) +
        0.05 * (data['court_load'] / 80) +
        0.05 * (data['day_of_week'] == 0).astype(float) +  # Monday effect
        np.random.normal(0, 0.1, n)
    )
    data['adjourned'] = (adj_prob > 0.45).astype(int)
    
    # Bail grant target
    bail_prob = (
        0.5 * data['bail_grant_rate'] +
        0.1 * data['charge_sheet_filed'] +
        0.1 * np.minimum(data['case_age_days'], 500) / 500 +
        -0.1 * data['court_adj_rate'] +
        np.random.normal(0, 0.15, n)
    )
    data['bail_granted'] = (bail_prob > 0.4).astype(int)
    
    return data


def train_adjournment_model():
    """Train XGBoost model for adjournment prediction."""
    print("Training adjournment prediction model...")
    data = generate_training_data()
    
    features = ['court_adj_rate', 'consecutive_adjournments', 'day_of_week',
                'days_to_vacation', 'charge_sheet_filed', 'case_age_days', 'court_load']
    
    X = data[features]
    y = data['adjourned']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(
        n_estimators=100, max_depth=6, learning_rate=0.1,
        use_label_encoder=False, eval_metric='logloss', random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy: {accuracy:.3f}, AUC: {auc:.3f}")
    
    # Save
    model_path = os.path.join(MODEL_DIR, "adjournment_model.pkl")
    joblib.dump({"model": model, "features": features}, model_path)
    print(f"  Saved to {model_path}")
    
    return model


def train_bail_predictor():
    """Train model for bail success prediction."""
    print("Training bail success prediction model...")
    data = generate_training_data()
    
    features = ['bail_grant_rate', 'charge_sheet_filed', 'case_age_days',
                'court_adj_rate', 'court_load']
    
    X = data[features]
    y = data['bail_granted']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(
        n_estimators=80, max_depth=5, learning_rate=0.1,
        use_label_encoder=False, eval_metric='logloss', random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy: {accuracy:.3f}, AUC: {auc:.3f}")
    
    model_path = os.path.join(MODEL_DIR, "bail_predictor.pkl")
    joblib.dump({"model": model, "features": features}, model_path)
    print(f"  Saved to {model_path}")
    
    return model


if __name__ == "__main__":
    train_adjournment_model()
    train_bail_predictor()
    print("\nAll models trained and saved to ai/ml/models/")
```

Create `ai/ml/predict.py`:
```python
"""
Prediction functions called by Laptop A's backend.
Load trained models and return predictions with confidence intervals.
"""
import os
import numpy as np
import joblib
from typing import Dict, List

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# Load models at import time (once, not per-request)
_adj_data = None
_bail_data = None

def _load_models():
    global _adj_data, _bail_data
    try:
        _adj_data = joblib.load(os.path.join(MODEL_DIR, "adjournment_model.pkl"))
    except:
        print("WARNING: Adjournment model not found. Run ai/ml/train.py first.")
    try:
        _bail_data = joblib.load(os.path.join(MODEL_DIR, "bail_predictor.pkl"))
    except:
        print("WARNING: Bail predictor not found. Run ai/ml/train.py first.")

_load_models()


def predict_adjournment(features: Dict) -> Dict:
    """
    Predict adjournment probability for a hearing.
    Called by Laptop A: GET /api/v1/hearings/{id}/adjournment
    
    Input features: {court_adj_rate, consecutive_adjournments, day_of_week,
                     days_to_vacation, charge_sheet_filed, case_age_days, court_load}
    """
    if _adj_data is None:
        return {"probability": 50.0, "ci_low": 30.0, "ci_high": 70.0, 
                "uncertainty": "HIGH", "error": "Model not loaded"}
    
    model = _adj_data["model"]
    feature_names = _adj_data["features"]
    
    X = np.array([[features.get(f, 0) for f in feature_names]])
    prob = float(model.predict_proba(X)[0][1])
    
    # Bootstrap confidence interval
    ci_low, ci_high = _bootstrap_ci(model, X, n=50)
    
    # Key factors (feature importances for this prediction)
    importances = model.feature_importances_
    top_factors = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:3]
    
    return {
        "probability": round(prob * 100, 1),
        "ci_low": round(ci_low * 100, 1),
        "ci_high": round(ci_high * 100, 1),
        "key_factors": [{"feature": f, "importance": round(float(i), 3)} for f, i in top_factors],
        "uncertainty": "HIGH" if (ci_high - ci_low) > 0.3 else "MEDIUM" if (ci_high - ci_low) > 0.15 else "LOW",
        "disclaimer": "This prediction is an input to judgment, not an instruction."
    }


def predict_bail_success(features: Dict) -> Dict:
    """
    Predict bail grant probability for a case.
    Called by Laptop A: GET /api/v1/cases/{id}/bail-prediction
    """
    if _bail_data is None:
        return {"probability": 50.0, "error": "Model not loaded"}
    
    model = _bail_data["model"]
    feature_names = _bail_data["features"]
    
    X = np.array([[features.get(f, 0) for f in feature_names]])
    prob = float(model.predict_proba(X)[0][1])
    
    return {
        "probability": round(prob * 100, 1),
        "disclaimer": "Historical data — not a prediction of your specific case outcome."
    }


def _bootstrap_ci(model, X, n=50, alpha=0.05):
    """Quick bootstrap confidence interval."""
    predictions = []
    for _ in range(n):
        noise = np.random.normal(0, 0.02, X.shape)
        prob = model.predict_proba(X + noise)[0][1]
        predictions.append(prob)
    return np.percentile(predictions, 100 * alpha / 2), np.percentile(predictions, 100 * (1 - alpha / 2))
```

```bash
cd ai
python ml/train.py
# Should output accuracy metrics and save .pkl files

cd ..
git add ai/
git commit -m "ML models trained: adjournment predictor (XGBoost) + bail success predictor"
git push
```

**→ Message A: "PUSHED — ML models ready. Load with: `from ai.ml.predict import predict_adjournment, predict_bail_success`. Models are at ai/ml/models/*.pkl"**

---

### STEP 6 (Hours 14-22): Writ Petition Drafter + Chat Backend + FL Demo

Build these following the same pattern:
- `ai/writ_generator/petition_drafter.py` — Gemini prompt for S.479 application + S.440 surety brief
- `ai/voice/dialect_detector.py` — phone number prefix → region → dialect
- `ai/federated/fl_server.py` + `fl_client.py` — Flower server + 2 simulated clients

### STEP 7 (Hours 34-40): DEPLOY EVERYTHING

You own deployment. Follow this exact sequence:

**1. Backend → Render:**
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY ai/ ./ai/
ENV PORT=8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- Go to render.com → New Web Service → Connect GitHub repo
- Root directory: `.` (root, since Dockerfile copies both backend/ and ai/)
- Set env vars from .env
- Region: Oregon (or Singapore if available)
- Deploy

**2. Frontend → Vercel:**
- Go to vercel.com → Import GitHub repo
- Root directory: `frontend`
- Set `NEXT_PUBLIC_API_URL` = your Render URL (e.g., `https://justicegrid-api.onrender.com`)
- Deploy

**3. Warm-up script** (prevent Render cold starts during demo):
Use cron-job.org (free) to ping `https://justicegrid-api.onrender.com/health` every 10 minutes.

```bash
git add .
git commit -m "Deployment: Dockerfile + render.yaml + vercel.json"
git push
```

**→ Message group: "DEPLOYED! Backend: https://justicegrid-api.onrender.com/docs | Frontend: https://justicegrid.vercel.app"**
