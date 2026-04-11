"""
Drafts API — one-click legal document generation.
Each endpoint generates a distinct petition type — no overlap.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.schemas import Case
from ..services.petition_generator import (
    generate_s479_petition,
    generate_pr_bond_petition,
    generate_s440_reduction,
)

router = APIRouter()


@router.get("/s479/{case_id}", response_class=PlainTextResponse)
def draft_s479_petition(case_id: str, db: Session = Depends(get_db)):
    """Generate a S.479 BNSS bail petition for an eligible undertrial."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    if case.eligibility_status != "ELIGIBLE":
        raise HTTPException(400, f"Case is {case.eligibility_status}, not ELIGIBLE for S.479 petition")
    if case.bail_granted:
        raise HTTPException(400, "Bail already granted — S.479 petition not applicable")
    return generate_s479_petition(case, db)


@router.get("/pr-bond/{case_id}", response_class=PlainTextResponse)
def draft_pr_bond_petition(case_id: str, db: Session = Depends(get_db)):
    """Generate a PR Bond petition for an accused with unexecuted surety."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    if not case.bail_granted:
        raise HTTPException(400, "Bail not granted — PR Bond not applicable")
    if case.surety_executed:
        raise HTTPException(400, "Surety already executed — PR Bond not needed")
    return generate_pr_bond_petition(case, db)


@router.get("/s440/{case_id}", response_class=PlainTextResponse)
def draft_s440_reduction(case_id: str, db: Session = Depends(get_db)):
    """Generate a S.440 Surety Reduction application."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    if not case.bail_granted or not case.surety_amount:
        raise HTTPException(400, "No bail or surety amount — S.440 not applicable")
    return generate_s440_reduction(case, db)
