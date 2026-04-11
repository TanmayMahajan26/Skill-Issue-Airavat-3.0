"""
Bail Condition Parser — NLP extraction of bail conditions from judge's order text.
Converts legalese into structured, visual checklist items.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import re

from ..database import get_db

router = APIRouter()


class BailOrderInput(BaseModel):
    order_text: str
    language: str = "en"  # en or hi


class ChecklistItem(BaseModel):
    condition: str
    condition_hindi: str
    icon: str  # emoji icon for visual display
    category: str  # FINANCIAL, REPORTING, DOCUMENT, TRAVEL, CONDUCT


class BailChecklist(BaseModel):
    items: List[ChecklistItem]
    original_text: str
    case_number: Optional[str] = None


# ── Condition extraction patterns ─────────────────────────────────────────────
PATTERNS = [
    # Financial conditions
    {
        "regex": r"(?:surety|sureties)\s+(?:of|for)\s+(?:Rs\.?|₹)\s*([\d,]+)",
        "template": "Furnish surety bond of ₹{amount}",
        "hindi": "₹{amount} की ज़मानत बाण्ड जमा करें",
        "icon": "💰",
        "category": "FINANCIAL",
    },
    {
        "regex": r"personal\s+bond\s+(?:of|for)\s+(?:Rs\.?|₹)\s*([\d,]+)",
        "template": "Submit personal bond of ₹{amount}",
        "hindi": "₹{amount} का व्यक्तिगत बाण्ड जमा करें",
        "icon": "📝",
        "category": "FINANCIAL",
    },
    # Document conditions
    {
        "regex": r"surrender\s+(?:his|her|their)?\s*passport",
        "template": "Surrender passport to the court",
        "hindi": "पासपोर्ट अदालत में जमा करें",
        "icon": "🛂",
        "category": "DOCUMENT",
    },
    {
        "regex": r"deposit\s+(?:his|her|their)?\s*(?:travel\s+)?documents?",
        "template": "Deposit travel documents with the court",
        "hindi": "यात्रा दस्तावेज़ अदालत में जमा करें",
        "icon": "📄",
        "category": "DOCUMENT",
    },
    # Reporting conditions
    {
        "regex": r"report\s+(?:to|at)\s+(?:the\s+)?(?:local\s+)?(?:police\s+station|P\.?S\.?)\s*(?:every|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|daily|weekly|fortnightly)",
        "template": "Report to local police station every {day}",
        "hindi": "हर {day} को स्थानीय थाने में हाज़िरी दें",
        "icon": "🏛️",
        "category": "REPORTING",
    },
    {
        "regex": r"report\s+(?:to|at)\s+(?:the\s+)?(?:local\s+)?(?:police\s+station|P\.?S\.?)",
        "template": "Report to local police station as directed",
        "hindi": "निर्देशानुसार स्थानीय थाने में हाज़िरी दें",
        "icon": "🏛️",
        "category": "REPORTING",
    },
    {
        "regex": r"mark\s+(?:his|her|their)?\s*(?:attendance|presence)",
        "template": "Mark attendance at the designated authority",
        "hindi": "निर्धारित प्राधिकारी के पास उपस्थिति दर्ज करें",
        "icon": "✅",
        "category": "REPORTING",
    },
    # Travel restrictions
    {
        "regex": r"(?:shall\s+)?not\s+leave\s+(?:the\s+)?(?:city|town|district|state|jurisdiction|country)",
        "template": "Do not leave the jurisdiction without court permission",
        "hindi": "अदालत की अनुमति के बिना क्षेत्राधिकार न छोड़ें",
        "icon": "🚫",
        "category": "TRAVEL",
    },
    # Conduct conditions
    {
        "regex": r"(?:shall\s+)?not\s+(?:tamper|interfere)\s+(?:with)?\s*(?:the\s+)?(?:evidence|witness|prosecution)",
        "template": "Do not tamper with evidence or influence witnesses",
        "hindi": "सबूतों से छेड़छाड़ या गवाहों को प्रभावित न करें",
        "icon": "⚠️",
        "category": "CONDUCT",
    },
    {
        "regex": r"(?:shall\s+)?not\s+(?:contact|approach|threaten)\s+(?:the\s+)?(?:victim|complainant|witness)",
        "template": "Do not contact the victim or witnesses",
        "hindi": "पीड़ित या गवाहों से संपर्क न करें",
        "icon": "🚷",
        "category": "CONDUCT",
    },
    {
        "regex": r"cooperat(?:e|ion)\s+(?:with|in)\s+(?:the\s+)?(?:investigation|trial)",
        "template": "Cooperate fully with the investigation",
        "hindi": "जांच में पूर्ण सहयोग करें",
        "icon": "🤝",
        "category": "CONDUCT",
    },
    # Court appearance
    {
        "regex": r"(?:appear|present)\s+(?:before|in)\s+(?:the\s+)?(?:court|hon)",
        "template": "Appear before the court on all hearing dates",
        "hindi": "सभी सुनवाई तिथियों पर अदालत में उपस्थित हों",
        "icon": "📅",
        "category": "REPORTING",
    },
]


@router.post("/parse-conditions", response_model=BailChecklist)
def parse_bail_conditions(order: BailOrderInput):
    """
    Parse bail order text and extract conditions as a visual checklist.
    Uses regex-based NLP for reliable extraction without external API deps.
    """
    text = order.order_text.lower()
    items: List[ChecklistItem] = []
    seen = set()

    for pattern in PATTERNS:
        match = re.search(pattern["regex"], text, re.IGNORECASE)
        if match and pattern["category"] not in seen:
            groups = match.groups()
            condition = pattern["template"]
            hindi = pattern["hindi"]

            if groups:
                val = groups[0].replace(",", "")
                condition = condition.replace("{amount}", val).replace("{day}", val.capitalize())
                hindi = hindi.replace("{amount}", val).replace("{day}", val.capitalize())

            items.append(ChecklistItem(
                condition=condition,
                condition_hindi=hindi,
                icon=pattern["icon"],
                category=pattern["category"],
            ))
            seen.add(pattern["category"] + condition)  # Prevent duplicate by exact condition

    # Always add court appearance if not already extracted
    if not any(i.category == "REPORTING" and "court" in i.condition.lower() for i in items):
        items.append(ChecklistItem(
            condition="Appear before the court on all hearing dates",
            condition_hindi="सभी सुनवाई तिथियों पर अदालत में उपस्थित हों",
            icon="📅",
            category="REPORTING",
        ))

    return BailChecklist(
        items=items,
        original_text=order.order_text,
    )
