# JusticeGrid: AI-Augmented Legal Intelligence
**Hackathon Project Report & Architectural Overview**

## 1. Executive Summary
JusticeGrid is a real-time legal intelligence platform designed to address India's undertrial prisoner crisis. It acts as a force multiplier for Legal Services Authorities (NALSA/DLSAs) and Under-Trial Review Committees (UTRCs) by dynamically computing bail eligibility (under Section 479 of the BNSS) across a vast dataset of prisoners, predicting adjournments, and surfacing cases directly to paralegals and families in simple, multilingual interfaces.

This product has been fully implemented across all three sub-systems:
1. **Backend & AI Architecture** (Laptop A & Laptop C)
2. **Frontend UI & Dashboards** (Laptop B)
3. **Database & API Integration** (All 3 combined)

---

## 2. Technology Stack
Our team utilized a modern, scalable standard stack, designed entirely for **Free-Tier Deployment**:
* **Frontend:** Next.js (React), Tailwind CSS, TypeScript, Recharts (Analytics), Leaflet (Mapping)
* **Backend:** Python + FastAPI, SQLAlchemy, SQLite (Dev) / PostgreSQL (Prod via Neon)
* **AI & NLP Ecosystem:**
  * Gemini 2.0 Flash (for text parsing, FIR extraction, and multilingual natural language)
  * Pre-trained ML via scikit-learn (Gradient Boosting for Adjournments & Priorities)
  * Simulated Federated Learning layer for node-based collaboration
  * gTTS for Voice Interfaces

---

## 3. How We Solved the 10 Pillars of the Problem Statement

### Pillar 1: Multi-Source Legal Data Fusion & Eligibility Intelligence
**How we solved it:** We built a `generate_data.py` seeder handling 5,000 multi-source mock cases. The core `EligibilityEngine` (`backend/app/services/eligibility_engine.py`) takes FIR logic across 10 Indian scripts and calculates S.479 BNSS eligibility. It differentiates maximum sentence limits and flags 1/2 vs 1/3 threshold requirements dynamically.

### Pillar 2: Case Complexity Classification & Legal Aid Prioritization
**How we solved it:** We implemented a `PriorityScorer`. Cases are not simply sorted by "first come, first served." They are assigned a score from 1-100 combining `detention ratio`, `adjournment risks`, and `surety execution gap`. Cases that require deep legal human-review (e.g. Life Sentences) are deprioritized as "Excluded" and red-flagged for human lawyers.

### Pillar 3: Paralegal & Family-Facing Interface
**How we solved it:** The frontend contains a `PriorityQueuePage` (see `/cases` router). It's designed to be clean, loading instantly with "one-line reasoners" per case. To prove this works outside of English, everything integrates with multilingual translators.

### Pillar 4: Systemic Pattern Intelligence
**How we solved it:** A dedicated `/analytics` dashboard. We built endpoints that map Charge Sections against Average Detention Time and Court performances. When the user navigates to `/analytics`, they see exactly which courts have the highest bail delay bottlenecks and which prisons are overcrowded with eligible candidates.

### Pillar 5: Ethical Architecture & Accountability Design 
**How we solved it:** The `AuditLog` router in the backend immutably captures every system interaction. No eligibility check happens silently; it generates an `assessment_hash`. If a paralegal overrides the AI, it demands a logged justification. We implemented "Graceful Degradation"—if the AI cannot read the FIR, it defaults to a human reviewer queue, never hallucinating a bail pass.

### Pillar 6: Multilingual NLP & Language Justice
**How we solved it:** The backend contains a robust NLP suite (`ai/nlp/charge_extractor.py`) heavily augmented by regex and Google Gemini. It parses strings like `धारा 379 आईपीसी` (Hindi text) to correct OCR errors, normalizes them, and predicts the exact English legal terms.

### Pillar 7: Bail Surety & Financial Access Intelligence
**How we solved it:** We built a "Surety Gap" interface measuring the bail assigned vs the district's median daily wage. If a surety is over 90 days of an accused's monthly income base, our `/api/v1/surety/gap-report` flags the case visually with a "Ratio Alert" and prepares an automated S.440/S.483 bail reduction brief.

### Pillar 8: Adjournment Prediction & Court Behaviour Modelling
**How we solved it:** In our `train.py` machine learning script, we trained a `GradientBoostingClassifier` on historical judge patterns, day-of-the-week models, and consecutive adjournment thresholds. It predicts with a % confidence score whether a hearing will be delayed, allowing lawyers to reprioritize their schedules via `/hearings`.

### Pillar 9: Federated Intelligence Across DLSAs
**How we solved it:** We implemented an architecture that does *not* centralize prisoner data. `ai/federated/fl_server.py` simulates a FedAvg strategy. Each DLSA district node computes gradients locally on its dataset and shares only the updated mathematical weights to adjust the primary server. If a DLSA withdraws, their hash is cryptographically removed.

### Pillar 10: Voice-First Access for Zero-Literacy Users
**How we solved it:** Not everyone can read. We included an IVR simulator + WhatsApp communication hook (`routers/comms.py` and `ai/voice/tts_engine.py`). It dynamically processes text down to basic comprehension points, uses Text-To-Speech API (or fallback browser Speech synthesis hooks) and sends audio clips to families in their regional dialect explaining if they should go to the court today or not.

---

## 4. Work Delegation (Verification)
Our team worked in a simulated 3-Laptop environment connected seamlessly to our central GitHub repo:
* **Laptop A:** Orchestrated the FastAPI structure, the master API routing across all 10 pillars, and constructed the 5,000 case SQLite Mocking engine.
* **Laptop B:** Formed the stunning React Next.js User Interface, consuming all analytics, integrating Leaflet for State & District Mapping, and rendering AI predictions visually.
* **Laptop C:** Handled the ML classification modelling, Gemini NLP logic extraction hooks, Federated learning classes, and AI Voice generation scripts. All scripts live within the `/backend/ai/` domain and inject dynamically into Laptop A's routers.
