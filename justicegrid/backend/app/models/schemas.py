"""
SQLAlchemy ORM models — full JusticeGrid database schema.
Covers all 10 pillars: cases, hearings, prisons, courts, districts,
family contacts, audit logs, notifications, and federated learning nodes.
"""
import uuid
from sqlalchemy import (
    Column, String, Boolean, Date, DateTime, Integer, Float,
    ForeignKey, Text, Index, CheckConstraint, text
)
from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Districts ───────────────────────────────────────────────────────────────
class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    median_daily_wage = Column(Float)
    mgnrega_rate = Column(Float)
    median_monthly_income = Column(Float)
    population = Column(Integer)
    lat = Column(Float)
    lng = Column(Float)

    # Relationships
    prisons = relationship("Prison", back_populates="district")
    courts = relationship("Court", back_populates="district")
    cases = relationship("Case", back_populates="district")


# ─── Prisons ─────────────────────────────────────────────────────────────────
class Prison(Base):
    __tablename__ = "prisons"

    id = Column(String, primary_key=True, default=gen_uuid)
    prison_name = Column(String, nullable=False)
    district_id = Column(String, ForeignKey("districts.id"))
    state = Column(String, nullable=False)
    capacity = Column(Integer)
    current_population = Column(Integer)
    lat = Column(Float)   # For prison heatmap (Differentiator 5)
    lng = Column(Float)

    district = relationship("District", back_populates="prisons")
    cases = relationship("Case", back_populates="prison")


# ─── Courts ──────────────────────────────────────────────────────────────────
class Court(Base):
    __tablename__ = "courts"

    id = Column(String, primary_key=True, default=gen_uuid)
    court_name = Column(String, nullable=False)
    district_id = Column(String, ForeignKey("districts.id"))
    state = Column(String, nullable=False)
    historical_adjournment_rate = Column(Float)
    avg_bail_decision_days = Column(Integer)
    daily_case_load = Column(Integer)
    bail_grant_rate = Column(Float)  # For bail success predictor

    district = relationship("District", back_populates="courts")
    cases = relationship("Case", back_populates="court")
    hearings = relationship("Hearing", back_populates="court")


# ─── Users ───────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # paralegal, lawyer, supervisor, utrc, admin
    district_id = Column(String, ForeignKey("districts.id"), nullable=True)
    language_preference = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Cases (Core Entity) ────────────────────────────────────────────────────
class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_number = Column(String, unique=True, nullable=False, index=True)
    accused_name = Column(String, nullable=False)
    prison_id = Column(String, ForeignKey("prisons.id"))
    district_id = Column(String, ForeignKey("districts.id"))
    court_id = Column(String, ForeignKey("courts.id"))

    # Charges (JSONB for flexible multi-charge storage)
    charges = Column(JSON, nullable=False, default=list)
    fir_text = Column(Text, nullable=True)
    fir_language = Column(String(5), nullable=True)

    # Detention
    arrest_date = Column(Date, nullable=False)
    accused_delay_days = Column(Integer, default=0)  # S.479 proviso exclusion

    # Eligibility (Pillar 1)
    is_first_offender = Column(Boolean, nullable=True)
    has_multiple_pending_cases = Column(Boolean, default=False)
    eligibility_status = Column(String, default="PENDING")  # ELIGIBLE, NOT_ELIGIBLE, REVIEW_NEEDED, EXCLUDED, PENDING
    eligibility_confidence = Column(Float, nullable=True)
    eligibility_reasoning = Column(Text, nullable=True)
    last_eligibility_check = Column(DateTime(timezone=True), nullable=True)

    # Bail (Pillar 7)
    bail_granted = Column(Boolean, default=False)
    bail_granted_date = Column(Date, nullable=True)
    bail_success_probability = Column(Float, nullable=True)  # Differentiator 3
    surety_amount = Column(Float, nullable=True)
    surety_executed = Column(Boolean, default=False)

    # Priority (Pillar 2)
    priority_score = Column(Float, nullable=True)

    # Assignment
    assigned_paralegal_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_lawyer_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Metadata
    data_freshness = Column(DateTime(timezone=True), server_default=func.now())
    source_portal = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")  # ACTIVE, CLOSED, ANONYMIZED

    # DPDPA compliance
    pii_deletion_scheduled = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    prison = relationship("Prison", back_populates="cases")
    district = relationship("District", back_populates="cases")
    court = relationship("Court", back_populates="cases")
    hearings = relationship("Hearing", back_populates="case", order_by="Hearing.hearing_date")
    family_contacts = relationship("FamilyContact", back_populates="case")
    notifications = relationship("Notification", back_populates="case")

    # Indexes — critical for free tier performance
    __table_args__ = (
        Index("idx_cases_eligibility", "eligibility_status"),
        Index("idx_cases_surety_gap", "bail_granted", "surety_executed", "bail_granted_date"),
        Index("idx_cases_status", "status"),
    )


# ─── Hearings ────────────────────────────────────────────────────────────────
class Hearing(Base):
    __tablename__ = "hearings"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    hearing_date = Column(Date, nullable=False)
    court_id = Column(String, ForeignKey("courts.id"))
    judge_name = Column(String, nullable=True)
    outcome = Column(String, nullable=True)  # HEARD, ADJOURNED, BAIL_GRANTED, BAIL_DENIED, None (upcoming)
    next_hearing_date = Column(Date, nullable=True)
    adjournment_predicted_prob = Column(Float, nullable=True)
    adjournment_actual = Column(Boolean, nullable=True)
    charge_sheet_filed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="hearings")
    court = relationship("Court", back_populates="hearings")

    __table_args__ = (
        Index("idx_hearings_case_date", "case_id", "hearing_date"),
        Index("idx_hearings_upcoming", "hearing_date"),
    )


# ─── Family Contacts (DPDPA compliant) ──────────────────────────────────────
class FamilyContact(Base):
    __tablename__ = "family_contacts"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    phone_number = Column(String, nullable=False)
    preferred_language = Column(String(5), default="hi")
    preferred_dialect = Column(String(20), nullable=True)  # bhojpuri, rajasthani, etc.
    preferred_channel = Column(String, default="WHATSAPP")  # WHATSAPP, SMS, IVR
    consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime(timezone=True), nullable=True)
    consent_version = Column(String, nullable=True)
    last_notification_date = Column(DateTime(timezone=True), nullable=True)
    notification_count = Column(Integer, default=0)
    escalation_45_day_check = Column(Boolean, default=False)

    case = relationship("Case", back_populates="family_contacts")


# ─── Immutable Audit Log (Pillar 5) ─────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    assessment_type = Column(String, nullable=False)  # eligibility, priority, surety, bail_prediction, paralegal_action
    data_sources = Column(JSON, nullable=False)
    reasoning_chain = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    result = Column(JSON, nullable=False)
    paralegal_id = Column(String, nullable=True)
    paralegal_response = Column(String, nullable=True)  # acted_on, overrode, flagged, ignored
    override_reason = Column(Text, nullable=True)
    system_version = Column(String, default="1.0.0")
    input_hash = Column(String, nullable=True)

    __table_args__ = (
        Index("idx_audit_case_time", "case_id", "timestamp"),
    )


# ─── Notifications ──────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    contact_id = Column(String, ForeignKey("family_contacts.id"), nullable=True)
    channel = Column(String, nullable=False)  # WHATSAPP, SMS, IVR
    language = Column(String(5), nullable=False)
    content_type = Column(String, nullable=False)  # status_update, hearing_reminder, eligibility_alert
    content_summary = Column(Text, nullable=True)
    delivery_status = Column(String, default="PENDING")  # PENDING, SENT, DELIVERED, FAILED
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    retry_count = Column(Integer, default=0)

    case = relationship("Case", back_populates="notifications")


# ─── Federated Learning Nodes (Pillar 9) ────────────────────────────────────
class FLNode(Base):
    __tablename__ = "fl_nodes"

    id = Column(String, primary_key=True, default=gen_uuid)
    dlsa_code = Column(String, unique=True, nullable=False)
    dlsa_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    last_contribution = Column(DateTime(timezone=True), nullable=True)
    contribution_count = Column(Integer, default=0)
    data_quality_score = Column(Float, nullable=True)
    accuracy_improvement = Column(Float, nullable=True)  # How much this DLSA improved global model
    status = Column(String, default="ACTIVE")  # ACTIVE, WITHDRAWN, SUSPENDED
    withdrawal_proof = Column(String, nullable=True)  # Cryptographic hash
    withdrawal_date = Column(DateTime(timezone=True), nullable=True)


