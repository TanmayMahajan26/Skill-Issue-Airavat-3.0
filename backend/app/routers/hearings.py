"""
Hearings API (Pillar 8) — upcoming hearings, adjournment predictions.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc
from datetime import date, timedelta
from typing import Optional

from ..database import get_db
from ..models.schemas import Case, Hearing, Court

router = APIRouter()


@router.get("/upcoming")
def upcoming_hearings(
    days: int = Query(14, description="Number of days ahead to look"),
    db: Session = Depends(get_db)
):
    """List upcoming hearings with adjournment predictions."""
    today = date.today()
    end_date = today + timedelta(days=days)
    
    hearings = db.query(Hearing).filter(
        Hearing.hearing_date >= today,
        Hearing.hearing_date <= end_date,
        Hearing.outcome == None,
    ).order_by(asc(Hearing.hearing_date)).all()
    
    result = []
    for h in hearings:
        case = db.query(Case).filter(Case.id == h.case_id).first()
        court = db.query(Court).filter(Court.id == h.court_id).first()
        
        adj_prob = h.adjournment_predicted_prob
        if adj_prob is None and court:
            adj_prob = court.historical_adjournment_rate
        
        reprioritize_msg = None
        if adj_prob and adj_prob > 0.75 and case and case.eligibility_status == "ELIGIBLE":
            reprioritize_msg = f"⚠️ {adj_prob*100:.0f}% likely to be adjourned — consider other ELIGIBLE cases first"
        
        result.append({
            "id": str(h.id),
            "case_id": str(h.case_id),
            "case_number": case.case_number if case else "",
            "hearing_date": str(h.hearing_date),
            "court": court.court_name if court else "",
            "judge": h.judge_name,
            "adjournment_probability": round((adj_prob or 0) * 100, 1),
            "uncertainty": "HIGH" if not adj_prob else "LOW" if adj_prob < 0.5 else "MEDIUM",
            "charge_sheet_filed": h.charge_sheet_filed,
            "eligibility_status": case.eligibility_status if case else "UNKNOWN",
            "reprioritize_message": reprioritize_msg,
            "disclaimer": "This prediction is an input to judgment, not an instruction.",
        })
    
    return {"hearings": result, "total": len(result)}


@router.get("/{hearing_id}/adjournment")
def get_adjournment_prediction(hearing_id: str, db: Session = Depends(get_db)):
    """Detailed adjournment prediction for a specific hearing (Pillar 8)."""
    hearing = db.query(Hearing).filter(Hearing.id == hearing_id).first()
    if not hearing:
        return {"error": "Hearing not found"}
    
    court = db.query(Court).filter(Court.id == hearing.court_id).first()
    case = db.query(Case).filter(Case.id == hearing.case_id).first()
    
    # Count consecutive prior adjournments
    prior_hearings = db.query(Hearing).filter(
        Hearing.case_id == hearing.case_id,
        Hearing.hearing_date < hearing.hearing_date,
    ).order_by(Hearing.hearing_date.desc()).limit(10).all()
    
    consecutive_adj = 0
    for ph in prior_hearings:
        if ph.outcome == "ADJOURNED":
            consecutive_adj += 1
        else:
            break
    
    # Feature-based prediction
    adj_rate = court.historical_adjournment_rate if court else 0.5
    day_of_week = hearing.hearing_date.weekday() if hearing.hearing_date else 2
    
    # Simple prediction model (until Laptop C's XGBoost is integrated)
    prob = adj_rate * 0.5 + (consecutive_adj / 10) * 0.2 + (0.1 if not hearing.charge_sheet_filed else 0) + (0.05 if day_of_week == 0 else 0)
    prob = min(max(prob, 0.1), 0.95)
    
    key_factors = []
    if adj_rate > 0.7:
        key_factors.append({"feature": "Court adjournment rate", "importance": 0.4, "value": f"{adj_rate*100:.0f}%"})
    if consecutive_adj > 2:
        key_factors.append({"feature": "Consecutive adjournments", "importance": 0.25, "value": str(consecutive_adj)})
    if not hearing.charge_sheet_filed:
        key_factors.append({"feature": "Charge sheet not filed", "importance": 0.2, "value": "No"})
    
    return {
        "hearing_id": hearing_id,
        "case_number": case.case_number if case else "",
        "probability": round(prob * 100, 1),
        "ci_low": round(max(prob - 0.12, 0.05) * 100, 1),
        "ci_high": round(min(prob + 0.12, 0.98) * 100, 1),
        "key_factors": key_factors,
        "uncertainty": "HIGH" if abs(prob - 0.5) < 0.15 else "LOW",
        "consecutive_adjournments": consecutive_adj,
        "court_avg_rate": round((adj_rate or 0) * 100, 1),
        "disclaimer": "This prediction is an input to judgment, not an instruction.",
    }
