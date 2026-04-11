"""
UTRC Coordinator Dashboard API (Pillar 3) — prison overview, NALSA reports.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from ..database import get_db
from ..models.schemas import Case, Prison, District, Hearing
from ..models.responses import UTRCDashboardResponse, UTRCSummary

router = APIRouter()


@router.get("/dashboard", response_model=UTRCDashboardResponse)
def utrc_dashboard(db: Session = Depends(get_db)):
    """UTRC coordinator dashboard — prison-level aggregated view."""
    today = date.today()
    week_end = today + timedelta(days=7)
    
    active_cases = db.query(Case).filter(Case.status == "ACTIVE").all()
    
    total = len(active_cases)
    eligible = sum(1 for c in active_cases if c.eligibility_status == "ELIGIBLE")
    overdue = sum(1 for c in active_cases 
                  if c.eligibility_status == "ELIGIBLE" and not c.bail_granted)
    action_needed = sum(1 for c in active_cases 
                       if c.eligibility_status in ("ELIGIBLE", "REVIEW_NEEDED") and not c.bail_granted)
    
    hearings_week = db.query(Hearing).filter(
        Hearing.hearing_date >= today,
        Hearing.hearing_date <= week_end,
        Hearing.outcome == None,
    ).count()
    
    avg_detention = sum((today - c.arrest_date).days for c in active_cases) / max(total, 1)
    
    surety_gap = sum(1 for c in active_cases 
                    if c.bail_granted and not c.surety_executed and c.surety_amount)
    
    prisons = db.query(Prison).all()
    
    # State-level aggregation
    state_data = {}
    for c in active_cases:
        dist = db.query(District).filter(District.id == c.district_id).first()
        state = dist.state if dist else "Unknown"
        if state not in state_data:
            state_data[state] = {"total": 0, "eligible": 0, "overdue": 0}
        state_data[state]["total"] += 1
        if c.eligibility_status == "ELIGIBLE":
            state_data[state]["eligible"] += 1
            if not c.bail_granted:
                state_data[state]["overdue"] += 1
    
    states = [{"state": s, **d} for s, d in sorted(state_data.items(), key=lambda x: -x[1]["eligible"])]
    
    # Top prisons by eligible count
    top_prisons = []
    for p in prisons:
        p_cases = [c for c in active_cases if c.prison_id == p.id]
        p_eligible = sum(1 for c in p_cases if c.eligibility_status == "ELIGIBLE")
        if p_cases:
            top_prisons.append({
                "prison": p.prison_name,
                "state": p.state,
                "total": len(p_cases),
                "eligible": p_eligible,
                "pct": round(100 * p_eligible / len(p_cases), 1),
                "occupancy": round(100 * (p.current_population or 0) / max(p.capacity or 1, 1), 0),
            })
    
    top_prisons.sort(key=lambda x: -x["eligible"])
    
    return UTRCDashboardResponse(
        summary=UTRCSummary(
            total_active=total,
            total_eligible=eligible,
            total_overdue=overdue,
            total_action_needed=action_needed,
            hearings_this_week=hearings_week,
            total_prisons=len(prisons),
            avg_detention_days=round(avg_detention, 0),
            surety_gap_cases=surety_gap,
        ),
        states=states,
        top_prisons=top_prisons[:15],
    )


@router.get("/nalsa-report")
def nalsa_report(db: Session = Depends(get_db)):
    """One-click NALSA quarterly report data (Pillar 3)."""
    today = date.today()
    quarter_start = today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1)
    
    active_cases = db.query(Case).filter(Case.status == "ACTIVE").all()
    
    return {
        "report_period": f"{quarter_start} to {today}",
        "generated_at": str(today),
        "summary": {
            "total_undertrial": len(active_cases),
            "s479_eligible": sum(1 for c in active_cases if c.eligibility_status == "ELIGIBLE"),
            "bail_granted_unexecuted_surety": sum(1 for c in active_cases if c.bail_granted and not c.surety_executed),
            "cases_with_lawyer": sum(1 for c in active_cases if c.assigned_lawyer_id),
            "cases_without_lawyer": sum(1 for c in active_cases if not c.assigned_lawyer_id),
            "avg_detention_days": round(sum((today - c.arrest_date).days for c in active_cases) / max(len(active_cases), 1)),
        },
        "format_note": "Export to PDF/Excel via frontend download button",
    }
