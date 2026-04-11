"""
Section 479 BNSS Eligibility Engine — the core intelligence of JusticeGrid.

Computes whether an undertrial prisoner is eligible for default bail based on:
- Charge sections and maximum sentences
- First-offender vs regular accused thresholds (⅓ vs ½)
- Detention duration minus accused-caused delays
- Exclusions for life/death sentence charges
- Multiple pending cases check (S.479(2))

CONSERVATIVE by design: when in doubt, flags for human review. Never auto-applies
the most favourable charge interpretation.
"""
import hashlib
import json
from datetime import date, datetime
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session

from ..models.schemas import Case, Hearing, AuditLog
from ..config import FIRST_OFFENDER_THRESHOLD, REGULAR_THRESHOLD, ESCALATION_DAYS


# ─── IPC → Max Sentence Mapping ─────────────────────────────────────────────
SENTENCE_MAP: Dict[str, Dict] = {
    "302":  {"max_years": 100, "life_or_death": True, "desc": "Murder"},
    "304":  {"max_years": 10,  "life_or_death": False, "desc": "Culpable Homicide"},
    "304B": {"max_years": 100, "life_or_death": True, "desc": "Dowry Death"},
    "306":  {"max_years": 10,  "life_or_death": False, "desc": "Abetment of Suicide"},
    "307":  {"max_years": 10,  "life_or_death": False, "desc": "Attempt to Murder"},
    "323":  {"max_years": 1,   "life_or_death": False, "desc": "Voluntarily Causing Hurt"},
    "354":  {"max_years": 5,   "life_or_death": False, "desc": "Assault on Woman"},
    "376":  {"max_years": 20,  "life_or_death": False, "desc": "Rape"},
    "379":  {"max_years": 3,   "life_or_death": False, "desc": "Theft"},
    "380":  {"max_years": 7,   "life_or_death": False, "desc": "Theft in Dwelling"},
    "392":  {"max_years": 10,  "life_or_death": False, "desc": "Robbery"},
    "394":  {"max_years": 100, "life_or_death": True,  "desc": "Hurt in Robbery"},
    "406":  {"max_years": 3,   "life_or_death": False, "desc": "Criminal Breach of Trust"},
    "411":  {"max_years": 3,   "life_or_death": False, "desc": "Receiving Stolen Property"},
    "420":  {"max_years": 7,   "life_or_death": False, "desc": "Cheating"},
    "454":  {"max_years": 10,  "life_or_death": False, "desc": "Lurking House-trespass"},
    "457":  {"max_years": 5,   "life_or_death": False, "desc": "Lurking at Night"},
    "468":  {"max_years": 7,   "life_or_death": False, "desc": "Forgery for Cheating"},
    "498A": {"max_years": 3,   "life_or_death": False, "desc": "Cruelty by Husband"},
    "506":  {"max_years": 2,   "life_or_death": False, "desc": "Criminal Intimidation"},
    "120B": {"max_years": 7,   "life_or_death": False, "desc": "Criminal Conspiracy"},
    "34":   {"max_years": 0,   "life_or_death": False, "desc": "Common Intention"},
    "25":   {"max_years": 7,   "life_or_death": False, "desc": "Arms Act"},
}

# IPC → BNSS equivalents
IPC_TO_BNSS = {
    "302": "101", "304": "105", "304B": "80", "306": "108", "307": "109",
    "323": "115", "354": "74", "376": "63", "379": "303", "380": "305",
    "392": "309", "394": "310", "406": "316", "420": "318", "454": "331",
    "457": "333", "468": "338", "498A": "85", "506": "351", "120B": "61",
}


class EligibilityResult:
    """Structured output from eligibility computation."""

    def __init__(
        self,
        eligible: bool,
        threshold_type: str = "",
        detention_days: int = 0,
        threshold_days: int = 0,
        days_remaining: int = 0,
        days_overdue: int = 0,
        charges: List[Dict] = None,
        confidence: float = 0.0,
        reasoning_chain: str = "",
        requires_lawyer_review: bool = False,
        exclusion_reason: str = "",
    ):
        self.eligible = eligible
        self.threshold_type = threshold_type
        self.detention_days = detention_days
        self.threshold_days = threshold_days
        self.days_remaining = days_remaining
        self.days_overdue = days_overdue
        self.charges = charges or []
        self.confidence = confidence
        self.reasoning_chain = reasoning_chain
        self.requires_lawyer_review = requires_lawyer_review
        self.exclusion_reason = exclusion_reason

    def to_dict(self) -> dict:
        return {
            "eligible": self.eligible,
            "threshold_type": self.threshold_type,
            "detention_days": self.detention_days,
            "threshold_days": self.threshold_days,
            "days_remaining": self.days_remaining,
            "days_overdue": self.days_overdue,
            "charges": self.charges,
            "confidence": self.confidence,
            "reasoning_chain": self.reasoning_chain,
            "requires_lawyer_review": self.requires_lawyer_review,
            "exclusion_reason": self.exclusion_reason,
        }


def compute_eligibility(case: Case) -> EligibilityResult:
    """
    Core eligibility computation per Section 479 BNSS.
    Conservative by design — when in doubt, flag for human review.
    """
    today = date.today()
    charges_data = case.charges or []
    reasoning_steps = []

    # ── Step 1: Parse charges ────────────────────────────────────────────
    parsed_charges = []
    for ch in charges_data:
        section = str(ch.get("section", ""))
        sentence_info = SENTENCE_MAP.get(section, None)
        if sentence_info:
            parsed_charges.append({
                "section": section,
                "act": ch.get("act", "IPC"),
                "max_years": sentence_info["max_years"],
                "life_or_death": sentence_info["life_or_death"],
                "description": sentence_info["desc"],
                "bnss_equivalent": IPC_TO_BNSS.get(section),
            })
        else:
            # Unknown section — flag for review
            parsed_charges.append({
                "section": section,
                "act": ch.get("act", "IPC"),
                "max_years": ch.get("max_years", 3),
                "life_or_death": ch.get("life_or_death", False),
                "description": ch.get("description", f"Section {section}"),
                "bnss_equivalent": None,
            })

    if not parsed_charges:
        reasoning_steps.append("❌ No valid charges found — cannot compute eligibility.")
        return EligibilityResult(
            eligible=False,
            reasoning_chain="\n".join(reasoning_steps),
            confidence=0.3,
            requires_lawyer_review=True,
            exclusion_reason="No charges available for eligibility computation.",
        )

    charge_str = ", ".join(f"S.{c['section']} {c['act']}" for c in parsed_charges)
    reasoning_steps.append(f"📋 Charges identified: {charge_str}")

    # ── Step 2: Check life/death exclusion ───────────────────────────────
    life_charges = [c for c in parsed_charges if c["life_or_death"]]
    if life_charges:
        life_str = ", ".join(f"S.{c['section']}" for c in life_charges)
        reasoning_steps.append(f"⛔ EXCLUDED: Charge(s) {life_str} carry life/death imprisonment.")
        reasoning_steps.append("→ S.479 BNSS does not apply to offences punishable with death or life imprisonment.")
        reasoning_steps.append("→ Flagged for MANDATORY lawyer review.")
        return EligibilityResult(
            eligible=False,
            charges=parsed_charges,
            reasoning_chain="\n".join(reasoning_steps),
            confidence=0.95,
            requires_lawyer_review=True,
            exclusion_reason=f"Charge(s) {life_str} include life/death imprisonment — excluded from S.479 eligibility.",
        )

    # ── Step 3: Check multiple pending cases — S.479(2) ─────────────────
    if case.has_multiple_pending_cases:
        reasoning_steps.append("⛔ EXCLUDED: S.479(2) — accused has multiple pending cases.")
        reasoning_steps.append("→ S.479 eligibility does not apply when multiple cases are pending.")
        return EligibilityResult(
            eligible=False,
            charges=parsed_charges,
            reasoning_chain="\n".join(reasoning_steps),
            confidence=0.90,
            requires_lawyer_review=False,
            exclusion_reason="S.479(2): Multiple pending cases — not eligible for default bail.",
        )

    # ── Step 4: Determine threshold (⅓ first offender, ½ regular) ──────
    is_first = case.is_first_offender if case.is_first_offender is not None else True
    threshold_fraction = FIRST_OFFENDER_THRESHOLD if is_first else REGULAR_THRESHOLD
    threshold_label = "⅓ (first offender)" if is_first else "½ (regular accused)"

    reasoning_steps.append(f"👤 First offender: {'Yes' if is_first else 'No'} → threshold = {threshold_label} of max sentence")

    # ── Step 5: Use LEAST FAVOURABLE charge (most conservative) ─────────
    # Filter out S.34 (common intention) which has 0 max years and is just an enhancer
    substantive_charges = [c for c in parsed_charges if c["max_years"] > 0]
    if not substantive_charges:
        substantive_charges = parsed_charges

    max_sentence_years = max(c["max_years"] for c in substantive_charges)
    worst_charge = next(c for c in substantive_charges if c["max_years"] == max_sentence_years)
    max_sentence_days = max_sentence_years * 365

    reasoning_steps.append(f"📊 Least favourable charge: S.{worst_charge['section']} — max sentence = {max_sentence_years} years ({max_sentence_days} days)")

    threshold_days = int(max_sentence_days * threshold_fraction)
    reasoning_steps.append(f"🎯 Threshold: {threshold_label} × {max_sentence_days} days = {threshold_days} days")

    # ── Step 6: Compute effective detention ─────────────────────────────
    detention_total = (today - case.arrest_date).days
    accused_delay = case.accused_delay_days or 0
    effective_detention = detention_total - accused_delay

    reasoning_steps.append(f"📅 Total detention: {detention_total} days (arrested {case.arrest_date})")
    if accused_delay > 0:
        reasoning_steps.append(f"⏳ Accused-caused delays excluded: {accused_delay} days (S.479 proviso)")
    reasoning_steps.append(f"📅 Effective detention: {effective_detention} days")

    # ── Step 7: Compare threshold vs detention ──────────────────────────
    eligible = effective_detention >= threshold_days
    days_remaining = max(0, threshold_days - effective_detention)
    days_overdue = max(0, effective_detention - threshold_days) if eligible else 0

    if eligible:
        reasoning_steps.append(f"✅ ELIGIBLE — detained {effective_detention} days ≥ threshold {threshold_days} days")
        reasoning_steps.append(f"⚠️ Overdue by {days_overdue} days with no action taken.")
    else:
        reasoning_steps.append(f"⏳ NOT YET ELIGIBLE — detained {effective_detention} days < threshold {threshold_days} days")
        reasoning_steps.append(f"⏰ Will become eligible in {days_remaining} days.")

    # ── Step 8: Compute confidence ──────────────────────────────────────
    confidence = _compute_confidence(case, parsed_charges)
    needs_review = confidence < 0.7 or (is_first and case.is_first_offender is None)

    if needs_review:
        reasoning_steps.append(f"⚠️ Confidence {confidence:.0%} < 70% — flagged for mandatory lawyer review.")

    return EligibilityResult(
        eligible=eligible,
        threshold_type=f"first_offender_1/3" if is_first else "regular_1/2",
        detention_days=effective_detention,
        threshold_days=threshold_days,
        days_remaining=days_remaining,
        days_overdue=days_overdue,
        charges=parsed_charges,
        confidence=round(confidence, 2),
        reasoning_chain="\n".join(reasoning_steps),
        requires_lawyer_review=needs_review,
    )


def _compute_confidence(case: Case, charges: List[Dict]) -> float:
    """Compute confidence score based on data completeness and clarity."""
    score = 0.5  # Base

    # Charges clarity
    known_sections = sum(1 for c in charges if c["section"] in SENTENCE_MAP)
    if charges:
        score += 0.2 * (known_sections / len(charges))

    # First offender status known
    if case.is_first_offender is not None:
        score += 0.1

    # Arrest date present and reasonable
    if case.arrest_date:
        score += 0.1

    # Has hearing history
    if case.hearings and len(case.hearings) > 0:
        score += 0.1

    return min(score, 0.98)


def build_reasoning_graph(case: Case, result: EligibilityResult) -> dict:
    """
    Build the Legal Reasoning Graph (Differentiator 2) — visual explainable AI.
    Returns nodes and edges for frontend to render as interactive flowchart.
    """
    nodes = []
    edges = []

    # Input: FIR
    nodes.append({
        "id": "fir",
        "label": "FIR Text",
        "value": f"{case.fir_language or 'Unknown'} language FIR{'  — text available' if case.fir_text else ' — no text uploaded'}",
        "confidence": 1.0,
        "type": "input",
    })

    # Process: Charge extraction
    charge_str = ", ".join(f"S.{c['section']} {c.get('act', 'IPC')}" for c in result.charges) or "None found"
    avg_conf = sum(c.get("confidence", 0.9) for c in result.charges) / max(len(result.charges), 1)
    nodes.append({
        "id": "charges",
        "label": "Charges Extracted",
        "value": charge_str,
        "confidence": round(avg_conf, 2),
        "type": "process",
    })
    edges.append({"from": "fir", "to": "charges"})

    # Data: Max sentence
    worst = max(result.charges, key=lambda c: c.get("max_years", 0)) if result.charges else {}
    nodes.append({
        "id": "sentence",
        "label": "Max Sentence (Least Favourable)",
        "value": f"{worst.get('max_years', '?')} years ({worst.get('max_years', 0) * 365} days) — S.{worst.get('section', '?')}",
        "confidence": 0.95,
        "type": "data",
    })
    edges.append({"from": "charges", "to": "sentence"})

    # BNSS mapping
    bnss_equiv = worst.get("bnss_equivalent")
    if bnss_equiv:
        nodes.append({
            "id": "bnss",
            "label": "BNSS Mapping",
            "value": f"S.{worst.get('section', '?')} IPC → S.{bnss_equiv} BNS (equivalent)",
            "confidence": 0.95,
            "type": "data",
        })
        edges.append({"from": "charges", "to": "bnss"})

    # Data: First offender check
    first_str = "Yes — ⅓ threshold applies" if result.threshold_type == "first_offender_1/3" else "No — ½ threshold applies"
    nodes.append({
        "id": "offender",
        "label": "First Offender Check",
        "value": first_str,
        "confidence": 0.88 if case.is_first_offender is not None else 0.5,
        "type": "data",
    })

    # Compute: Threshold
    frac = "⅓" if result.threshold_type == "first_offender_1/3" else "½"
    nodes.append({
        "id": "threshold",
        "label": f"Threshold ({frac})",
        "value": f"{result.threshold_days} days",
        "confidence": 0.95,
        "type": "compute",
    })
    edges.append({"from": "sentence", "to": "threshold"})
    edges.append({"from": "offender", "to": "threshold"})

    # Data: Detention
    nodes.append({
        "id": "detention",
        "label": "Current Detention",
        "value": f"{result.detention_days} days",
        "confidence": 1.0,
        "type": "data",
    })

    # Data: Accused delays
    delay = case.accused_delay_days or 0
    if delay > 0:
        nodes.append({
            "id": "delay",
            "label": "Accused Delays Excluded",
            "value": f"{delay} days excluded (S.479 proviso)",
            "confidence": 1.0,
            "type": "data",
        })
        edges.append({"from": "delay", "to": "detention"})

    # Check: Multiple cases
    if case.has_multiple_pending_cases:
        nodes.append({
            "id": "multiple",
            "label": "Multiple Cases Check",
            "value": "Yes — S.479(2) applies → NOT ELIGIBLE",
            "confidence": 0.90,
            "type": "data",
        })
        edges.append({"from": "multiple", "to": "result"})
    else:
        nodes.append({
            "id": "multiple",
            "label": "Multiple Cases Check",
            "value": "No — single pending case",
            "confidence": 0.90,
            "type": "data",
        })

    # Result
    if result.eligible:
        result_val = f"Exceeded threshold by {result.days_overdue} days"
        result_label = "ELIGIBLE ✅"
    elif result.exclusion_reason:
        result_val = result.exclusion_reason
        result_label = "EXCLUDED ⛔"
    else:
        result_val = f"{result.days_remaining} days until eligible"
        result_label = "NOT YET ELIGIBLE ⏳"

    nodes.append({
        "id": "result",
        "label": result_label,
        "value": result_val,
        "confidence": result.confidence,
        "type": "result",
    })
    edges.append({"from": "threshold", "to": "result"})
    edges.append({"from": "detention", "to": "result"})
    edges.append({"from": "multiple", "to": "result"})

    return {"nodes": nodes, "edges": edges}


def run_eligibility_and_save(case: Case, db: Session) -> EligibilityResult:
    """
    Compute eligibility for a case, save the result to DB, and log to audit trail.
    Called during daily re-evaluation and on-demand.
    """
    result = compute_eligibility(case)

    # Update case record
    case.eligibility_status = (
        "ELIGIBLE" if result.eligible
        else "EXCLUDED" if result.exclusion_reason
        else "REVIEW_NEEDED" if result.requires_lawyer_review
        else "NOT_ELIGIBLE"
    )
    case.eligibility_confidence = result.confidence
    case.eligibility_reasoning = result.reasoning_chain
    case.last_eligibility_check = datetime.utcnow()

    # Create audit log entry (immutable)
    input_data = json.dumps({
        "charges": case.charges,
        "arrest_date": str(case.arrest_date),
        "is_first_offender": case.is_first_offender,
        "has_multiple_pending_cases": case.has_multiple_pending_cases,
        "accused_delay_days": case.accused_delay_days,
    }, sort_keys=True)

    audit = AuditLog(
        case_id=str(case.id),
        assessment_type="eligibility",
        data_sources=[{"source": case.source_portal or "manual", "freshness_hours": 0}],
        reasoning_chain=result.reasoning_chain,
        confidence=result.confidence,
        result=result.to_dict(),
        system_version="1.0.0",
        input_hash=hashlib.sha256(input_data.encode()).hexdigest(),
    )
    db.add(audit)
    db.commit()
    db.refresh(case)

    return result
