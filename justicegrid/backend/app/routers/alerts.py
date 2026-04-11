"""
Alert Engine — computes real-time legal intelligence alerts.

Three distinct alert types:
1. DEFAULT_BAIL (S.187 BNSS) — charge sheet deadline missed
2. CUSTODY_OVERLAP (Ghost Warrant) — bail granted but still incarcerated
3. PR_BOND_TRIGGER — surety unexecuted for 30+ days
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from ..database import get_db
from ..models.schemas import Case, Hearing, Court, District

router = APIRouter()


def _compute_default_bail_status(case: Case, db: Session) -> dict | None:
    """
    S.187 BNSS (formerly S.167(2) CrPC).
    If police fail to file charge sheet within 60 days (lesser crimes)
    or 90 days (death/life/10+ years), accused has indefeasible right to bail.
    """
    today = date.today()
    arrest = case.arrest_date
    if not arrest:
        return None

    charges = case.charges or []
    if not charges:
        return None

    # Determine track: 90-day if any charge has max_years >= 10 or life_or_death
    is_90_day = any(
        c.get("life_or_death", False) or c.get("max_years", 0) >= 10
        for c in charges
    )
    deadline_days = 90 if is_90_day else 60
    warning_day = deadline_days - 5  # 5-day early warning

    days_since_arrest = (today - arrest).days

    # Check if charge sheet was filed (any hearing with charge_sheet_filed=True)
    cs_filed = db.query(Hearing).filter(
        Hearing.case_id == case.id,
        Hearing.charge_sheet_filed == True,
    ).first()

    charge_sheet_filed = cs_filed is not None

    if charge_sheet_filed:
        return None  # No alert needed

    if days_since_arrest > deadline_days:
        return {
            "type": "DEFAULT_BAIL",
            "severity": "CRITICAL",
            "track": f"{deadline_days}-day",
            "days_since_arrest": days_since_arrest,
            "days_overdue": days_since_arrest - deadline_days,
            "message": f"🚨 MANDATORY DEFAULT BAIL — Charge sheet not filed in {deadline_days} days. {days_since_arrest - deadline_days} days overdue. File immediately under S.187 BNSS.",
            "action": "File default bail application immediately",
        }
    elif days_since_arrest >= warning_day:
        return {
            "type": "DEFAULT_BAIL",
            "severity": "WARNING",
            "track": f"{deadline_days}-day",
            "days_since_arrest": days_since_arrest,
            "days_remaining": deadline_days - days_since_arrest,
            "message": f"⚠️ Approaching Default Bail Window — {deadline_days - days_since_arrest} days remaining. No charge sheet filed.",
            "action": "Prepare default bail application",
        }

    return None


def _compute_custody_overlap(case: Case, db: Session) -> dict | None:
    """
    Ghost Warrant Resolver.
    If bail is granted but the person is still in prison after 48 hours,
    check for secondary FIR / custody overlap.
    """
    today = date.today()

    if not case.bail_granted or not case.bail_granted_date:
        return None

    days_since_bail = (today - case.bail_granted_date).days
    if days_since_bail < 2:
        return None  # Give 48 hours

    # Check if surety was executed — if yes, person should be out
    if case.surety_executed:
        # Person should be released. Check if status is still ACTIVE (proxy for still in prison)
        # In a real system this would query prison API. Here we simulate with has_multiple_pending_cases
        if case.has_multiple_pending_cases:
            return {
                "type": "CUSTODY_OVERLAP",
                "severity": "CRITICAL",
                "days_since_bail": days_since_bail,
                "message": f"🔒 CUSTODY OVERLAP — Bail granted & surety executed {days_since_bail} days ago, but accused has multiple pending cases. Check for secondary FIR holding.",
                "action": "Query prison hold list for secondary FIR and file separate bail application",
            }

    return None


def _compute_pr_bond_trigger(case: Case, db: Session) -> dict | None:
    """
    PR Bond (Personal Recognizance) Trigger.
    If bail is granted but surety is unexecuted for 30+ days,
    the accused is likely destitute. Generate PR Bond petition.
    """
    today = date.today()

    if not case.bail_granted or not case.bail_granted_date:
        return None

    if case.surety_executed:
        return None  # Already executed

    days_since_bail = (today - case.bail_granted_date).days
    if days_since_bail < 30:
        return None

    district = db.query(District).filter(District.id == case.district_id).first()
    mgnrega_rate = district.mgnrega_rate if district else 300
    surety = case.surety_amount or 0

    days_of_wages = round(surety / max(mgnrega_rate, 1), 1) if surety > 0 else 0

    return {
        "type": "PR_BOND_TRIGGER",
        "severity": "HIGH",
        "days_since_bail": days_since_bail,
        "surety_amount": surety,
        "wages_equivalent_days": days_of_wages,
        "message": f"📋 PR Bond Eligible — Bail surety ₹{surety:,.0f} unexecuted for {days_since_bail} days ({days_of_wages} days of MGNREGA wages). File Personal Recognizance Bond petition.",
        "action": "Generate PR Bond petition for release on personal recognizance",
    }


@router.get("/active")
def get_active_alerts(
    paralegal_id: Optional[str] = Query(None),
    lawyer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Compute all active alerts for the user's assigned cases."""
    query = db.query(Case).filter(Case.status == "ACTIVE")

    if paralegal_id:
        query = query.filter(Case.assigned_paralegal_id == paralegal_id)
    if lawyer_id:
        query = query.filter(Case.assigned_lawyer_id == lawyer_id)

    cases = query.all()

    alerts = []
    for c in cases:
        # 1. Default Bail (S.187)
        db_alert = _compute_default_bail_status(c, db)
        if db_alert:
            db_alert["case_id"] = str(c.id)
            db_alert["case_number"] = c.case_number
            db_alert["accused_name"] = c.accused_name
            alerts.append(db_alert)

        # 2. Custody Overlap (Ghost Warrant)
        co_alert = _compute_custody_overlap(c, db)
        if co_alert:
            co_alert["case_id"] = str(c.id)
            co_alert["case_number"] = c.case_number
            co_alert["accused_name"] = c.accused_name
            alerts.append(co_alert)

        # 3. PR Bond Trigger
        pr_alert = _compute_pr_bond_trigger(c, db)
        if pr_alert:
            pr_alert["case_id"] = str(c.id)
            pr_alert["case_number"] = c.case_number
            pr_alert["accused_name"] = c.accused_name
            alerts.append(pr_alert)

    # Sort: CRITICAL first, then HIGH, then WARNING
    severity_order = {"CRITICAL": 0, "HIGH": 1, "WARNING": 2}
    alerts.sort(key=lambda a: severity_order.get(a.get("severity", ""), 3))

    return {
        "alerts": alerts,
        "total": len(alerts),
        "breakdown": {
            "default_bail": sum(1 for a in alerts if a["type"] == "DEFAULT_BAIL"),
            "custody_overlap": sum(1 for a in alerts if a["type"] == "CUSTODY_OVERLAP"),
            "pr_bond": sum(1 for a in alerts if a["type"] == "PR_BOND_TRIGGER"),
        },
    }


@router.get("/case/{case_id}")
def get_case_alerts(case_id: str, db: Session = Depends(get_db)):
    """Get alerts for a specific case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"alerts": []}

    alerts = []
    for fn in [_compute_default_bail_status, _compute_custody_overlap, _compute_pr_bond_trigger]:
        alert = fn(case, db)
        if alert:
            alert["case_id"] = str(case.id)
            alert["case_number"] = case.case_number
            alerts.append(alert)

    return {"alerts": alerts}
