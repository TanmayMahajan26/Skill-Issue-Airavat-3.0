"""
Auto-generate S.479 BNSS bail application and S.440/S.483 surety reduction briefs.
All outputs marked DRAFT — always requires lawyer review.
"""
import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-2.0-flash')
except Exception:
    gemini_model = None


def draft_bail_petition(case_data: Dict) -> Dict:
    """
    Generate a S.479 BNSS bail application draft.
    Differentiator 6 — auto-generated writ petition.

    Input: {case_number, accused_name, charges, detention_days, threshold_days,
            court_name, prison_name, eligibility_reason, ...}
    Output: {petition_text, status, legal_basis, warnings}
    """
    case_number = case_data.get("case_number", "UNKNOWN")
    accused = case_data.get("accused_name", "The Accused")
    charges = case_data.get("charges", [])
    detention_days = case_data.get("detention_days", 0)
    threshold_days = case_data.get("threshold_days", 0)
    court_name = case_data.get("court_name", "Sessions Court")
    prison_name = case_data.get("prison_name", "Central Prison")
    is_first_offender = case_data.get("is_first_offender", True)

    charges_text = ", ".join([f"Section {c.get('section', '?')} {c.get('act', 'IPC')}"
                              for c in charges]) if charges else "Charges not specified"

    threshold_type = "one-third (⅓)" if is_first_offender else "one-half (½)"
    overdue_days = max(0, detention_days - threshold_days)

    if gemini_model:
        prompt = f"""You are a legal aid lawyer in India. Draft a FORMAL bail application
under Section 479 BNSS (formerly Section 436A CrPC) for the following case.

Case Details:
- Case Number: {case_number}
- Accused: {accused}
- Charges: {charges_text}
- Days Detained: {detention_days}
- Threshold for Eligibility ({threshold_type}): {threshold_days} days
- Days Overdue Beyond Threshold: {overdue_days}
- Court: {court_name}
- Prison: {prison_name}
- First-time Offender: {"Yes" if is_first_offender else "No"}

RULES:
1. Use formal legal language appropriate for Indian courts
2. Cite Section 479 BNSS specifically
3. Include the mathematical computation showing threshold exceeded
4. Mention relevant Supreme Court precedents (Hussain vs Union of India, etc.)
5. Request bail with or without surety
6. Add a "DRAFT" watermark note
7. Keep under 500 words

Generate the bail application:"""
        try:
            response = gemini_model.generate_content(prompt)
            petition_text = response.text.strip()
        except Exception as e:
            petition_text = _fallback_petition(case_data)
    else:
        petition_text = _fallback_petition(case_data)

    return {
        "petition_text": petition_text,
        "status": "DRAFT",
        "legal_basis": "Section 479 BNSS (formerly Section 436A CrPC)",
        "warnings": [
            "⚠️ DRAFT — REQUIRES LAWYER REVIEW before filing",
            "This is AI-generated and must be reviewed by a qualified legal professional",
            "Verify all facts, dates, and legal citations before use",
        ],
        "case_number": case_number,
    }


def draft_surety_reduction_brief(case_data: Dict) -> Dict:
    """
    Generate a S.440 CrPC / S.483 BNSS surety reduction application brief.

    Input: {case_number, surety_amount, district_median_income, mgnrega_rate,
            income_ratio, accused_name, ...}
    """
    surety = case_data.get("surety_amount", 0)
    income = case_data.get("district_median_income", 0)
    ratio = case_data.get("income_ratio", 0)
    case_number = case_data.get("case_number", "UNKNOWN")
    accused = case_data.get("accused_name", "The Accused")

    if gemini_model:
        prompt = f"""Draft a BRIEF application for surety reduction under Section 440 CrPC
(Section 483 BNSS) for the following case.

Facts:
- Case: {case_number}
- Accused: {accused}
- Surety Amount Set: ₹{surety:,.0f}
- District Median Monthly Income: ₹{income:,.0f}
- Surety-to-Income Ratio: {ratio:.1f}x monthly income
- MGNREGA Daily Rate: ₹{case_data.get('mgnrega_rate', 267)}

Arguments:
1. Surety is disproportionate to local economic conditions
2. Surety exceeds 90 days of median local income — S.440 candidate
3. This effectively denies bail to economically weak undertrial

RULES:
1. Formal legal language for Indian courts
2. Cite S.440 CrPC / S.483 BNSS
3. Cite Moti Ram v State of MP (1978) on affordable bail
4. Keep under 300 words
5. Mark as DRAFT

Generate the brief:"""
        try:
            response = gemini_model.generate_content(prompt)
            brief_text = response.text.strip()
        except Exception as e:
            brief_text = _fallback_surety_brief(case_data)
    else:
        brief_text = _fallback_surety_brief(case_data)

    return {
        "brief_text": brief_text,
        "status": "DRAFT_FOR_LAWYER_REVIEW",
        "legal_basis": "Section 440 CrPC / Section 483 BNSS",
        "supporting_data": {
            "surety_amount": surety,
            "median_income": income,
            "income_ratio": ratio,
        },
        "warnings": [
            "⚠️ DRAFT — REQUIRES LAWYER REVIEW",
            "Verify district income data is current",
        ],
    }


def _fallback_petition(case_data: Dict) -> str:
    """Template-based fallback when Gemini is unavailable."""
    d = case_data
    return f"""
[DRAFT — REQUIRES LAWYER REVIEW]

IN THE COURT OF {d.get('court_name', 'Sessions Court').upper()}

APPLICATION FOR BAIL UNDER SECTION 479 BNSS

Case No.: {d.get('case_number', '___')}
Applicant: {d.get('accused_name', '___')}

MOST RESPECTFULLY SUBMITTED:

1. The applicant has been detained for {d.get('detention_days', '___')} days in
   {d.get('prison_name', '___')}.

2. The threshold for bail eligibility under Section 479 BNSS is
   {d.get('threshold_days', '___')} days ({'one-third' if d.get('is_first_offender') else 'one-half'}
   of the maximum sentence for the charges).

3. The applicant has EXCEEDED this threshold by
   {max(0, d.get('detention_days', 0) - d.get('threshold_days', 0))} days.

4. Under Section 479 BNSS, the applicant is entitled to release on bail,
   with or without surety.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may be pleased to
grant bail to the applicant under Section 479 BNSS.

Date: ___
Place: ___

Through Counsel
"""


def _fallback_surety_brief(case_data: Dict) -> str:
    """Template-based fallback for surety reduction."""
    d = case_data
    return f"""
[DRAFT — REQUIRES LAWYER REVIEW]

APPLICATION FOR REDUCTION OF SURETY UNDER S.440 CrPC / S.483 BNSS

Case No.: {d.get('case_number', '___')}
Applicant: {d.get('accused_name', '___')}

The surety amount of ₹{d.get('surety_amount', 0):,.0f} is disproportionate to the
local economic conditions. The district median monthly income is
₹{d.get('district_median_income', 0):,.0f}, making the surety {d.get('income_ratio', 0):.1f}x
the monthly income.

As per Moti Ram v State of MP (1978), bail conditions must be affordable.
The current surety effectively denies bail to the economically weak applicant.

PRAYER:
Reduction of surety to an affordable amount consistent with local economic conditions.
"""
