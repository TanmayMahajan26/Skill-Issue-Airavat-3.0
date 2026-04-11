"""
Eligibility API — eligibility check, reasoning graph, countdown, batch recheck.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from ..database import get_db
from ..models.schemas import Case
from ..models.responses import (
    EligibilityResponse, CountdownDisplay, ReasoningGraphResponse
)
from ..services.eligibility_engine import (
    compute_eligibility, build_reasoning_graph, run_eligibility_and_save
)
from ..services.priority_scorer import run_priority_and_save

router = APIRouter()


@router.get("/cases/{case_id}", response_model=EligibilityResponse)
def get_eligibility(case_id: str, db: Session = Depends(get_db)):
    """Full eligibility assessment with reasoning chain and confidence."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result = compute_eligibility(case)
    
    today = date.today()
    detention_days = (today - case.arrest_date).days - (case.accused_delay_days or 0)
    
    countdown_type = "overdue" if result.eligible else "upcoming" if result.days_remaining > 0 else "na"
    countdown_display = (
        f"OVERDUE by {result.days_overdue} days" if result.eligible
        else f"Eligible in {result.days_remaining} days" if result.days_remaining > 0
        else "N/A"
    )
    
    return EligibilityResponse(
        eligible=result.eligible,
        threshold_type=result.threshold_type,
        detention_days=result.detention_days,
        threshold_days=result.threshold_days,
        days_remaining=result.days_remaining,
        days_overdue=result.days_overdue,
        charges=result.charges,
        confidence=result.confidence,
        reasoning_chain=result.reasoning_chain,
        requires_lawyer_review=result.requires_lawyer_review,
        countdown=CountdownDisplay(
            days=-result.days_overdue if result.eligible else result.days_remaining,
            display=countdown_display,
            type=countdown_type,
        ),
        exclusion_reason=result.exclusion_reason or None,
    )


@router.get("/cases/{case_id}/reasoning-graph", response_model=ReasoningGraphResponse)
def get_reasoning_graph(case_id: str, db: Session = Depends(get_db)):
    """Legal Reasoning Graph — Differentiator 2: visual explainable AI."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result = compute_eligibility(case)
    graph = build_reasoning_graph(case, result)
    
    return ReasoningGraphResponse(
        nodes=graph["nodes"],
        edges=graph["edges"],
    )


@router.post("/batch-recheck")
def batch_recheck(db: Session = Depends(get_db)):
    """
    Re-evaluate eligibility for ALL active cases — called by daily Celery task.
    Also updates priority scores.
    """
    cases = db.query(Case).filter(Case.status == "ACTIVE").all()
    updated = 0
    errors = 0
    
    for case in cases:
        try:
            run_eligibility_and_save(case, db)
            run_priority_and_save(case, db)
            updated += 1
        except Exception as e:
            errors += 1
            print(f"Error processing case {case.case_number}: {e}")
    
    return {
        "status": "completed",
        "total_cases": len(cases),
        "updated": updated,
        "errors": errors,
    }
