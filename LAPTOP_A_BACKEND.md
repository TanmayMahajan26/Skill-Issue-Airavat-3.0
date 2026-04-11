# LAPTOP A — Backend Lead: Complete Instructions

> **Your role**: You are the SPINE of the product. Every API, database table, business logic, and data pipeline is yours.
> **Your folder**: `backend/` — ONLY you edit files here.
> **You go FIRST** — you create the repo, the database, the seed data. B & C depend on you.

---

## Pre-requisites (Install BEFORE the hackathon)

```bash
# Python 3.11+
python --version  # Must be 3.11 or higher

# pip packages (install globally or use venv)
pip install fastapi uvicorn[standard] sqlalchemy asyncpg psycopg2-binary
pip install pydantic python-dotenv celery[redis] redis
pip install pandas faker openpyxl reportlab
pip install python-jose[cryptography] passlib[bcrypt]
pip install httpx python-multipart

# Git
git --version

# Optional but helpful
pip install alembic  # DB migrations
```

---

## Step-by-Step Instructions

### STEP 1 (Minute 0-5): Create the repo

```bash
mkdir justicegrid && cd justicegrid
git init

# Create all folders
mkdir -p backend/app/{routers,services,models,tasks,middleware}
mkdir -p backend/seed
mkdir -p frontend
mkdir -p ai/{nlp,ml/models,federated,voice,writ_generator}
mkdir -p docs
```

Create `.gitignore`:
```
__pycache__/
*.pyc
.env
node_modules/
.next/
*.pkl
.DS_Store
venv/
.venv/
*.egg-info/
dist/
build/
```

Create `.env.example` (fill in real values after creating accounts):
```
DATABASE_URL=postgresql://user:pass@host/dbname
REDIS_URL=redis://default:pass@host:port
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
git add .
git commit -m "Initial project structure"
git remote add origin https://github.com/YOUR_USERNAME/justicegrid.git
git push -u origin main
```

**→ Message the group: "Repo is live. Clone: `git clone https://github.com/YOUR_USERNAME/justicegrid.git`"**

---

### STEP 2 (Minute 5-30): Create free-tier accounts

Create these accounts and save credentials:

1. **Neon PostgreSQL**: https://neon.tech → Create project "justicegrid" → Copy connection string
2. **Supabase**: https://supabase.com → Create project → Copy URL + anon key + service key
3. **Upstash Redis**: https://upstash.com → Create Redis database → Copy connection URL

**→ Share all credentials with B & C via private message (NOT in git)**

---

### STEP 3 (Hours 0-2): Database Schema

Create `backend/app/config.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
```

Create `backend/app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Create `backend/app/models/schemas.py` — ALL the SQLAlchemy models:
```python
from sqlalchemy import Column, String, Boolean, Date, DateTime, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base

class District(Base):
    __tablename__ = "districts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    median_daily_wage = Column(Float)
    mgnrega_rate = Column(Float)
    median_monthly_income = Column(Float)
    population = Column(Integer)
    lat = Column(Float)
    lng = Column(Float)

class Prison(Base):
    __tablename__ = "prisons"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prison_name = Column(String, nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"))
    state = Column(String, nullable=False)
    capacity = Column(Integer)
    current_population = Column(Integer)
    lat = Column(Float)
    lng = Column(Float)

class Court(Base):
    __tablename__ = "courts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    court_name = Column(String, nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"))
    state = Column(String, nullable=False)
    historical_adjournment_rate = Column(Float)
    avg_bail_decision_days = Column(Integer)
    daily_case_load = Column(Integer)
    bail_grant_rate = Column(Float)

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # paralegal, lawyer, supervisor, utrc, admin
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"))
    language_preference = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Case(Base):
    __tablename__ = "cases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String, unique=True, nullable=False)
    accused_name = Column(String, nullable=False)
    prison_id = Column(UUID(as_uuid=True), ForeignKey("prisons.id"))
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"))
    court_id = Column(UUID(as_uuid=True), ForeignKey("courts.id"))
    charges = Column(JSON, nullable=False, default=[])
    fir_text = Column(Text)
    fir_language = Column(String(5))
    arrest_date = Column(Date, nullable=False)
    accused_delay_days = Column(Integer, default=0)
    is_first_offender = Column(Boolean)
    has_multiple_pending_cases = Column(Boolean, default=False)
    eligibility_status = Column(String, default="PENDING")
    eligibility_confidence = Column(Float)
    eligibility_reasoning = Column(Text)
    last_eligibility_check = Column(DateTime(timezone=True))
    bail_granted = Column(Boolean, default=False)
    bail_granted_date = Column(Date)
    bail_success_probability = Column(Float)
    surety_amount = Column(Float)
    surety_executed = Column(Boolean, default=False)
    priority_score = Column(Float)
    assigned_paralegal_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_lawyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    data_freshness = Column(DateTime(timezone=True), server_default=func.now())
    source_portal = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Hearing(Base):
    __tablename__ = "hearings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    hearing_date = Column(Date, nullable=False)
    court_id = Column(UUID(as_uuid=True), ForeignKey("courts.id"))
    judge_name = Column(String)
    outcome = Column(String)  # HEARD, ADJOURNED, BAIL_GRANTED, BAIL_DENIED
    next_hearing_date = Column(Date)
    adjournment_predicted_prob = Column(Float)
    adjournment_actual = Column(Boolean)
    charge_sheet_filed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FamilyContact(Base):
    __tablename__ = "family_contacts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    phone_number = Column(String, nullable=False)
    preferred_language = Column(String(5), default="hi")
    preferred_dialect = Column(String(20))
    preferred_channel = Column(String, default="WHATSAPP")
    consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime(timezone=True))
    last_notification_date = Column(DateTime(timezone=True))
    notification_count = Column(Integer, default=0)

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    assessment_type = Column(String, nullable=False)
    data_sources = Column(JSON, nullable=False)
    reasoning_chain = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    result = Column(JSON, nullable=False)
    paralegal_id = Column(String)
    paralegal_response = Column(String)
    override_reason = Column(Text)
    system_version = Column(String, default="1.0.0")
    input_hash = Column(String)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    contact_id = Column(UUID(as_uuid=True), ForeignKey("family_contacts.id"))
    channel = Column(String, nullable=False)
    language = Column(String(5), nullable=False)
    content_type = Column(String, nullable=False)
    content_summary = Column(Text)
    delivery_status = Column(String, default="PENDING")
    sent_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    retry_count = Column(Integer, default=0)

class FLNode(Base):
    __tablename__ = "fl_nodes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dlsa_code = Column(String, unique=True, nullable=False)
    dlsa_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    last_contribution = Column(DateTime(timezone=True))
    contribution_count = Column(Integer, default=0)
    data_quality_score = Column(Float)
    status = Column(String, default="ACTIVE")
    withdrawal_proof = Column(String)
```

Create `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import cases, eligibility, hearings, surety, analytics, utrc, audit, admin, comms, nlp, fl

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JusticeGrid API",
    description="AI-Augmented Legal Intelligence for India's Undertrial Crisis",
    version="1.0.0"
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cases.router, prefix="/api/v1/cases", tags=["Cases"])
app.include_router(eligibility.router, prefix="/api/v1/eligibility", tags=["Eligibility"])
app.include_router(hearings.router, prefix="/api/v1/hearings", tags=["Hearings"])
app.include_router(surety.router, prefix="/api/v1/surety", tags=["Surety"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(utrc.router, prefix="/api/v1/utrc", tags=["UTRC"])
app.include_router(audit.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(comms.router, prefix="/api/v1/comms", tags=["Communication"])
app.include_router(nlp.router, prefix="/api/v1/nlp", tags=["NLP"])
app.include_router(fl.router, prefix="/api/v1/fl", tags=["Federated Learning"])

@app.get("/")
def root():
    return {"message": "JusticeGrid API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
```

Create empty router files (you'll fill them in later):
```python
# Create each of these files with a basic router:
# backend/app/routers/cases.py
# backend/app/routers/eligibility.py
# backend/app/routers/hearings.py
# backend/app/routers/surety.py
# backend/app/routers/analytics.py
# backend/app/routers/utrc.py
# backend/app/routers/audit.py
# backend/app/routers/admin.py
# backend/app/routers/comms.py
# backend/app/routers/nlp.py
# backend/app/routers/fl.py

# Template for each:
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

# Add endpoints here
```

Create `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
asyncpg==0.29.0
pydantic==2.5.0
python-dotenv==1.0.0
celery[redis]==5.3.6
redis==5.0.1
pandas==2.2.0
faker==22.0.0
openpyxl==3.1.2
reportlab==4.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.26.0
python-multipart==0.0.6
joblib==1.3.2
```

```bash
# Test it works
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Should see: Uvicorn running on http://127.0.0.1:8000
# Visit http://127.0.0.1:8000/docs — should see Swagger UI
```

```bash
cd ..
git add .
git commit -m "Backend foundation: schema, models, FastAPI app, all router stubs"
git push
```

**→ Message group: "PUSHED — Backend foundation. Schema is in backend/app/models/schemas.py. API runs at :8000/docs. Pull now."**

---

### STEP 4 (Hours 2-4): Seed Data Generator

Create `backend/seed/generate_data.py` — this is a LARGE file that generates realistic data:

```python
"""
Seed data generator for JusticeGrid.
Generates 5,000 synthetic undertrial cases across 5 Indian states.
Run: python -m seed.generate_data
"""
import random
import uuid
from datetime import date, datetime, timedelta
from faker import Faker
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models.schemas import *
from app.config import DATABASE_URL

fake = Faker('en_IN')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# --- Constants ---

STATES = {
    "Maharashtra": {"districts": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad"], "lang": "mr"},
    "Uttar Pradesh": {"districts": ["Lucknow", "Varanasi", "Allahabad", "Kanpur", "Agra"], "lang": "hi"},
    "Bihar": {"districts": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"], "lang": "hi"},
    "Tamil Nadu": {"districts": ["Chennai", "Madurai", "Coimbatore", "Salem", "Trichy"], "lang": "ta"},
    "West Bengal": {"districts": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur"], "lang": "bn"},
}

IPC_CHARGES = [
    {"section": "302", "act": "IPC", "description": "Murder", "max_years": 100, "life_or_death": True},
    {"section": "307", "act": "IPC", "description": "Attempt to Murder", "max_years": 10, "life_or_death": False},
    {"section": "376", "act": "IPC", "description": "Rape", "max_years": 20, "life_or_death": False},
    {"section": "379", "act": "IPC", "description": "Theft", "max_years": 3, "life_or_death": False},
    {"section": "380", "act": "IPC", "description": "Theft in Dwelling", "max_years": 7, "life_or_death": False},
    {"section": "392", "act": "IPC", "description": "Robbery", "max_years": 10, "life_or_death": False},
    {"section": "394", "act": "IPC", "description": "Voluntarily Causing Hurt in Robbery", "max_years": 100, "life_or_death": True},
    {"section": "420", "act": "IPC", "description": "Cheating", "max_years": 7, "life_or_death": False},
    {"section": "454", "act": "IPC", "description": "Lurking House-trespass", "max_years": 10, "life_or_death": False},
    {"section": "457", "act": "IPC", "description": "Lurking at Night", "max_years": 5, "life_or_death": False},
    {"section": "468", "act": "IPC", "description": "Forgery for Cheating", "max_years": 7, "life_or_death": False},
    {"section": "498A", "act": "IPC", "description": "Cruelty by Husband/Relatives", "max_years": 3, "life_or_death": False},
    {"section": "304B", "act": "IPC", "description": "Dowry Death", "max_years": 100, "life_or_death": True},
    {"section": "306", "act": "IPC", "description": "Abetment of Suicide", "max_years": 10, "life_or_death": False},
    {"section": "323", "act": "IPC", "description": "Voluntarily Causing Hurt", "max_years": 1, "life_or_death": False},
    {"section": "354", "act": "IPC", "description": "Assault on Woman", "max_years": 5, "life_or_death": False},
    {"section": "406", "act": "IPC", "description": "Criminal Breach of Trust", "max_years": 3, "life_or_death": False},
    {"section": "506", "act": "IPC", "description": "Criminal Intimidation", "max_years": 2, "life_or_death": False},
    {"section": "34", "act": "IPC", "description": "Common Intention (with others)", "max_years": 0, "life_or_death": False},
    {"section": "120B", "act": "IPC", "description": "Criminal Conspiracy", "max_years": 7, "life_or_death": False},
]

COURT_TYPES = ["Sessions Court", "Magistrate Court", "District Court", "Additional Sessions Court"]
JUDGE_NAMES = [fake.name() for _ in range(50)]

PRISON_COORDS = {
    "Maharashtra": [(18.52, 73.85), (19.08, 72.88), (21.15, 79.09), (19.99, 73.78), (19.88, 75.34)],
    "Uttar Pradesh": [(26.85, 80.95), (25.32, 82.99), (25.43, 81.84), (26.45, 80.35), (27.18, 78.02)],
    "Bihar": [(25.61, 85.14), (24.80, 85.01), (25.24, 86.97), (26.12, 85.39), (26.16, 85.90)],
    "Tamil Nadu": [(13.08, 80.27), (9.93, 78.12), (11.01, 76.97), (11.65, 78.16), (10.79, 78.69)],
    "West Bengal": [(22.57, 88.36), (22.59, 88.26), (23.68, 86.97), (26.71, 88.43), (23.49, 87.32)],
}

def generate():
    session = Session()
    
    # 1. Districts
    district_ids = {}
    for state, info in STATES.items():
        for i, dist_name in enumerate(info["districts"]):
            dist = District(
                name=dist_name, state=state,
                median_daily_wage=random.uniform(200, 500),
                mgnrega_rate=random.uniform(250, 350),
                median_monthly_income=random.uniform(8000, 25000),
                population=random.randint(500000, 5000000),
                lat=PRISON_COORDS[state][i][0] + random.uniform(-0.5, 0.5),
                lng=PRISON_COORDS[state][i][1] + random.uniform(-0.5, 0.5),
            )
            session.add(dist)
            session.flush()
            district_ids[(state, dist_name)] = dist.id
    
    # 2. Prisons (2 per district = 50 total)
    prison_ids = {}
    for state, info in STATES.items():
        for i, dist_name in enumerate(info["districts"]):
            for j in range(2):
                p_type = "Central" if j == 0 else "District"
                prison = Prison(
                    prison_name=f"{dist_name} {p_type} Prison",
                    district_id=district_ids[(state, dist_name)],
                    state=state,
                    capacity=random.randint(500, 3000),
                    current_population=random.randint(600, 4000),
                    lat=PRISON_COORDS[state][i][0] + random.uniform(-0.1, 0.1),
                    lng=PRISON_COORDS[state][i][1] + random.uniform(-0.1, 0.1),
                )
                session.add(prison)
                session.flush()
                prison_ids[(state, dist_name, j)] = prison.id
    
    # 3. Courts (4 per district = 100 total)
    court_ids = {}
    for state, info in STATES.items():
        for dist_name in info["districts"]:
            for ct in COURT_TYPES:
                court = Court(
                    court_name=f"{ct}, {dist_name}",
                    district_id=district_ids[(state, dist_name)],
                    state=state,
                    historical_adjournment_rate=random.uniform(0.3, 0.9),
                    avg_bail_decision_days=random.randint(7, 90),
                    daily_case_load=random.randint(20, 80),
                    bail_grant_rate=random.uniform(0.3, 0.85),
                )
                session.add(court)
                session.flush()
                court_ids[(state, dist_name, ct)] = court.id
    
    # 4. Users (demo accounts)
    demo_users = [
        User(email="paralegal@justicegrid.in", name="Priya Sharma", role="paralegal", language_preference="hi"),
        User(email="lawyer@justicegrid.in", name="Adv. Rajan Mehta", role="lawyer", language_preference="en"),
        User(email="supervisor@justicegrid.in", name="Dr. Anjali Desai", role="supervisor", language_preference="en"),
        User(email="utrc@justicegrid.in", name="Rajesh Kumar", role="utrc", language_preference="hi"),
        User(email="admin@justicegrid.in", name="System Admin", role="admin", language_preference="en"),
    ]
    for u in demo_users:
        session.add(u)
    session.flush()
    paralegal_id = demo_users[0].id
    lawyer_id = demo_users[1].id
    
    # 5. Cases (5000)
    today = date.today()
    all_states = list(STATES.keys())
    
    for i in range(5000):
        state = random.choice(all_states)
        dist_name = random.choice(STATES[state]["districts"])
        
        # Pick 1-3 charges
        num_charges = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
        case_charges = random.sample([c for c in IPC_CHARGES if c["section"] != "34"], num_charges)
        
        # Arrest date: 30 to 1000 days ago
        days_detained = random.randint(30, 1000)
        arrest = today - timedelta(days=days_detained)
        
        is_first = random.random() < 0.65
        has_multiple = random.random() < 0.15
        has_life = any(c["life_or_death"] for c in case_charges)
        
        # Bail
        bail_granted = random.random() < 0.25
        bail_date = arrest + timedelta(days=random.randint(60, days_detained)) if bail_granted else None
        surety = random.choice([5000, 10000, 25000, 50000, 100000, 200000, 500000]) if bail_granted else None
        surety_exec = random.random() < 0.4 if bail_granted else False
        
        case = Case(
            case_number=f"{state[:2].upper()}-{2024 + random.choice([0,1])}-CR-{10000+i}",
            accused_name=fake.name(),
            prison_id=prison_ids[(state, dist_name, random.choice([0,1]))],
            district_id=district_ids[(state, dist_name)],
            court_id=court_ids[(state, dist_name, random.choice(COURT_TYPES))],
            charges=[{"section": c["section"], "act": c["act"], "description": c["description"], 
                      "max_years": c["max_years"], "life_or_death": c["life_or_death"]} for c in case_charges],
            fir_language=STATES[state]["lang"],
            arrest_date=arrest,
            accused_delay_days=random.randint(0, 30),
            is_first_offender=is_first,
            has_multiple_pending_cases=has_multiple,
            eligibility_status="PENDING",
            bail_granted=bail_granted,
            bail_granted_date=bail_date,
            surety_amount=surety,
            surety_executed=surety_exec,
            assigned_paralegal_id=paralegal_id if random.random() < 0.7 else None,
            assigned_lawyer_id=lawyer_id if random.random() < 0.5 else None,
            source_portal=f"ecourts_{state[:2].lower()}",
            status="ACTIVE",
        )
        session.add(case)
        session.flush()
        
        # 6. Hearings for this case (3-15 past hearings)
        num_hearings = random.randint(3, 15)
        hearing_date = arrest + timedelta(days=14)
        for h in range(num_hearings):
            if hearing_date > today:
                break
            outcome = random.choices(
                ["HEARD", "ADJOURNED", "BAIL_GRANTED", "BAIL_DENIED"],
                weights=[0.2, 0.55, 0.1, 0.15]
            )[0]
            next_h = hearing_date + timedelta(days=random.randint(7, 45))
            hearing = Hearing(
                case_id=case.id,
                hearing_date=hearing_date,
                court_id=case.court_id,
                judge_name=random.choice(JUDGE_NAMES),
                outcome=outcome,
                next_hearing_date=next_h if next_h <= today else None,
                charge_sheet_filed=random.random() < 0.6,
            )
            session.add(hearing)
            hearing_date = next_h
        
        # Next upcoming hearing
        if hearing_date > today:
            next_hearing = Hearing(
                case_id=case.id,
                hearing_date=hearing_date,
                court_id=case.court_id,
                judge_name=random.choice(JUDGE_NAMES),
                outcome=None,
                charge_sheet_filed=random.random() < 0.7,
            )
            session.add(next_hearing)
        
        # 7. Family contact (70% of cases)
        if random.random() < 0.7:
            contact = FamilyContact(
                case_id=case.id,
                phone_number=f"+91{random.randint(7000000000, 9999999999)}",
                preferred_language=STATES[state]["lang"],
                preferred_channel=random.choice(["WHATSAPP", "SMS", "IVR"]),
                consent_given=random.random() < 0.8,
                consent_date=datetime.now() if random.random() < 0.8 else None,
            )
            session.add(contact)
        
        if i % 500 == 0:
            session.commit()
            print(f"  Generated {i}/5000 cases...")
    
    session.commit()
    print(f"DONE! Generated 5000 cases, {len(district_ids)} districts, {len(prison_ids)} prisons, {len(court_ids)} courts")
    session.close()

if __name__ == "__main__":
    print("Generating seed data...")
    generate()
```

```bash
cd backend
python -m seed.generate_data
# Should output: DONE! Generated 5000 cases...

git add .
git commit -m "Seed data generator + 5000 cases populated"
git push
```

**→ Message group: "PUSHED — Seed data. Database has 5000 cases. Pull now."**

---

### STEP 5 (Hours 4-6): First Real API Endpoints

Build `backend/app/routers/cases.py` — this is the first API Laptop B needs:

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, text
from ..database import get_db
from ..models.schemas import Case, Hearing, Court, Prison, District
from datetime import date
from typing import Optional

router = APIRouter()

@router.get("/queue")
def get_case_queue(
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Priority-ranked case queue for paralegal."""
    query = db.query(Case).filter(Case.status == "ACTIVE")
    if status:
        query = query.filter(Case.eligibility_status == status)
    if state:
        query = query.join(District).filter(District.state == state)
    
    cases = query.order_by(desc(Case.priority_score)).limit(limit).all()
    
    today = date.today()
    result = []
    for c in cases:
        # Get next hearing
        next_hearing = db.query(Hearing).filter(
            Hearing.case_id == c.id,
            Hearing.hearing_date >= today,
            Hearing.outcome == None
        ).order_by(Hearing.hearing_date).first()
        
        # Compute countdown
        detention_days = (today - c.arrest_date).days - c.accused_delay_days
        charges = c.charges or []
        non_life_charges = [ch for ch in charges if not ch.get("life_or_death", False)]
        
        if non_life_charges:
            max_sentence_days = max(ch.get("max_years", 1) * 365 for ch in non_life_charges)
            threshold = max_sentence_days / 3 if c.is_first_offender else max_sentence_days / 2
            days_remaining = int(threshold - detention_days)
        else:
            days_remaining = None
        
        # Get court and prison names
        court = db.query(Court).filter(Court.id == c.court_id).first()
        prison = db.query(Prison).filter(Prison.id == c.prison_id).first()
        district = db.query(District).filter(District.id == c.district_id).first()
        
        result.append({
            "case_id": str(c.id),
            "case_number": c.case_number,
            "accused_name": c.accused_name,
            "priority_score": c.priority_score or 0,
            "one_line_reason": c.eligibility_reasoning or "Pending assessment",
            "charges": c.charges,
            "next_action": f"Hearing on {next_hearing.hearing_date}" if next_hearing else "No upcoming hearing",
            "confidence": c.eligibility_confidence or 0,
            "bail_success_probability": c.bail_success_probability,
            "eligibility_status": c.eligibility_status,
            "countdown": {
                "days": days_remaining,
                "display": f"Eligible in {days_remaining} days" if days_remaining and days_remaining > 0
                          else f"OVERDUE by {abs(days_remaining)} days" if days_remaining and days_remaining <= 0
                          else "N/A",
                "type": "overdue" if days_remaining and days_remaining <= 0 else "upcoming" if days_remaining else "na"
            },
            "flags": self._compute_flags(c, days_remaining, next_hearing),
            "state": district.state if district else "",
            "court": court.court_name if court else "",
            "prison": prison.prison_name if prison else "",
            "detention_days": detention_days,
            "next_hearing_date": str(next_hearing.hearing_date) if next_hearing else None,
            "arrest_date": str(c.arrest_date),
        })
    
    return {"cases": result, "total": len(result)}

def _compute_flags(self, case, days_remaining, next_hearing):
    flags = []
    if days_remaining is not None and days_remaining <= 0:
        flags.append("OVERDUE")
    if days_remaining is not None and 0 < days_remaining <= 7:
        flags.append("TIME_SENSITIVE")
    if next_hearing and (next_hearing.hearing_date - date.today()).days <= 3:
        flags.append("HEARING_SOON")
    if not case.assigned_lawyer_id:
        flags.append("NO_LAWYER")
    return flags

@router.get("/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    """Full case detail."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}
    
    hearings = db.query(Hearing).filter(Hearing.case_id == case.id).order_by(Hearing.hearing_date).all()
    court = db.query(Court).filter(Court.id == case.court_id).first()
    prison = db.query(Prison).filter(Prison.id == case.prison_id).first()
    district = db.query(District).filter(District.id == case.district_id).first()
    
    return {
        "id": str(case.id),
        "case_number": case.case_number,
        "accused_name": case.accused_name,
        "charges": case.charges,
        "arrest_date": str(case.arrest_date),
        "detention_days": (date.today() - case.arrest_date).days,
        "is_first_offender": case.is_first_offender,
        "has_multiple_pending_cases": case.has_multiple_pending_cases,
        "eligibility_status": case.eligibility_status,
        "eligibility_confidence": case.eligibility_confidence,
        "eligibility_reasoning": case.eligibility_reasoning,
        "priority_score": case.priority_score,
        "bail_granted": case.bail_granted,
        "bail_granted_date": str(case.bail_granted_date) if case.bail_granted_date else None,
        "surety_amount": case.surety_amount,
        "surety_executed": case.surety_executed,
        "bail_success_probability": case.bail_success_probability,
        "court": {"name": court.court_name, "adj_rate": court.historical_adjournment_rate, "bail_rate": court.bail_grant_rate} if court else None,
        "prison": {"name": prison.prison_name, "state": prison.state} if prison else None,
        "district": {"name": district.name, "state": district.state, "median_income": district.median_monthly_income} if district else None,
        "hearings": [{"id": str(h.id), "date": str(h.hearing_date), "outcome": h.outcome, "judge": h.judge_name} for h in hearings],
        "fir_language": case.fir_language,
        "status": case.status,
    }

@router.get("")
def list_cases(
    skip: int = 0, limit: int = 20,
    search: Optional[str] = None,
    eligibility: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List cases with search and filters."""
    query = db.query(Case).filter(Case.status == "ACTIVE")
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
        "cases": [{"id": str(c.id), "case_number": c.case_number, "accused_name": c.accused_name,
                    "eligibility_status": c.eligibility_status, "priority_score": c.priority_score,
                    "arrest_date": str(c.arrest_date)} for c in cases],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.post("/{case_id}/action")
def record_action(case_id: str, action: dict, db: Session = Depends(get_db)):
    """Record paralegal action on a case."""
    # action = {"type": "acted_on|overrode|flagged", "reason": "...", "paralegal_id": "..."}
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}
    
    # Log to audit
    log = AuditLog(
        case_id=case_id,
        assessment_type="paralegal_action",
        data_sources=[{"source": "paralegal_input"}],
        reasoning_chain=action.get("reason", ""),
        confidence=1.0,
        result=action,
        paralegal_id=action.get("paralegal_id"),
        paralegal_response=action.get("type"),
        override_reason=action.get("reason") if action.get("type") == "overrode" else None,
    )
    db.add(log)
    db.commit()
    
    return {"status": "recorded", "action": action.get("type")}
```

```bash
git add .
git commit -m "Cases API: queue, detail, list, actions — Laptop B can start fetching"
git push
```

**→ Message B: "PUSHED — Cases API is live. GET /api/v1/cases/queue works. Switch from mock when ready."**

---

### What to Build Next (Hours 6-44)

Follow the hour-by-hour timeline in TEAM_SPLIT.md. Key priorities:

1. **Hours 6-12**: EligibilityEngine + PriorityScorer → run on all 5000 cases
2. **Hours 12-18**: Surety APIs, Analytics APIs, UTRC API, reasoning-graph API
3. **Hours 18-24**: Audit log, RBAC middleware, graceful degradation, batch recheck
4. **Hours 24-30**: Integrate Laptop C's NLP/ML modules, communication APIs
5. **Hours 30-36**: Integration testing, bug fixes
6. **Hours 36-44**: Help with deployment, final fixes

### API Contracts You MUST Follow

Laptop B builds UI against these shapes. DO NOT change the shape without telling B:

```
GET /api/v1/cases/queue → { cases: [{case_id, case_number, priority_score, one_line_reason, charges, countdown, confidence, flags, ...}] }
GET /api/v1/cases/{id} → { id, case_number, charges, eligibility_status, hearings: [...], court: {...}, ... }
GET /api/v1/cases/{id}/eligibility → { eligible, reasoning_chain, confidence, countdown, charges, threshold_type }
GET /api/v1/cases/{id}/reasoning-graph → { nodes: [{id, label, value, confidence, type}], edges: [{from, to}] }
GET /api/v1/analytics/prison-heatmap → { prisons: [{id, name, lat, lng, eligible_count, total_count, pct}] }
GET /api/v1/surety/gap-report → { cases: [{case_id, surety_amount, income_ratio, days_since_bail, action}] }
POST /api/v1/comms/chat-simulate → { response_text, language, intent, offer_helpline }
```
