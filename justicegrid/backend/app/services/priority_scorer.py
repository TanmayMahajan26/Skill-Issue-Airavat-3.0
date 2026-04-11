"""
Case Complexity Classification & Priority Scoring (Pillar 2).

Computes a composite priority score from 0-100 based on:
- Eligibility status & confidence (weight 0.30)
- Time sensitivity (weight 0.30)
- Action availability (weight 0.20)
- Court behaviour / adjournment rate (weight 0.15)
- Bail success probability bonus (weight 0.05)

Plus conflict resolution rules from Pillar 2.
"""
from datetime import date, datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from ..models.schemas import Case, Hearing, Court


def compute_priority_score(case: Case, db: Session) -> float:
    """
    Compute composite priority score (0-100) for a case.
    Higher = more urgently needs paralegal attention.
    """
    today = date.today()
    
    # ── Eligibility Signal (E) — weight 0.30 ────────────────────────────
    e_score = 0.0
    if case.eligibility_status == "ELIGIBLE":
        e_score = 1.0 * (case.eligibility_confidence or 0.5)
    elif case.eligibility_status == "REVIEW_NEEDED":
        e_score = 0.7  # Needs attention even if uncertain
    elif case.eligibility_status == "NOT_ELIGIBLE":
        # Check how close to eligibility window
        detention_days = (today - case.arrest_date).days - (case.accused_delay_days or 0)
        charges = case.charges or []
        non_life = [c for c in charges if not c.get("life_or_death", False) and c.get("max_years", 0) > 0]
        if non_life:
            max_years = max(c.get("max_years", 1) for c in non_life)
            is_first = case.is_first_offender if case.is_first_offender is not None else True
            threshold = max_years * 365 * (1/3 if is_first else 1/2)
            days_remaining = threshold - detention_days
            if 0 < days_remaining <= 30:
                e_score = 0.5 * (1 - days_remaining / 30)  # Approaching eligibility
    elif case.eligibility_status == "EXCLUDED":
        e_score = 0.2  # Still needs some attention (lawyer review)

    # ── Time Sensitivity (T) — weight 0.30 ──────────────────────────────
    t_score = 0.0
    
    # Next hearing proximity
    next_hearing = db.query(Hearing).filter(
        Hearing.case_id == case.id,
        Hearing.outcome == None,
        Hearing.hearing_date >= today
    ).order_by(Hearing.hearing_date).first()
    
    if next_hearing:
        days_to_hearing = (next_hearing.hearing_date - today).days
        if days_to_hearing <= 1:
            t_score += 0.5  # Hearing tomorrow or today
        elif days_to_hearing <= 3:
            t_score += 0.4
        elif days_to_hearing <= 7:
            t_score += 0.3
        elif days_to_hearing <= 14:
            t_score += 0.2
    
    # Days since last action (staleness)
    last_hearing = db.query(Hearing).filter(
        Hearing.case_id == case.id,
        Hearing.outcome != None
    ).order_by(Hearing.hearing_date.desc()).first()
    
    if last_hearing and last_hearing.hearing_date:
        days_since_action = (today - last_hearing.hearing_date).days
        if days_since_action > 60:
            t_score += 0.3
        elif days_since_action > 30:
            t_score += 0.2
        elif days_since_action > 14:
            t_score += 0.1
    else:
        t_score += 0.2  # No hearing history — needs attention

    # Overdue eligible cases get max time score
    if case.eligibility_status == "ELIGIBLE":
        detention_days = (today - case.arrest_date).days
        if detention_days > 365:
            t_score = min(t_score + 0.3, 1.0)

    t_score = min(t_score, 1.0)

    # ── Action Availability (A) — weight 0.20 ───────────────────────────
    a_score = 0.0
    
    # No lawyer assigned
    if not case.assigned_lawyer_id:
        a_score += 0.4  # Critical gap
    
    # No paralegal assigned
    if not case.assigned_paralegal_id:
        a_score += 0.3
    
    # Bail application not filed (eligible but no bail)
    if case.eligibility_status == "ELIGIBLE" and not case.bail_granted:
        a_score += 0.3

    a_score = min(a_score, 1.0)

    # ── Court Behaviour (C) — weight 0.15 ───────────────────────────────
    c_score = 0.0
    if case.court:
        court = db.query(Court).filter(Court.id == case.court_id).first()
        if court and court.historical_adjournment_rate:
            # Lower adjournment rate = HIGHER score (cases with effective courts are worth pursuing)
            c_score = 1 - court.historical_adjournment_rate
    
    # ── Bail Success Bonus (B) — weight 0.05 ────────────────────────────
    b_score = case.bail_success_probability or 0.0

    # ── Composite Score ─────────────────────────────────────────────────
    raw_score = (
        0.30 * e_score +
        0.30 * t_score +
        0.20 * a_score +
        0.15 * c_score +
        0.05 * b_score
    )

    # ── Conflict Resolution (Pillar 2 rules) ────────────────────────────
    
    # Rule 1: Life charge → cap score, force lawyer review
    if case.eligibility_status == "EXCLUDED":
        raw_score = min(raw_score, 0.45)
    
    # Rule 2: High adjournment probability → rank below real windows
    if next_hearing and case.court:
        court = db.query(Court).filter(Court.id == case.court_id).first()
        if court and court.historical_adjournment_rate and court.historical_adjournment_rate > 0.75:
            raw_score *= 0.85  # 15% penalty for likely adjournment

    # Rule 3: Low confidence eligible → slight penalty (needs review first)
    if case.eligibility_status == "ELIGIBLE" and (case.eligibility_confidence or 0) < 0.7:
        raw_score *= 0.9

    # Scale to 0-100
    priority = round(raw_score * 100, 1)
    return max(0.0, min(100.0, priority))


def compute_one_line_reason(case: Case, db: Session) -> str:
    """Generate a single-line reason for the case's priority ranking."""
    today = date.today()
    detention_days = (today - case.arrest_date).days

    if case.eligibility_status == "ELIGIBLE":
        if not case.bail_granted:
            # Find how long overdue
            charges = case.charges or []
            non_life = [c for c in charges if not c.get("life_or_death", False) and c.get("max_years", 0) > 0]
            if non_life:
                max_years = max(c.get("max_years", 1) for c in non_life)
                is_first = case.is_first_offender if case.is_first_offender is not None else True
                threshold = int(max_years * 365 * (1/3 if is_first else 1/2))
                overdue = detention_days - (case.accused_delay_days or 0) - threshold
                if overdue > 0:
                    return f"Eligible under S.479 — {'first offender' if is_first else 'regular accused'}, overdue by {overdue} days, no bail application filed"
            return f"Eligible under S.479 — detained {detention_days} days, action needed"
        elif case.surety_amount and not case.surety_executed:
            return f"Bail granted but surety ₹{case.surety_amount:,.0f} unexecuted — financial barrier"
    
    elif case.eligibility_status == "EXCLUDED":
        return "Life/death charge — excluded from S.479, flagged for lawyer review"
    
    elif case.eligibility_status == "REVIEW_NEEDED":
        return f"Low confidence assessment — requires mandatory lawyer review before eligibility determination"
    
    elif case.eligibility_status == "NOT_ELIGIBLE":
        # Check proximity to eligibility
        charges = case.charges or []
        non_life = [c for c in charges if not c.get("life_or_death", False) and c.get("max_years", 0) > 0]
        if non_life:
            max_years = max(c.get("max_years", 1) for c in non_life)
            is_first = case.is_first_offender if case.is_first_offender is not None else True
            threshold = int(max_years * 365 * (1/3 if is_first else 1/2))
            effective = detention_days - (case.accused_delay_days or 0)
            remaining = threshold - effective
            if 0 < remaining <= 30:
                return f"Approaching eligibility — {remaining} days until S.479 threshold"
    
    return f"Pending assessment — detained {detention_days} days"


def compute_next_action(case: Case, db: Session) -> str:
    """Determine the recommended next action for the case."""
    today = date.today()
    
    next_hearing = db.query(Hearing).filter(
        Hearing.case_id == case.id,
        Hearing.outcome == None,
        Hearing.hearing_date >= today
    ).order_by(Hearing.hearing_date).first()

    if case.eligibility_status == "ELIGIBLE" and not case.bail_granted:
        if next_hearing:
            days = (next_hearing.hearing_date - today).days
            return f"File bail application before {next_hearing.hearing_date} hearing ({days} days)"
        return "File bail application — no upcoming hearing scheduled"
    
    if case.eligibility_status == "ELIGIBLE" and case.bail_granted and not case.surety_executed:
        return "Generate S.440 surety reduction brief — surety unexecuted"
    
    if case.eligibility_status == "EXCLUDED":
        return "Lawyer review required — life/death charge"
    
    if case.eligibility_status == "REVIEW_NEEDED":
        return "Mandatory lawyer review before eligibility determination"
    
    if next_hearing:
        days = (next_hearing.hearing_date - today).days
        return f"Prepare for hearing on {next_hearing.hearing_date} ({days} days)"
    
    return "Monitor — no immediate action required"


def run_priority_and_save(case: Case, db: Session) -> float:
    """Compute priority, one-line reason, next action, and save to case."""
    score = compute_priority_score(case, db)
    reason = compute_one_line_reason(case, db)
    action = compute_next_action(case, db)

    case.priority_score = score
    case.eligibility_reasoning = reason  # We store the one-liner here for queue display

    db.commit()
    db.refresh(case)

    return score
