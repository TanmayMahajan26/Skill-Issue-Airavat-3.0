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
    import re
    message = req.message.strip()
    message_lower = message.lower()
    lang = req.language

    intent = "case_query"
    offer_helpline = False

    # Glossary lookup triggers
    glossary_triggers = ["what does", "meaning", "kya hai", "kya hota", "matlab", "என்ன", "কি"]
    for trigger in glossary_triggers:
        if trigger in message_lower:
            intent = "glossary_lookup"
            for term, translations in LEGAL_GLOSSARY.items():
                if term in message_lower:
                    return ChatSimulateResponse(
                        response_text=translations.get(lang, translations.get("en", "Definition not available.")),
                        language=lang,
                        intent="glossary_lookup",
                        offer_helpline=False,
                    )
            break

    # Direct glossary term (single word like "remand", "bail")
    for term, translations in LEGAL_GLOSSARY.items():
        if message_lower.strip() == term:
            explanation = translations.get(lang, translations.get("en", ""))
            return ChatSimulateResponse(
                response_text=f"📖 \"{term}\":\n\n{explanation}\n\n⚖️ This is not legal advice.",
                language=lang,
                intent="glossary_lookup",
                offer_helpline=False,
            )

    # Distress detection
    distress_words = ["help", "confused", "samajh nahi", "pareshan", "don't understand", "madad"]
    if any(w in message_lower for w in distress_words):
        offer_helpline = True
        intent = "distressed"
        helpline_msgs = {
            "hi": "🙏 हम समझते हैं कि यह मुश्किल समय है।\n\n📞 DLSA हेल्पलाइन: 1516\nहम आपको जोड़ सकते हैं।",
            "en": "🙏 We understand this is a difficult time.\n\n📞 DLSA Helpline: 1516\nWe can connect you.",
            "ta": "🙏 இது கடினமான நேரம் என்பதை நாங்கள் புரிந்துகொள்கிறோம்.\n\n📞 DLSA உதவி எண்: 1516",
        }
        return ChatSimulateResponse(
            response_text=helpline_msgs.get(lang, helpline_msgs["en"]),
            language=lang, intent=intent, offer_helpline=True,
        )

    # Try to extract a case number from the message (e.g. MH-2024-CR-10001)
    case_number_match = re.search(r'[A-Z]{2}-\d{4}-CR-\d+', message.upper())
    case_number = case_number_match.group(0) if case_number_match else req.case_number

    if case_number:
        case = db.query(Case).filter(Case.case_number == case_number).first()
        if case:
            from datetime import date as dt_date
            detention = (dt_date.today() - case.arrest_date).days
            charges_str = ", ".join(f"S.{ch.get('section','')} {ch.get('act','IPC')}" for ch in (case.charges or []))

            # Build rich response
            next_hearing = None
            from ..models.schemas import Hearing
            nh = db.query(Hearing).filter(
                Hearing.case_id == case.id,
                Hearing.hearing_date >= dt_date.today(),
                Hearing.outcome == None,
            ).order_by(Hearing.hearing_date).first()
            if nh:
                next_hearing = str(nh.hearing_date)

            status_map = {"ELIGIBLE": "पात्र (Eligible)", "NOT_ELIGIBLE": "अभी पात्र नहीं", "EXCLUDED": "बाहर (Excluded)", "REVIEW_NEEDED": "समीक्षा चल रही है", "PENDING": "लंबित"}

            if lang == "hi":
                response = (
                    f"🙏 केस नंबर {case.case_number}:\n\n"
                    f"👤 नाम: {case.accused_name}\n"
                    f"👨 पिता: {case.father_name or 'N/A'}\n"
                    f"📅 उम्र: {case.age or 'N/A'} वर्ष\n"
                    f"📋 धारा: {charges_str}\n"
                    f"⏰ हिरासत: {detention} दिन\n"
                    f"🏢 थाना: {case.police_station or 'N/A'}\n\n"
                    f"✅ स्थिति: {status_map.get(case.eligibility_status, case.eligibility_status)}\n"
                    f"{'✅ जमानत मिल चुकी है।' if case.bail_granted else '⏳ जमानत अभी नहीं मिली है।'}\n"
                )
                if next_hearing:
                    response += f"\n📅 अगली सुनवाई: {next_hearing}"
                if case.bail_granted and not case.surety_executed and case.surety_amount:
                    response += f"\n\n💰 जमानत राशि ₹{case.surety_amount:,.0f} जमा नहीं हुई है।"
                response += "\n\n⚖️ यह कानूनी सलाह नहीं है।"
            else:
                response = (
                    f"📋 Case {case.case_number}:\n\n"
                    f"👤 Name: {case.accused_name}\n"
                    f"👨 Father: {case.father_name or 'N/A'}\n"
                    f"📅 Age: {case.age or 'N/A'} years\n"
                    f"📋 Charges: {charges_str}\n"
                    f"⏰ Detained: {detention} days\n"
                    f"🏢 Police Station: {case.police_station or 'N/A'}\n\n"
                    f"Status: {case.eligibility_status}\n"
                    f"{'✅ Bail has been granted.' if case.bail_granted else '⏳ Bail has not yet been granted.'}\n"
                )
                if next_hearing:
                    response += f"\n📅 Next Hearing: {next_hearing}"
                if case.bail_granted and not case.surety_executed and case.surety_amount:
                    response += f"\n\n💰 Surety of ₹{case.surety_amount:,.0f} remains unexecuted."
                response += "\n\n⚖️ This is not legal advice."

            return ChatSimulateResponse(
                response_text=response, language=lang, intent="case_status", offer_helpline=False,
            )
        else:
            not_found = {
                "hi": f"❌ केस {case_number} नहीं मिला। कृपया केस नंबर जांचें।",
                "en": f"❌ Case {case_number} not found. Please check the case number.",
            }
            return ChatSimulateResponse(
                response_text=not_found.get(lang, not_found["en"]),
                language=lang, intent="case_not_found", offer_helpline=False,
            )

    # Default response
    defaults = {
        "en": "Please enter a case number to check status.\nExample: MH-2024-CR-10001\n\nOr ask about:\n• \"bail\" — What is bail?\n• \"remand\" — What is remand?\n• \"help\" — Connect to DLSA helpline",
        "hi": "कृपया केस नंबर डालें।\nउदाहरण: MH-2024-CR-10001\n\nया पूछें:\n• \"bail\" — जमानत क्या है?\n• \"remand\" — रिमांड क्या है?\n• \"help\" — DLSA हेल्पलाइन",
    }

    return ChatSimulateResponse(
        response_text=defaults.get(lang, defaults["en"]),
        language=lang, intent="unknown", offer_helpline=False,
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
