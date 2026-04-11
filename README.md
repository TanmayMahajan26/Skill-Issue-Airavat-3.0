# JusticeGrid — AI-Augmented Legal Intelligence for India's Undertrial Crisis

**Team Skill Issue | Airavat 3.0 Hackathon**

JusticeGrid is an AI-powered legal intelligence platform designed to address India's undertrial crisis. It leverages Section 479 BNSS eligibility computation, case prioritization, and systemic pattern analysis to empower paralegals, lawyers, and UTRC coordinators.

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py             # Environment configuration
│   ├── database.py           # SQLAlchemy engine & session
│   ├── models/
│   │   ├── schemas.py        # ORM models (10 tables)
│   │   └── responses.py      # Pydantic response models
│   ├── routers/
│   │   ├── cases.py          # Priority queue, case detail, actions
│   │   ├── eligibility.py    # S.479 eligibility + reasoning graph
│   │   ├── hearings.py       # Upcoming hearings, adjournment prediction
│   │   ├── surety.py         # Bail surety gap analysis
│   │   ├── analytics.py      # Systemic pattern intelligence
│   │   ├── utrc.py           # UTRC coordinator dashboard
│   │   ├── audit.py          # Immutable audit trail, DPDPA compliance
│   │   ├── comms.py          # WhatsApp/IVR chat simulator
│   │   ├── nlp.py            # Charge extraction, translation
│   │   └── fl.py             # Federated learning governance
│   └── services/
│       ├── eligibility_engine.py  # Core S.479 BNSS computation
│       └── priority_scorer.py     # Composite priority scoring
├── seed/
│   └── generate_data.py      # 5,000 synthetic case generator
├── test_endpoints.py         # Smoke tests
└── requirements.txt
```

## 🚀 10 Pillars Covered

| # | Pillar | Endpoints |
|---|--------|-----------|
| 1 | Data Fusion & Eligibility | `/api/v1/eligibility/`, `/api/v1/cases/queue` |
| 2 | Case Prioritization | Priority scoring in case queue |
| 3 | Paralegal Interface & UTRC | `/api/v1/utrc/dashboard`, NALSA reports |
| 4 | Systemic Patterns | `/api/v1/analytics/*` |
| 5 | Ethical Architecture | `/api/v1/admin/audit-log`, DPDPA compliance |
| 6 | Multilingual NLP | `/api/v1/nlp/*` |
| 7 | Bail Surety Intelligence | `/api/v1/surety/gap-report`, reduction briefs |
| 8 | Adjournment Prediction | `/api/v1/hearings/upcoming` |
| 9 | Federated Learning | `/api/v1/fl/governance` |
| 10 | Voice-First Access | `/api/v1/comms/chat-simulate` |

## 7 Differentiators

1. **Constitutional Countdown Clock** — real-time S.479 eligibility countdown
2. **Legal Reasoning Graph** — visual explainable AI flowchart
3. **Bail Success Predictor** — probability-based bail outcome prediction
4. **WhatsApp Chat Simulator** — multilingual family communication
5. **Prison Heatmap** — geographic density visualization
6. **Auto-Generated S.440 Briefs** — surety reduction application drafts
7. **Federated Learning Governance** — privacy-preserving cross-DLSA learning

## 🛠️ Setup

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your credentials (or use defaults for SQLite development)
```

### Seed Database (5,000 synthetic cases)

```bash
cd backend
python -m seed.generate_data
```

### Run the API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Test Endpoints

```bash
cd backend
python test_endpoints.py
```

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📊 Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Backend | FastAPI + SQLAlchemy | Free |
| Database | SQLite (dev) / Neon PostgreSQL (prod) | Free tier |
| Cache | Upstash Redis | Free tier |
| Auth | Supabase | Free tier |
| AI | Gemini API | Free tier |
| Hosting | Render | Free tier |

**Total Cost: $0**

## 📝 License

Built for Airavat 3.0 Hackathon by Team Skill Issue.
