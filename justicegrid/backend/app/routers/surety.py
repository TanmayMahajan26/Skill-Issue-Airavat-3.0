"""
Surety Gap Analysis API (Pillar 7) — bail surety & financial access intelligence.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from ..database import get_db
from ..models.schemas import Case, District, Prison
from ..models.responses import SuretyGapResponse, SuretyGapItem
from ..config import SURETY_MONTHS_THRESHOLD

router = APIRouter()


@router.get("/gap-report", response_model=SuretyGapResponse)
def surety_gap_report(db: Session = Depends(get_db)):
    """
    Identify bail granted >14 days with surety unexecuted.
    Cross-reference surety vs median income and MGNREGA rates (Pillar 7).
    """
    today = date.today()
    
    cases = db.query(Case).filter(
        Case.bail_granted == True,
        Case.surety_executed == False,
        Case.surety_amount != None,
        Case.surety_amount > 0,
        Case.status == "ACTIVE",
    ).all()
    
    result = []
    total_ratio = 0.0
    count = 0
    
    for c in cases:
        if not c.bail_granted_date:
            continue
        
        days_since_bail = (today - c.bail_granted_date).days
        if days_since_bail < 14:
            continue  # Only flag if >14 days
        
        district = db.query(District).filter(District.id == c.district_id).first()
        prison = db.query(Prison).filter(Prison.id == c.prison_id).first()
        
        median_income = district.median_monthly_income if district else 15000.0
        income_ratio = round(c.surety_amount / max(median_income, 1), 1)
        mgnrega = district.mgnrega_rate if district else 300.0
        
        action = "S440_REDUCTION_CANDIDATE" if income_ratio > SURETY_MONTHS_THRESHOLD else "INTERVENTION_NEEDED"
        
        total_ratio += income_ratio
        count += 1
        
        result.append(SuretyGapItem(
            case_id=str(c.id),
            case_number=c.case_number,
            accused_name=c.accused_name,
            bail_granted_date=str(c.bail_granted_date),
            days_since_bail=days_since_bail,
            surety_amount=c.surety_amount,
            district_median_income=median_income,
            income_ratio=income_ratio,
            mgnrega_rate=mgnrega,
            action=action,
            state=district.state if district else "",
            prison=prison.prison_name if prison else "",
        ))
    
    result.sort(key=lambda x: -x.income_ratio)
    avg_ratio = round(total_ratio / max(count, 1), 1)
    
    return SuretyGapResponse(cases=result, total=len(result), avg_ratio=avg_ratio)


@router.get("/systemic-patterns")
def surety_systemic_patterns(db: Session = Depends(get_db)):
    """Courts with systematically unaffordable surety amounts."""
    # Group surety cases by court/district
    cases = db.query(Case).filter(
        Case.bail_granted == True,
        Case.surety_amount != None,
        Case.surety_amount > 0,
        Case.status == "ACTIVE",
    ).all()
    
    court_surety = {}
    for c in cases:
        district = db.query(District).filter(District.id == c.district_id).first()
        if not district or not district.median_monthly_income:
            continue
        
        key = district.state + " — " + district.name
        if key not in court_surety:
            court_surety[key] = {"total_ratio": 0, "count": 0, "state": district.state}
        
        ratio = c.surety_amount / district.median_monthly_income
        court_surety[key]["total_ratio"] += ratio
        court_surety[key]["count"] += 1
    
    result = []
    for name, data in court_surety.items():
        avg_ratio = round(data["total_ratio"] / max(data["count"], 1), 1)
        result.append({
            "district": name,
            "state": data["state"],
            "avg_surety_income_ratio": avg_ratio,
            "case_count": data["count"],
            "classification": "UNAFFORDABLE" if avg_ratio > 3 else "HIGH" if avg_ratio > 1.5 else "MANAGEABLE",
        })
    
    result.sort(key=lambda x: -x["avg_surety_income_ratio"])
    return {"data": result}


@router.get("/{case_id}/reduction-brief")
def generate_reduction_brief(case_id: str, db: Session = Depends(get_db)):
    """
    Auto-generate S.440/S.483 BNSS surety reduction application brief (Differentiator 6).
    Always marked as DRAFT — requires lawyer review.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case or not case.surety_amount:
        return {"error": "Case not found or no surety amount"}
    
    district = db.query(District).filter(District.id == case.district_id).first()
    median_income = district.median_monthly_income if district else 15000.0
    ratio = round(case.surety_amount / max(median_income, 1), 1)
    mgnrega = district.mgnrega_rate if district else 300.0
    
    charges_str = ", ".join(f"S.{c.get('section', '?')} {c.get('act', 'IPC')}" for c in (case.charges or []))
    
    brief = f"""
DRAFT APPLICATION FOR REDUCTION OF SURETY — FOR LAWYER REVIEW ONLY

IN THE COURT OF ____________________

Case No.: {case.case_number}

APPLICATION UNDER SECTION 440 CrPC / SECTION 483 BNSS
FOR REDUCTION OF SURETY AMOUNT

RESPECTFULLY SHOWETH:

1. That the accused, {case.accused_name}, was arrested on {case.arrest_date} and has been 
   charged under {charges_str}.

2. That this Hon'ble Court was pleased to grant bail vide order dated {case.bail_granted_date}, 
   with surety of ₹{case.surety_amount:,.0f}.

3. That the accused belongs to {district.name if district else 'the'} district of {district.state if district else 'the state'}, 
   where the median monthly income is ₹{median_income:,.0f}.

4. That the surety amount of ₹{case.surety_amount:,.0f} represents approximately {ratio} months 
   of the local median income, making it effectively unaffordable.

5. That the MGNREGA daily wage rate in the district is ₹{mgnrega:,.0f}, meaning the surety 
   equals approximately {round(case.surety_amount / max(mgnrega, 1))} working days of wages.

FINANCIAL HARDSHIP:
- Current surety: ₹{case.surety_amount:,.0f}
- District median monthly income: ₹{median_income:,.0f}
- Surety-to-income ratio: {ratio}× monthly income
- MGNREGA rate: ₹{mgnrega:,.0f}/day
- The accused's family cannot arrange this amount through reasonable means.

LEGAL BASIS:
- Section 440 CrPC / Section 483 BNSS empowers the court to reduce surety where 
  the amount is excessive relative to the accused's financial means.
- Supreme Court in Moti Ram v State of MP (1978) held that bail conditions should 
  not be so onerous as to frustrate the very purpose of bail.
- NALSA guidelines emphasize that surety conditions should be reasonable and 
  proportional to the accused's socio-economic condition.

PRAYER:
It is therefore prayed that this Hon'ble Court may be pleased to:
(a) Reduce the surety amount from ₹{case.surety_amount:,.0f} to ₹{round(median_income * 1.5):,.0f} 
    (approximately 1.5 months of local median income);
(b) Alternatively, accept a personal bond in lieu of surety;
(c) Pass any other order as this Court deems fit.

⚠️ THIS IS AN AUTO-GENERATED DRAFT — REQUIRES LAWYER REVIEW AND MODIFICATION BEFORE FILING.
Generated by JusticeGrid on {date.today()}.
"""

    return {
        "brief": brief.strip(),
        "status": "DRAFT_FOR_LAWYER_REVIEW",
        "legal_basis": "S.440 CrPC / S.483 BNSS",
        "case_number": case.case_number,
        "current_surety": case.surety_amount,
        "suggested_surety": round(median_income * 1.5),
        "income_ratio": ratio,
        "supporting_precedents": [
            "Moti Ram v State of MP (1978) — AIR 1978 SC 1594",
            "Hussainara Khatoon v State of Bihar (1979) — AIR 1979 SC 1369",
        ],
    }
