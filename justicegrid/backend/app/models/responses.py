"""
Pydantic response models for API endpoints.
These define the exact JSON shapes that Laptop B's frontend consumes.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime


# ─── Common ──────────────────────────────────────────────────────────────────
class CountdownDisplay(BaseModel):
    days: Optional[int] = None
    display: str = "N/A"
    type: str = "na"  # "overdue", "upcoming", "na"


class ChargeInfo(BaseModel):
    section: str
    act: str = "IPC"
    description: str = ""
    max_years: Optional[int] = None
    life_or_death: bool = False
    bnss_equivalent: Optional[str] = None


# ─── Cases ───────────────────────────────────────────────────────────────────
class CaseQueueItem(BaseModel):
    case_id: str
    case_number: str
    accused_name: str
    father_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    priority_score: float = 0.0
    one_line_reason: str = "Pending assessment"
    charges: List[Dict[str, Any]] = []
    next_action: str = ""
    confidence: float = 0.0
    bail_success_probability: Optional[float] = None
    eligibility_status: str = "PENDING"
    countdown: CountdownDisplay
    flags: List[str] = []
    state: str = ""
    court: str = ""
    prison: str = ""
    detention_days: int = 0
    next_hearing_date: Optional[str] = None
    arrest_date: str = ""
    fir_number: Optional[str] = None
    police_station: Optional[str] = None


class CaseQueueResponse(BaseModel):
    cases: List[CaseQueueItem]
    total: int


class CourtInfo(BaseModel):
    name: str
    adj_rate: Optional[float] = None
    bail_rate: Optional[float] = None
    avg_bail_days: Optional[int] = None


class PrisonInfo(BaseModel):
    name: str
    state: str


class DistrictInfo(BaseModel):
    name: str
    state: str
    median_income: Optional[float] = None


class HearingInfo(BaseModel):
    id: str
    date: str
    outcome: Optional[str] = None
    judge: Optional[str] = None
    adjournment_prob: Optional[float] = None


class CaseDetailResponse(BaseModel):
    id: str
    case_number: str
    accused_name: str
    father_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    lawyer_name: Optional[str] = None
    fir_number: Optional[str] = None
    police_station: Optional[str] = None
    charges: List[Dict[str, Any]] = []
    arrest_date: str
    detention_days: int
    is_first_offender: Optional[bool] = None
    has_multiple_pending_cases: bool = False
    eligibility_status: str
    eligibility_confidence: Optional[float] = None
    eligibility_reasoning: Optional[str] = None
    priority_score: Optional[float] = None
    bail_granted: bool = False
    bail_granted_date: Optional[str] = None
    surety_amount: Optional[float] = None
    surety_executed: bool = False
    bail_success_probability: Optional[float] = None
    court: Optional[CourtInfo] = None
    prison: Optional[PrisonInfo] = None
    district: Optional[DistrictInfo] = None
    hearings: List[HearingInfo] = []
    fir_language: Optional[str] = None
    status: str = "ACTIVE"
    countdown: Optional[CountdownDisplay] = None


# ─── Eligibility ─────────────────────────────────────────────────────────────
class EligibilityResponse(BaseModel):
    eligible: bool
    threshold_type: str = ""  # "first_offender_1/3" or "regular_1/2"
    detention_days: int = 0
    threshold_days: int = 0
    days_remaining: int = 0
    days_overdue: int = 0
    charges: List[Dict[str, Any]] = []
    confidence: float = 0.0
    reasoning_chain: str = ""
    requires_lawyer_review: bool = False
    countdown: CountdownDisplay
    exclusion_reason: Optional[str] = None


# ─── Reasoning Graph (Differentiator 2) ─────────────────────────────────────
class GraphNode(BaseModel):
    id: str
    label: str
    value: str
    confidence: float = 1.0
    type: str = "data"  # input, process, data, compute, result


class GraphEdge(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source: str = Field(..., alias="from")
    target: str = Field(..., alias="to")


class ReasoningGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


# ─── Analytics ───────────────────────────────────────────────────────────────
class PrisonHeatmapItem(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    eligible_count: int
    total_count: int
    pct: float
    state: str


class PrisonHeatmapResponse(BaseModel):
    prisons: List[PrisonHeatmapItem]


class ChargeDetnItem(BaseModel):
    charge: str
    avg_days: float
    count: int
    median_days: Optional[float] = None


class CourtPerfItem(BaseModel):
    court: str
    avg_bail_days: float
    adj_rate: float
    eligible_cases: int = 0


class DistrictCompItem(BaseModel):
    district: str
    state: str
    total_cases: int
    eligible_count: int
    eligible_pct: float
    avg_detention_days: float
    avg_surety_ratio: Optional[float] = None


# ─── Surety ──────────────────────────────────────────────────────────────────
class SuretyGapItem(BaseModel):
    case_id: str
    case_number: str
    accused_name: str
    bail_granted_date: Optional[str] = None
    days_since_bail: int = 0
    surety_amount: float = 0.0
    district_median_income: float = 0.0
    income_ratio: float = 0.0
    mgnrega_rate: float = 0.0
    action: str = ""  # INTERVENTION_NEEDED, S440_REDUCTION_CANDIDATE
    state: str = ""
    prison: str = ""


class SuretyGapResponse(BaseModel):
    cases: List[SuretyGapItem]
    total: int
    avg_ratio: float = 0.0


# ─── UTRC Dashboard ─────────────────────────────────────────────────────────
class UTRCSummary(BaseModel):
    total_active: int = 0
    total_eligible: int = 0
    total_overdue: int = 0
    total_action_needed: int = 0
    hearings_this_week: int = 0
    total_prisons: int = 0
    avg_detention_days: float = 0.0
    surety_gap_cases: int = 0


class UTRCDashboardResponse(BaseModel):
    summary: UTRCSummary
    states: List[Dict[str, Any]] = []
    top_prisons: List[Dict[str, Any]] = []


# ─── Audit ───────────────────────────────────────────────────────────────────
class AuditLogItem(BaseModel):
    id: str
    case_id: str
    timestamp: str
    assessment_type: str
    data_sources: Any
    reasoning_chain: str
    confidence: float
    result: Any
    paralegal_id: Optional[str] = None
    paralegal_response: Optional[str] = None
    override_reason: Optional[str] = None
    system_version: str = "1.0.0"


class AuditLogResponse(BaseModel):
    entries: List[AuditLogItem]
    total: int


# ─── Communication ──────────────────────────────────────────────────────────
class ChatSimulateRequest(BaseModel):
    message: str
    language: str = "hi"
    case_number: Optional[str] = None


class ChatSimulateResponse(BaseModel):
    response_text: str
    language: str
    intent: str = "case_query"
    offer_helpline: bool = False


class GlossaryLookupRequest(BaseModel):
    term: str
    language: str = "hi"


class GlossaryLookupResponse(BaseModel):
    term: str
    language: str
    explanation: str


# ─── System Health (Pillar 5 — Degradation) ─────────────────────────────────
class DataSourceHealth(BaseModel):
    source: str
    status: str  # healthy, degraded, down
    last_updated: Optional[str] = None
    is_stale: bool = False
    message: str = ""


class SystemHealthResponse(BaseModel):
    overall: str  # healthy, degraded, critical
    sources: List[DataSourceHealth]
    degradation_mode: bool = False


# ─── Federated Learning ─────────────────────────────────────────────────────
class FLNodeInfo(BaseModel):
    dlsa_code: str
    dlsa_name: str
    state: str
    status: str
    last_contribution: Optional[str] = None
    contribution_count: int = 0
    data_quality_score: Optional[float] = None
    accuracy_improvement: Optional[float] = None


class FLGovernanceResponse(BaseModel):
    total_nodes: int
    active_nodes: int
    withdrawn_nodes: int
    total_rounds: int = 0
    global_accuracy: float = 0.0
    nodes: List[FLNodeInfo]


# ─── Actions ─────────────────────────────────────────────────────────────────
class CaseActionRequest(BaseModel):
    type: str  # acted_on, overrode, flagged, add_note
    reason: str = ""
    paralegal_id: Optional[str] = None


class CaseActionResponse(BaseModel):
    status: str = "recorded"
    action: str = ""
    audit_id: str = ""
