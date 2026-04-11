"""
NLP API (Pillar 6) — charge extraction, translation, name matching.
Stub endpoints that will be wired to Laptop C's ai/ modules.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class ExtractChargesRequest(BaseModel):
    fir_text: str
    language: str = "en"


class TranslateRequest(BaseModel):
    text: str
    target_language: str = "hi"
    source_language: str = "en"


class NameMatchRequest(BaseModel):
    name_a: str
    name_b: str


@router.post("/extract-charges")
def extract_charges(req: ExtractChargesRequest):
    """Extract IPC/BNSS charges from multilingual FIR text (Pillar 6)."""
    # Try to import Laptop C's module
    try:
        from ai.nlp.charge_extractor import extract_charges as _extract
        charges = _extract(req.fir_text, req.language)
        return {"charges": charges, "source": "nlp_engine"}
    except ImportError:
        # Fallback: basic regex extraction
        import re
        pattern = r'[Ss](?:ection|ec\.?|\.)\s*(\d{1,3}[A-Za-z]?)\s*(?:IPC|I\.P\.C|BNS)'
        matches = re.findall(pattern, req.fir_text)
        charges = [{"section": m, "act": "IPC", "confidence": 0.7, "source": "regex_fallback"} for m in set(matches)]
        return {"charges": charges, "source": "regex_fallback"}


@router.post("/translate")
def translate_text(req: TranslateRequest):
    """Plain-language translation for family communications (Pillar 6)."""
    try:
        from ai.nlp.plain_language import generate_plain_status
        result = generate_plain_status(req.text, req.target_language)
        return result
    except ImportError:
        return {
            "text": req.text,
            "language": req.target_language,
            "needs_human_review": True,
            "note": "NLP module not yet integrated — showing original text",
        }


@router.post("/name-match")
def name_match(req: NameMatchRequest):
    """Conservative name matching across transliterations (Pillar 6)."""
    try:
        from ai.nlp.name_normalizer import match_names
        return match_names(req.name_a, req.name_b)
    except ImportError:
        # Basic fallback
        score = 1.0 if req.name_a.lower().strip() == req.name_b.lower().strip() else 0.5
        return {
            "action": "AUTO_MATCH" if score > 0.95 else "HUMAN_REVIEW",
            "confidence": score,
            "normalized_a": req.name_a.lower().strip(),
            "normalized_b": req.name_b.lower().strip(),
            "note": "Name normalizer not yet integrated — basic matching only",
        }
