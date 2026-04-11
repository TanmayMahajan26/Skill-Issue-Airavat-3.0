"""
Communication Simulator API (Pillars 3, 10) — WhatsApp chat sim, IVR sim, glossary.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.schemas import Case
from ..models.responses import (
    ChatSimulateRequest, ChatSimulateResponse,
    GlossaryLookupRequest, GlossaryLookupResponse,
)

router = APIRouter()

# Legal glossary — plain language explanations
LEGAL_GLOSSARY = {
    "remand": {
        "en": "The court has ordered that you stay in jail until the next hearing date.",
        "hi": "कोर्ट ने अगली सुनवाई तक जेल में रखने का आदेश दिया है।",
        "ta": "அடுத்த விசாரணை வரை சிறையில் இருக்க நீதிமன்றம் உத்தரவிட்டுள்ளது.",
        "bn": "আদালত পরবর্তী শুনানি পর্যন্ত জেলে রাখার নির্দেশ দিয়েছে।",
        "mr": "न्यायालयाने पुढील सुनावणीपर्यंत तुरुंगात ठेवण्याचा आदेश दिला.",
    },
    "bail": {
        "en": "You can leave jail, but you must follow certain rules and come back to court when called.",
        "hi": "आप जेल से बाहर आ सकते हैं, लेकिन कुछ नियमों का पालन करना होगा और कोर्ट बुलाने पर आना होगा।",
        "ta": "நீங்கள் சிறையிலிருந்து வெளியே வரலாம், ஆனால் சில விதிகளைப் பின்பற்ற வேண்டும்.",
        "bn": "আপনি জেল থেকে বের হতে পারেন, তবে কিছু নিয়ম মানতে হবে।",
        "mr": "तुम्ही तुरुंगातून बाहेर येऊ शकता, पण काही नियम पाळावे लागतील.",
    },
    "surety": {
        "en": "An amount of money that must be deposited or guaranteed to get out of jail on bail.",
        "hi": "जमानत पर छूटने के लिए जो पैसा जमा करना होता है।",
        "ta": "ஜாமீனில் விடுவிக்க டெபாசிட் செய்ய வேண்டிய தொகை.",
        "bn": "জামিনে মুক্তি পেতে যে টাকা জমা দিতে হয়।",
    },
    "adjournment": {
        "en": "The hearing was postponed to another date. No decision was made today.",
        "hi": "सुनवाई दूसरी तारीख पर टाल दी गई। आज कोई फैसला नहीं हुआ।",
        "ta": "விசாரணை வேறொரு தேதிக்கு ஒத்திவைக்கப்பட்டது.",
        "bn": "শুনানি অন্য তারিখে স্থগিত। আজ কোনো সিদ্ধান্ত হয়নি।",
    },
    "charge sheet": {
        "en": "A formal document by police listing all the evidence against you. It is sent to the court.",
        "hi": "पुलिस द्वारा तैयार किया गया कागज जिसमें सबूत और आरोप लिखे हैं।",
        "ta": "உங்கள் மீதான குற்றச்சாட்டுகள் பட்டியலிடும் காவல்துறை ஆவணம்.",
    },
    "FIR": {
        "en": "First Information Report — the document filed with police when a crime is reported.",
        "hi": "प्रथम सूचना रिपोर्ट — जब शिकायत दर्ज की जाती है तो पुलिस में बनने वाला कागज।",
        "ta": "முதல் தகவல் அறிக்கை — குற்றம் பதிவு செய்யப்படும் காவல்துறை ஆவணம்.",
    },
    "next hearing": {
        "en": "The date when the court will next look at your case.",
        "hi": "वह तारीख जब कोर्ट आपके केस को अगली बार देखेगा।",
        "ta": "நீதிமன்றம் உங்கள் வழக்கை அடுத்ததாக பரிசீலிக்கும் தேதி.",
    },
}


@router.post("/chat-simulate", response_model=ChatSimulateResponse)
def chat_simulate(req: ChatSimulateRequest, db: Session = Depends(get_db)):
    """
    WhatsApp chat simulator — Differentiator 4.
    Processes a family member's message and returns a response in their language.
    """
    message = req.message.lower().strip()
    lang = req.language
    
    # Intent detection
    intent = "case_query"
    offer_helpline = False
    
    # Glossary lookup triggers
    glossary_triggers = ["what does", "meaning", "kya hai", "kya hota", "matlab", "என்ன", "কি"]
    for trigger in glossary_triggers:
        if trigger in message:
            intent = "glossary_lookup"
            for term, translations in LEGAL_GLOSSARY.items():
                if term in message:
                    return ChatSimulateResponse(
                        response_text=translations.get(lang, translations.get("en", "Definition not available.")),
                        language=lang,
                        intent="glossary_lookup",
                        offer_helpline=False,
                    )
            break
    
    # Distress detection
    distress_words = ["help", "confused", "samajh nahi", "pareshan", "don't understand"]
    if any(w in message for w in distress_words):
        offer_helpline = True
        intent = "distressed"
    
    # Case lookup
    if req.case_number:
        case = db.query(Case).filter(Case.case_number == req.case_number).first()
        if case:
            from datetime import date
            detention = (date.today() - case.arrest_date).days
            
            status_text = {
                "en": f"Case {case.case_number}: Your family member has been detained for {detention} days. "
                      f"Status: {case.eligibility_status}. "
                      f"{'Bail has been granted.' if case.bail_granted else 'Bail has not yet been granted.'}",
                "hi": f"केस {case.case_number}: आपके परिवार के सदस्य {detention} दिनों से हिरासत में हैं। "
                      f"स्थिति: {'पात्र' if case.eligibility_status == 'ELIGIBLE' else 'लंबित'}। "
                      f"{'जमानत मिल गई है।' if case.bail_granted else 'जमानत अभी नहीं मिली है।'}",
                "ta": f"வழக்கு {case.case_number}: உங்கள் குடும்ப உறுப்பினர் {detention} நாட்களாக காவலில் உள்ளார். "
                      f"நிலை: {'தகுதியானது' if case.eligibility_status == 'ELIGIBLE' else 'நிலுவையில்'}.",
            }
            
            response = status_text.get(lang, status_text["en"])
            
            if offer_helpline:
                helpline = {"hi": "\n\nDLSA हेल्पलाइन से बात करना चाहते हैं?", 
                           "en": "\n\nWould you like to speak to the DLSA helpline?"}
                response += helpline.get(lang, helpline["en"])
            
            return ChatSimulateResponse(
                response_text=response,
                language=lang,
                intent=intent,
                offer_helpline=offer_helpline,
            )
    
    # Default response
    defaults = {
        "en": "Please provide a case number to check status. Example: MH-2024-CR-10001",
        "hi": "कृपया केस नंबर बताएं। उदाहरण: MH-2024-CR-10001",
        "ta": "வழக்கு எண்ணை வழங்கவும். உதாரணம்: MH-2024-CR-10001",
    }
    
    return ChatSimulateResponse(
        response_text=defaults.get(lang, defaults["en"]),
        language=lang,
        intent="unknown",
        offer_helpline=offer_helpline,
    )


@router.post("/glossary-lookup", response_model=GlossaryLookupResponse)
def glossary_lookup(req: GlossaryLookupRequest):
    """Look up a legal term in plain language."""
    term = req.term.lower().strip()
    lang = req.language
    
    if term in LEGAL_GLOSSARY:
        explanation = LEGAL_GLOSSARY[term].get(lang, LEGAL_GLOSSARY[term].get("en", "Not available"))
    else:
        explanation = f"Sorry, I don't have a simple explanation for '{term}' yet."
    
    return GlossaryLookupResponse(term=term, language=lang, explanation=explanation)
