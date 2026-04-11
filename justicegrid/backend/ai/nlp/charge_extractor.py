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
except Exception:
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
    # Telugu patterns
    r'సెక్షన్\s*(\d{1,3}[A-Za-z]?)',
    # Kannada patterns
    r'ಸೆಕ್ಷನ್\s*(\d{1,3}[A-Za-z]?)',
    # Gujarati patterns
    r'કલમ\s*(\d{1,3}[A-Za-z]?)',
    # Odia patterns
    r'ଧାରା\s*(\d{1,3}[A-Za-z]?)',
    # Punjabi patterns
    r'ਧਾਰਾ\s*(\d{1,3}[A-Za-z]?)',
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
