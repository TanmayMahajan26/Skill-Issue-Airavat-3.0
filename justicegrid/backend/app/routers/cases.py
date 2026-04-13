"""
Cases API — priority queue, case detail, case actions.
The most-used endpoints by Laptop B's frontend.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date
from typing import Optional

from ..database import get_db
from ..models.schemas import Case, Hearing, Court, Prison, District, AuditLog
from ..models.responses import (
    CaseQueueResponse, CaseQueueItem, CaseDetailResponse,
    CountdownDisplay, CourtInfo, PrisonInfo, DistrictInfo, HearingInfo,
    CaseActionRequest, CaseActionResponse,
)
from ..models.requests import CaseCreateRequest
from ..services.priority_scorer import compute_one_line_reason, compute_next_action, run_priority_and_save
from ..services.eligibility_engine import run_eligibility_and_save
import uuid

import json
import redis
from ..config import REDIS_URL

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None

router = APIRouter()


def _build_countdown(case: Case) -> CountdownDisplay:
    """Compute Constitutional Countdown Clock data (Differentiator 1)."""
    today = date.today()
    charges = case.charges or []
    non_life = [c for c in charges if not c.get("life_or_death", False) and c.get("max_years", 0) > 0]
    
    if not non_life:
        return CountdownDisplay(days=None, display="N/A — excluded charge", type="na")
    
    max_years = max(c.get("max_years", 1) for c in non_life)
    is_first = case.is_first_offender if case.is_first_offender is not None else True
    threshold_days = int(max_years * 365 * (1/3 if is_first else 1/2))
    detention_days = (today - case.arrest_date).days - (case.accused_delay_days or 0)
    days_remaining = threshold_days - detention_days
    
    if days_remaining <= 0:
        return CountdownDisplay(
            days=days_remaining,
            display=f"OVERDUE by {abs(days_remaining)} days",
            type="overdue"
        )
    return CountdownDisplay(
        days=days_remaining,
        display=f"Eligible in {days_remaining} days",
        type="upcoming"
    )


def _compute_flags(case: Case, countdown: CountdownDisplay, next_hearing: Optional[Hearing]) -> list:
    """Compute status flags for queue display."""
    flags = []
    if countdown.type == "overdue":
        flags.append("OVERDUE")
    if countdown.days is not None and 0 < countdown.days <= 7:
        flags.append("TIME_SENSITIVE")
    if next_hearing and (next_hearing.hearing_date - date.today()).days <= 3:
        flags.append("HEARING_SOON")
    if not case.assigned_lawyer_id:
        flags.append("NO_LAWYER")
    if case.eligibility_status == "REVIEW_NEEDED" or case.eligibility_status == "EXCLUDED":
        flags.append("LAWYER_REVIEW")
    if case.bail_granted and not case.surety_executed:
        flags.append("SURETY_GAP")
    return flags


@router.get("/queue", response_model=CaseQueueResponse)
def get_case_queue(
    limit: int = Query(50, le=100),
    status: Optional[str] = Query(None, description="Filter by eligibility status"),
    state: Optional[str] = Query(None, description="Filter by state"),
    paralegal_id: Optional[str] = Query(None, description="Filter by assigned paralegal"),
    lawyer_id: Optional[str] = Query(None, description="Filter by assigned lawyer"),
    db: Session = Depends(get_db)
):
    """Priority-ranked case queue for paralegal — the main dashboard view."""
    cache_key = f"case_queue:{limit}:{status}:{state}:{paralegal_id}:{lawyer_id}"
    
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Redis cache read error: {e}")
            
    query = db.query(Case).filter(Case.status == "ACTIVE")
    if paralegal_id:
        query = query.filter(Case.assigned_paralegal_id == paralegal_id)
    if lawyer_id:
        query = query.filter(Case.assigned_lawyer_id == lawyer_id)
    if status:
        query = query.filter(Case.eligibility_status == status)
    if state:
        query = query.join(District).filter(District.state == state)
    
    cases = query.order_by(desc(Case.priority_score)).limit(limit).all()
    today = date.today()
    
    result = []
    for c in cases:
        next_hearing = db.query(Hearing).filter(
            Hearing.case_id == c.id,
            Hearing.hearing_date >= today,
            Hearing.outcome == None
        ).order_by(Hearing.hearing_date).first()
        
        court = db.query(Court).filter(Court.id == c.court_id).first()
        prison = db.query(Prison).filter(Prison.id == c.prison_id).first()
        district = db.query(District).filter(District.id == c.district_id).first()
        
        countdown = _build_countdown(c)
        flags = _compute_flags(c, countdown, next_hearing)
        detention_days = (today - c.arrest_date).days - (c.accused_delay_days or 0)
        
        result.append(CaseQueueItem(
            case_id=str(c.id),
            case_number=c.case_number,
            accused_name=c.accused_name,
            father_name=c.father_name,
            age=c.age,
            gender=c.gender,
            priority_score=c.priority_score or 0.0,
            one_line_reason=c.eligibility_reasoning or "Pending assessment",
            charges=c.charges or [],
            next_action=compute_next_action(c, db),
            confidence=c.eligibility_confidence or 0.0,
            bail_success_probability=c.bail_success_probability,
            eligibility_status=c.eligibility_status,
            countdown=countdown,
            flags=flags,
            state=district.state if district else "",
            court=court.court_name if court else "",
            prison=prison.prison_name if prison else "",
            detention_days=detention_days,
            next_hearing_date=str(next_hearing.hearing_date) if next_hearing else None,
            arrest_date=str(c.arrest_date),
            fir_number=c.fir_number,
            police_station=c.police_station,
        ))
    
    response_data = CaseQueueResponse(cases=result, total=len(result)).model_dump(mode="json")
    
    if redis_client:
        try:
            # Cache the response for 60 seconds (Hackathon optimized)
            redis_client.setex(cache_key, 60, json.dumps(response_data))
        except Exception as e:
            print(f"Redis cache write error: {e}")
            
    return response_data


@router.post("/", response_model=CaseDetailResponse)
def create_case(case_in: CaseCreateRequest, db: Session = Depends(get_db)):
    """
    SaaS feature: Manually add a case to the platform.
    Automatically runs ML eligibility and priority scoring.
    """
    # Parse date safely
    from datetime import datetime
    try:
        arr_date = datetime.strptime(case_in.arrest_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="arrest_date must be YYYY-MM-DD")

    case_number = case_in.fir_number or f"SaaS-{uuid.uuid4().hex[:6].upper()}"

    # Set dummy court/prison if none provided so UI stats don't crash
    # Just grabbing the first available if not provided.
    court_id = case_in.court_id
    if not court_id:
        first_court = db.query(Court).first()
        court_id = first_court.id if first_court else None
        
    prison_id = case_in.prison_id
    if not prison_id:
        first_prison = db.query(Prison).first()
        prison_id = first_prison.id if first_prison else None

    # Determine default district from court or prison
    district_id = case_in.district_id
    if not district_id and first_court:
        district_id = first_court.district_id

    db_case = Case(
        case_number=case_number,
        accused_name=case_in.accused_name,
        father_name=case_in.father_name,
        age=case_in.age,
        gender=case_in.gender,
        occupation=case_in.occupation,
        education=case_in.education,
        address=case_in.address,
        fir_number=case_in.fir_number,
        police_station=case_in.police_station,
        arrest_date=arr_date,
        is_first_offender=case_in.is_first_offender,
        charges=case_in.charges,
        court_id=court_id,
        prison_id=prison_id,
        district_id=district_id,
        assigned_lawyer_id=case_in.assigned_lawyer_id,
        assigned_paralegal_id=case_in.assigned_paralegal_id,
        status="ACTIVE",
        eligibility_status="PENDING",
        priority_score=0.0
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    # Trigger ML Pipeline
    run_eligibility_and_save(db_case, db)
    run_priority_and_save(db_case, db)

    # Return full detail response
    return get_case_detail(db_case.id, db)

@router.post("/extract_fir")
async def extract_fir_endpoint(file: UploadFile = File(...)):
    """
    SaaS feature: Upload FIR as PDF or TXT.
    Passes text to the Gemini Flash NLP charge extractor module.
    """
    import io
    from ai.nlp.charge_extractor import extract_charges
    
    if file.filename.endswith(".pdf"):
        import PyPDF2
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = " ".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
    else:
        text = (await file.read()).decode("utf-8", errors="ignore")
        
    charges = extract_charges(text, language="en")
    
    # Send the raw text snippet back for display/debugging constraints
    return {"extracted_text": text[:1000], "charges": charges}

@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    """Full case detail — shown when paralegal clicks a case from the queue."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    hearings = db.query(Hearing).filter(Hearing.case_id == case.id).order_by(Hearing.hearing_date).all()
    court = db.query(Court).filter(Court.id == case.court_id).first()
    prison = db.query(Prison).filter(Prison.id == case.prison_id).first()
    district = db.query(District).filter(District.id == case.district_id).first()
    countdown = _build_countdown(case)
    
    return CaseDetailResponse(
        id=str(case.id),
        case_number=case.case_number,
        accused_name=case.accused_name,
        father_name=case.father_name,
        age=case.age,
        gender=case.gender,
        address=case.address,
        occupation=case.occupation,
        education=case.education,
        lawyer_name=case.lawyer_name,
        fir_number=case.fir_number,
        police_station=case.police_station,
        charges=case.charges or [],
        arrest_date=str(case.arrest_date),
        detention_days=(date.today() - case.arrest_date).days,
        is_first_offender=case.is_first_offender,
        has_multiple_pending_cases=case.has_multiple_pending_cases,
        eligibility_status=case.eligibility_status,
        eligibility_confidence=case.eligibility_confidence,
        eligibility_reasoning=case.eligibility_reasoning,
        priority_score=case.priority_score,
        bail_granted=case.bail_granted,
        bail_granted_date=str(case.bail_granted_date) if case.bail_granted_date else None,
        surety_amount=case.surety_amount,
        surety_executed=case.surety_executed,
        bail_success_probability=case.bail_success_probability,
        court=CourtInfo(
            name=court.court_name,
            adj_rate=court.historical_adjournment_rate,
            bail_rate=court.bail_grant_rate,
            avg_bail_days=court.avg_bail_decision_days,
        ) if court else None,
        prison=PrisonInfo(name=prison.prison_name, state=prison.state) if prison else None,
        district=DistrictInfo(
            name=district.name,
            state=district.state,
            median_income=district.median_monthly_income,
        ) if district else None,
        hearings=[HearingInfo(
            id=str(h.id),
            date=str(h.hearing_date),
            outcome=h.outcome,
            judge=h.judge_name,
            adjournment_prob=h.adjournment_predicted_prob,
        ) for h in hearings],
        fir_language=case.fir_language,
        status=case.status,
        countdown=countdown,
    )


@router.get("")
def list_cases(
    skip: int = 0, limit: int = 20,
    search: Optional[str] = None,
    eligibility: Optional[str] = None,
    state: Optional[str] = None,
    paralegal_id: Optional[str] = None,
    lawyer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List cases with search and filters."""
    query = db.query(Case).filter(Case.status == "ACTIVE")
    if paralegal_id:
        query = query.filter(Case.assigned_paralegal_id == paralegal_id)
    if lawyer_id:
        query = query.filter(Case.assigned_lawyer_id == lawyer_id)
    if search:
        query = query.filter(
            (Case.case_number.ilike(f"%{search}%")) |
            (Case.accused_name.ilike(f"%{search}%"))
        )
    if eligibility:
        query = query.filter(Case.eligibility_status == eligibility)
    if state:
        query = query.join(District).filter(District.state == state)
    
    total = query.count()
    cases = query.order_by(desc(Case.priority_score)).offset(skip).limit(limit).all()
    
    return {
        "cases": [{
            "id": str(c.id),
            "case_number": c.case_number,
            "accused_name": c.accused_name,
            "eligibility_status": c.eligibility_status,
            "priority_score": c.priority_score,
            "arrest_date": str(c.arrest_date),
            "charges": c.charges,
            "bail_granted": c.bail_granted,
            "surety_executed": c.surety_executed,
            "surety_amount": c.surety_amount,
            "detention_days": (date.today() - c.arrest_date).days - (c.accused_delay_days or 0),
        } for c in cases],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/{case_id}/action", response_model=CaseActionResponse)
def record_action(case_id: str, action: CaseActionRequest, db: Session = Depends(get_db)):
    """Record paralegal action (acted_on, overrode, flagged, add_note)."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    audit = AuditLog(
        case_id=case_id,
        assessment_type="paralegal_action",
        data_sources=[{"source": "paralegal_input"}],
        reasoning_chain=action.reason or "",
        confidence=1.0,
        result={"type": action.type, "reason": action.reason},
        paralegal_id=action.paralegal_id,
        paralegal_response=action.type,
        override_reason=action.reason if action.type == "overrode" else None,
    )
    db.add(audit)
    db.commit()
    
    return CaseActionResponse(
        status="recorded",
        action=action.type,
        audit_id=str(audit.id),
    )
