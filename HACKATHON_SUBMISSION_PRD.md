# JusticeGrid - Hackathon Technical PRD & Pillar Solution Matrix

## Product Overview
JusticeGrid is a real-time, AI-augmented legal intelligence platform aimed at solving the undertrial prisoner crisis by dynamically computing bail eligibility (specifically Section 479 of the BNSS), predicting adjournments, computing financial surety gaps, and notifying paralegals in real-time.

---

## Technical Stack & Architecture

### 1. Backend (Data Layer & Core Intelligence)
*   **Framework**: FastAPI (Python)
*   **Database**: SQLite (Development) / PostgreSQL (Neon production) built with SQLAlchemy ORM.
*   **Architecture**: Monolithic service with distinct data ingestors for eCourts, Prisons, and DLSAs.

### 2. Frontend (Paralegal Interface)
*   **Framework**: Next.js 14, React 19
*   **Styling**: Tailwind CSS
*   **Visualizations**: Recharts for data models, Leaflet for geospatial heatmaps.

### 3. ML / AI / NLP Module (Intelligence Layer)
*   **NLP Models**: Google Gemini 2.0 API intertwined with Deep Regex expressions to pull Indian Penal Code (IPC/BNSS) from multilingual narrative FIR strings.
*   **Classification Engines**: Scikit-Learn `GradientBoostingClassifier` trained on court historical data to predict the probability of bail adjournments.
*   **TTS Simulation**: Integrating `gTTS` and WhatsApp simulation for dialect-specific automated court reminders to families.
*   **Federated Engine**: Async Federated Learning simulator script relying on NumPy matrix fed-averaging without passing row-level data.

---

## The 10-Pillar Implementation Matrix

### Pillar 1: Multi-Source Legal Data Fusion & Eligibility Intelligence
**Implementation:** `backend/app/services/eligibility_engine.py` dynamically scans over 5,000 seeded database cases. We map old IPC charges to BNSS equivalents under the hood, and factor whether an accused is a First-Offender (1/3rd threshold applied) vs a Regular Accused (1/2 threshold applied). We structurally block the system from granting auto-eligibility on multiple offences. 

### Pillar 2: Case Complexity Classification & Legal Aid Prioritization
**Implementation:** `backend/app/services/priority_scorer.py`. We engineered an algorithmic score out of 100 weighing the Case's elapsed detention days against its threshold. Crucially, the system acts ethically: life imprisonment offences trigger an immediate `LAWYER_REVIEW` tag and are completely removed from the AI's auto-generation pipeline.

### Pillar 3: Paralegal & Family-Facing Interface
**Implementation:** `frontend/app/(dashboard)/cases/page.tsx`. Using Next.js, paralegals are greeted with heavily structured component cards showing exactly *why* a case is prioritized. Priority tags (`CRITICAL`, `HIGH`, `ELIGIBLE`) dictate the visual hierarchy.

### Pillar 4: Systemic Pattern Intelligence
**Implementation:** `frontend/app/(dashboard)/analytics`. Through React's `recharts`, we ingest `/api/v1/analytics/charge-detention` which visually maps the heaviest backlogged courts across the country and the exact sections causing the problem.

### Pillar 5: Ethical Architecture & Accountability Design
**Implementation:** `backend/app/routers/audit.py`. The `AuditLog` table permanently stamps a cryptographically hashed log every single time the Eligibility Engine makes a ruling. A paralegal cannot process an action without an un-deletable trace of the AI's confidence score.

### Pillar 6: Multilingual NLP & Language Justice
**Implementation:** `backend/ai/nlp/charge_extractor.py`. The regex patterns scan in Bengali, Tamil, Telugu, Hindi, etc (`धारा`, `ஐபிசி`) repairing basic OCR errors first, and then passing the string to Gemini 2.0 to translate unstructured blocks into hard JSON dictionaries.

### Pillar 7: Bail Surety & Financial Access Intelligence
**Implementation:** `backend/app/routers/surety.py` & `backend/app/services/priority_scorer.py`. If the set bail surety represents over `10x` the median daily wage of that specific district block, an automated alert triggers to push a S.440 brief to lower the amount.

### Pillar 8: Adjournment Prediction & Court Behaviour
**Implementation:** `backend/ai/ml/train.py`. The Gradient Boosting Model scans the `history of adjournments` for specific judges combined with `days to court vacation`. It gives the lawyer a % probability that the case will get bounced, allowing the lawyer to drop the prep and focus on actual hearings.

### Pillar 9: Federated Intelligence Across DLSAs
**Implementation:** `backend/ai/federated/fl_server.py`. To ensure absolute privacy, the system distributes models (not data). DLSAs send isolated weight updates (`numpy` arrays). The global server averages these arrays to improve predictions across the board without viewing personally identifiable metrics.

### Pillar 10: Voice-First Access
**Implementation:** `backend/app/routers/comms.py` and `backend/ai/voice/tts_engine.py`. By pinging the TTS library, family case updates are sent as compressed audio playbacks imitating IVR architecture. Legal jargon is actively scrubbed out using basic translation swaps prior to audio generation.
