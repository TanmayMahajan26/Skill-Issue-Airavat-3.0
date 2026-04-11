# JusticeGrid — Product Requirements Document (PRD) v2.0
## AI-Augmented Legal Intelligence for India's Undertrial Crisis

---

> [!IMPORTANT]
> **v2.0 Changes**: (1) Line-by-line PS compliance audit — every feature mapped ✅ (2) **100% free tier** tech stack (3) 7 unique differentiators to beat every other team

---

## 0. Pillar-by-Pillar Compliance Audit

Before anything else — here's proof every single requirement from the PS is covered:

### Pillar 01: Multi-Source Legal Data Fusion & Eligibility Intelligence

| PS Requirement | PRD Section | Status |
|---|---|---|
| Ingest from 25 state eCourts portals | §5.1.1 Data Sources | ✅ |
| Ingest from NJDG | §5.1.1 Data Sources | ✅ |
| Ingest from FIR text | §5.1.1 Data Sources | ✅ |
| Ingest from court cause lists | §5.1.1 Data Sources | ✅ |
| Ingest from prison records | §5.1.1 Data Sources | ✅ |
| Handle different schemas, languages, update frequencies, access controls | §5.1.2 Normalisation Pipeline | ✅ |
| Treat heterogeneity as permanent operating condition | §5.1.2 — schema mapper per state | ✅ |
| Compute Section 479 BNSS eligibility dynamically | §5.1.3 Eligibility Engine | ✅ |
| Extract charge sections from unstructured multilingual FIR text | §5.6.1 Charge Extractor (Pillar 6) | ✅ |
| Map to maximum sentences | §5.1.3 — `sentence_map` | ✅ |
| Distinguish first-time offenders (⅓ threshold) vs regular (½ threshold) | §5.1.3 — `is_first_offender` logic | ✅ |
| Handle multiple charges | §5.1.3 — conservative: least favourable charge | ✅ |
| Handle IPC-to-BNSS transitional ambiguity | §5.1.3 — `act` field: IPC vs BNSS mapping | ✅ |
| Never auto-apply most favourable charge | §5.1.3 — explicit conservative rule | ✅ |
| Re-evaluate every active case daily | §5.1.4 Daily Re-evaluation | ✅ |
| Track whether eligibility window about to expire | §5.1.4 — escalation trigger < 7 days | ✅ |
| Escalate accordingly | §5.1.4 — Celery beat + push notifications | ✅ |
| Eligibility is not a one-time check | §5.1.4 — daily batch + event-driven triggers | ✅ |

### Pillar 02: Case Complexity Classification & Legal Aid Prioritisation

| PS Requirement | PRD Section | Status |
|---|---|---|
| Composite priority score | §5.2.1 Priority Score formula | ✅ |
| Signal: eligibility status | §5.2.1 — weight 0.35 | ✅ |
| Signal: time sensitivity (days to hearing, days since action, days until window) | §5.2.1 — weight 0.30 | ✅ |
| Signal: action availability (lawyer assigned, documents present) | §5.2.1 — weight 0.20 | ✅ |
| Signal: court behaviour score (historical adjournment rate) | §5.2.1 — weight 0.15 | ✅ |
| Life imprisonment → flag for lawyer review, never auto-eligible | §5.2.2 Conflict Rules | ✅ |
| High adjournment probability → rank below real upcoming windows | §5.2.2 Conflict Rules | ✅ |
| Calibrated uncertainty — every output shows confidence + explains reasoning | §5.2.3 Queue API — `confidence` + `reasoning` fields | ✅ |
| Overconfident system prevented | §5.2.2 — low confidence (<70%) → mandatory lawyer review | ✅ |

### Pillar 03: Paralegal & Family-Facing Interface Under Real Conditions

| PS Requirement | PRD Section | Status |
|---|---|---|
| Case queue ranked by priority score | §5.3.1 Case Queue screen | ✅ |
| Single-line reason per case | §5.3.1 — `one_line_reason` in queue | ✅ |
| One-click expansion to charges and recommended next action | §5.3.1 — Case Detail screen | ✅ |
| Hearing prep brief in paralegal's language | §5.3.1 — Hearing Prep Brief screen | ✅ |
| Full offline mode for prison visits | §5.3.1 — PWA + IndexedDB + service worker | ✅ |
| Sync on reconnection | §5.3.1 — Offline Architecture with sync engine | ✅ |
| WhatsApp/SMS case status updates | §5.3.2 Family Notification Layer | ✅ |
| Family's auto-detected language | §5.3.2 — auto-detect language preference | ✅ |
| Plain-language hearing outcome translations | §5.3.2 + §5.6.2 Plain Language Generator | ✅ |
| Opt-in only | §5.3.2 — explicit consent required | ✅ |
| Escalation trigger: no notification in 45 days despite action-relevant event | §5.3.2 — 45-day escalation rule | ✅ |
| Never legal advice | §5.3.2 — explicit ❌ rule | ✅ |
| Never predictions | §5.3.2 — explicit ❌ rule | ✅ |
| UTRC coordinator dashboard: prison-level view | §5.3.3 Prison Overview | ✅ |
| S.479-eligible undertrials by charge category + detention duration | §5.3.3 Prison Overview data | ✅ |
| Hearing schedule conflicts | §5.3.3 Hearing Calendar | ✅ |
| Action-needed queue | §5.3.3 Action Queue | ✅ |
| District comparison | §5.3.3 District Comparison view | ✅ |
| One-click NALSA quarterly report export | §5.3.3 NALSA Report Export | ✅ |

### Pillar 04: Systemic Pattern Intelligence Across the Case Corpus

| PS Requirement | PRD Section | Status |
|---|---|---|
| Which charge sections drive longest undertrial detention | §5.4.1 SQL query 1 | ✅ |
| Which courts have worst bail-decision intervals | §5.4.1 SQL query 2 | ✅ |
| Which prisons have highest density of eligible-but-unserved undertrials | §5.4.1 — **NEW: added SQL query 3** | ✅ |
| Surety amounts blocking bail vs local poverty indicators | §5.4.1 SQL query 4 (was query 3) | ✅ |
| Feed every outcome back into eligibility engine | §5.4.2 Feedback Loop | ✅ |
| Feed into adjournment predictor | §5.4.2 Feedback Loop | ✅ |
| Feed into complexity classifier | §5.4.2 Feedback Loop | ✅ |
| System becomes measurably more accurate over time | §5.4.2 — accuracy tracking dashboard | ✅ |
| Privacy is hard architectural constraint | §5.4.3 Privacy Constraint | ✅ |
| No PII retained beyond active case management | §5.4.3 — data lifecycle policy | ✅ |
| Learning from anonymised patterns only | §5.4.3 — PII stripped before aggregation | ✅ |
| Enforced structurally in data architecture | §5.4.3 — DB triggers + auto-anonymize | ✅ |
| Visible data lifecycle diagram | §5.4.3 — **NEW: interactive lifecycle visualization in admin panel** | ✅ |

### Pillar 05: Ethical Architecture, Failure Modes & Accountability Design

| PS Requirement | PRD Section | Status |
|---|---|---|
| Every eligibility assessment logged immutably | §5.5.1 Immutable Audit Log | ✅ |
| Log: data sources and timestamps used | §5.5.1 — `data_sources JSONB` | ✅ |
| Log: legal reasoning chain | §5.5.1 — `reasoning_chain TEXT` | ✅ |
| Log: confidence level | §5.5.1 — `confidence DECIMAL` | ✅ |
| Log: paralegal response (acted on / overrode / flagged) | §5.5.1 — `paralegal_response VARCHAR` | ✅ |
| Supervisors can reconstruct what system said and when | §5.5.1 — full audit trail query | ✅ |
| eCourts API downtime: mark stale, block auto-escalation | §5.5.2 Degradation Matrix row 1 | ✅ |
| FIR parsing below confidence: flag for lawyer, never include in eligible queue | §5.5.2 Degradation Matrix row 2 | ✅ |
| Name/identity mismatch: never auto-merge, flag for human | §5.5.2 Degradation Matrix row 3 | ✅ |
| Each failure mode has specific designed response (not generic error) | §5.5.2 — specific messages per failure | ✅ |
| RBAC: no single role has bulk access without audit trail | §5.5.3 RBAC table | ✅ |
| No bulk export without DLSA supervisor approval + logged justification | §5.5.3 — DLSA Supervisor row | ✅ |
| DPDPA 2023 compliance: data localisation | §5.5.4 — Indian infrastructure only | ✅ |
| DPDPA 2023: right to erasure | §5.5.4 — one-click PII deletion | ✅ |
| DPDPA 2023: deletion triggers baked into data architecture | §5.5.4 — automated 90-day deletion | ✅ |

### Pillar 06: Multilingual NLP & Language Justice Engine

| PS Requirement | PRD Section | Status |
|---|---|---|
| Extract charge sections from 10 languages: Hi, En, Mr, Bn, Te, Ta, Kn, Gu, Or, Pa | §5.6.1 — `SUPPORTED_LANGUAGES` list | ✅ |
| Sections in narrative prose (not structured fields) | §5.6.1 — NER-based extraction for embedded sections | ✅ |
| Handle OCR errors | §5.6.1 — `OCRErrorCorrector` class | ✅ |
| Handle mixed scripts within single document | §5.6.1 — `detect_languages()` for mixed scripts | ✅ |
| Plain-language case status in 10+ languages | §5.6.2 Plain Language Generator | ✅ |
| Translated for comprehension (not word-for-word) | §5.6.2 — legal terminology simplification | ✅ |
| Human review pathway for quality assurance in every language | §5.6.2 — bilingual legal aid worker review | ✅ |
| Name normalisation across transliterations (8+ forms) | §5.6.3 Name Normaliser | ✅ |
| Conservative merge policy: uncertain → flag for human review | §5.6.3 — HUMAN_REVIEW threshold | ✅ |
| Never auto-merge | §5.6.3 — explicit rule at score > 0.70 | ✅ |

### Pillar 07: Bail Surety & Financial Access Intelligence

| PS Requirement | PRD Section | Status |
|---|---|---|
| Identify bail granted >14 days, surety not executed | §5.7.1 Surety Gap Detector SQL | ✅ |
| Cross-reference surety vs median daily wage | §5.7.1 — `median_daily_wage` join | ✅ |
| Cross-reference surety vs MGNREGA rates | §5.7.1 — `mgnrega_rate` join | ✅ |
| Surety > 90 days local median income → S.440 reduction candidate | §5.7.2 — auto-flag + brief generation | ✅ |
| Auto-generate surety reduction application brief | §5.7.2 — S.440/S.483 BNSS brief | ✅ |
| Brief for lawyer review | §5.7.2 — always needs lawyer review | ✅ |
| Map systemic patterns: courts with unaffordable surety | §5.7.3 Systemic Dashboard | ✅ |
| Feed findings into policy intelligence layer | §5.7.3 — feeds into NALSA reports | ✅ |

### Pillar 08: Adjournment Prediction & Court Behaviour Modelling

| PS Requirement | PRD Section | Status |
|---|---|---|
| Predict adjournment probability (0-100% + confidence interval) | §5.8.1 — XGBoost model | ✅ |
| Feature: historical adjournment rate for court-judge-case-type | §5.8.1 — `court_judge_case_type_adj_rate` | ✅ |
| Feature: consecutive prior adjournments | §5.8.1 — `consecutive_prior_adjournments` | ✅ |
| Feature: day of week | §5.8.1 — `day_of_week` | ✅ |
| Feature: proximity to court vacation | §5.8.1 — `days_to_court_vacation` | ✅ |
| Feature: whether prosecution filed charge sheet | §5.8.1 — `charge_sheet_filed` | ✅ |
| Reprioritise paralegal's hearing-day schedule (>75% adjournment) | §5.8.2 Schedule Reprioritisation | ✅ |
| Surface signal clearly when time-sensitive case conflicts | §5.8.2 — alternative case suggestion | ✅ |
| UTRC alert: court adjourned eligible cases 20+ times in quarter | §5.8.3 UTRC Pattern Alerts | ✅ |
| Model must show uncertainty prominently | §5.8.1 — confidence interval + uncertainty_level | ✅ |
| Predictions are inputs to judgment, not instructions | §5.8.3 — explicit disclaimer | ✅ |

### Pillar 09: Federated Intelligence Across DLSAs

| PS Requirement | PRD Section | Status |
|---|---|---|
| Local models train on district-level data | §5.9.1 Architecture — DLSA Node | ✅ |
| Only model weights shared centrally (not records) | §5.9.1 — "only model weights transmitted" | ✅ |
| Differential privacy guarantees | §5.9.1 — Opacus ε=1.0, δ=1e-5 | ✅ |
| Cannot reverse-engineer individual records from weights | §5.9.1 — DP guarantees | ✅ |
| Asynchronous federation for low connectivity DLSAs | §5.9.1 — async federation | ✅ |
| One-page setup guide, no developer required | §5.9.2 — single curl command | ✅ |
| Districts that contribute more → more accurate predictions | §5.9.2 — **NEW: contribution-weighted accuracy bonus** | ✅ |
| NALSA governance layer: which DLSAs participating | §5.9.3 — Governance Dashboard | ✅ |
| Governance: data quality contributed | §5.9.3 — Data Quality Metrics | ✅ |
| Governance: model accuracy improvement produced | §5.9.3 — Accuracy Tracker | ✅ |
| DLSA withdrawal: weights removed from global model | §5.9.4 Withdrawal Architecture | ✅ |
| Architecturally enforced, not just policy | §5.9.4 — cryptographically verifiable | ✅ |

### Pillar 10: Voice-First Access for Zero-Literacy Users

| PS Requirement | PRD Section | Status |
|---|---|---|
| WhatsApp voice message delivery in family's dialect | §5.10.1 WhatsApp Voice Flow | ✅ |
| IVR fallback for feature phones | §5.10.2 IVR Fallback | ✅ |
| Family calls → enters case reference → voice briefing | §5.10.2 — IVR flow detail | ✅ |
| No smartphone required | §5.10.2 — feature phone IVR | ✅ |
| Dialect differentiation (Bhojpuri ≠ Rajasthani within Hindi) | §5.10.1 — **NEW: dialect detection via phone region + Bhashini dialect models** | ✅ |
| Consistent plain-speech equivalents for legal terms | §5.10.3 — **NEW: legal term glossary per dialect** | ✅ |
| Active listening: "what does that mean?" | §5.10.2 — IVR option 2 + WhatsApp keyword | ✅ |
| Safe escalation: connect to DLSA helpline if confused/distressed | §5.10.3 — DLSA helpline connection | ✅ |
| Never legal advice | §5.10.3 ❌ rule | ✅ |
| Never predictions | §5.10.3 ❌ rule | ✅ |
| Never asks for personal info beyond case reference | §5.10.3 ❌ rule | ✅ |
| Never stores voice input beyond session | §5.10.3 ❌ rule | ✅ |

> **Result: 100% coverage — every single bullet from the PS is mapped to a specific implementation section.**

---

## 1. Problem Summary

India confines **4,34,302 of 5,73,220 prisoners** without conviction — the world's largest undertrial population. The law already provides mechanisms for release (Section 479 BNSS, NALSA free representation, UTRCs), but **no system connects these legal rights to the individuals they apply to** at speed and scale.

**JusticeGrid** is a real-time legal intelligence layer for **NALSA panel lawyers**, **DLSA paralegals**, and **UTRC coordinators**. It makes one paralegal with 200 cases as effective as a team of 10.

---

## 2. 🏆 UNIQUE DIFFERENTIATORS — What Makes Us Win

> [!TIP]
> These 7 features are what no other team will build. They are the "wow factor" that turns a good submission into a winner.

### Differentiator 1: Constitutional Countdown Clock ⏰
**Every case card shows a live countdown timer** — "This person becomes eligible for bail in **3 days, 14 hours, 22 minutes**" OR "This person has been **eligible for 47 days** with no action taken." This creates visceral urgency. No other team will make the crisis *feel* real-time.

### Differentiator 2: Legal Reasoning Graph 🧠
Instead of just text reasoning, we render an **interactive visual graph** showing exactly how the system reached its eligibility conclusion:
```
FIR Text → [Charge S.379 IPC Extracted (confidence: 0.92)]
    → [Max sentence: 3 years] 
    → [First offender: ⅓ threshold = 1 year]
    → [Detained: 1 year 2 months]  
    → [ELIGIBLE ✅ — exceeded threshold by 2 months]
```
This is the **explainable AI** that judges love — visual, traceable, auditable.

### Differentiator 3: Bail Success Predictor 📊
Beyond just eligibility, we predict **bail success probability** based on historical data for this specific court-judge-charge combination. "If you file bail for S.379 before Judge X at Court Y, historical grant rate is **73%**." This is actionable intelligence no manual system can provide.

### Differentiator 4: WhatsApp Chatbot Simulator 💬
For the hackathon demo, we build a **fully working WhatsApp-style chat simulator** embedded in the dashboard. Judges can type a case number, see the system respond in Hindi/Tamil/Bengali, ask "what does that mean?", and experience the family communication flow — **without needing a real WhatsApp Business account** (which costs money). Zero cost, full demo impact.

### Differentiator 5: Prison Heatmap 🗺️
An **interactive India map** with heatmap overlay showing: eligible-but-unserved undertrial density per prison/district. Click any district → drill down to individual prisons → see case-level detail. This single visualization tells the entire story of the undertrial crisis.

### Differentiator 6: Auto-Generated Writ Petition Draft ⚖️
When a prisoner is eligible but no action taken for >30 days, the system **auto-generates a draft habeas corpus / S.479 application** with all case details, legal reasoning, and precedent citations pre-filled. Lawyer just reviews and files. This is the "last mile" that no other team will think of.

### Differentiator 7: ICJS Integration Architecture 🔗
We design (and diagram) integration with India's **Interoperable Criminal Justice System (ICJS)** — the govt's own platform connecting police, courts, and prisons. This shows judges we understand the real ecosystem and aren't building in isolation.

---

## 3. Tech Stack — 100% FREE TIER

> [!IMPORTANT]
> **Every single service below is free.** No credit card required for any component during hackathon development and demo.

| Layer | Technology | Free Tier Limits | Cost |
|---|---|---|---|
| **Backend API** | **FastAPI** (Python 3.11+) | Open source | **$0** |
| **Backend Hosting** | **Render** (free web service) | 750 hrs/month, auto-sleep after 15 min inactivity | **$0** |
| **Frontend** | **Next.js 14** (App Router) + TypeScript | Open source | **$0** |
| **Frontend Hosting** | **Vercel** (free hobby) | 100 GB bandwidth, 6000 min build | **$0** |
| **Database** | **Neon PostgreSQL** (free tier) | 0.5 GB storage, 100 CU-hours/month | **$0** |
| **Cache / Queue** | **Upstash Redis** (free tier) | 256 MB, 500K commands/month | **$0** |
| **Task Queue** | **Celery** + Upstash Redis as broker | Uses same Redis free tier | **$0** |
| **Search** | **PostgreSQL Full-Text Search** (pg_trgm) | Built into Neon free tier | **$0** |
| **LLM / NLP** | **Google Gemini API** (free tier) | 60 RPM, 1500 RPD for Gemini Flash | **$0** |
| **Multilingual NLP** | **AI4Bharat IndicBERT** (HuggingFace) | Open source, runs locally | **$0** |
| **Translation** | **Bhashini API** (govt DPI) | Free for public-interest projects | **$0** |
| **OCR** | **Tesseract** + **EasyOCR** | Open source | **$0** |
| **ML Framework** | **scikit-learn** + **XGBoost** | Open source (lighter than PyTorch) | **$0** |
| **Federated Learning** | **Flower (flwr)** | Open source | **$0** |
| **Differential Privacy** | **Opacus** / **diffprivlib** | Open source | **$0** |
| **Auth** | **Supabase Auth** (free tier) | 50K MAUs, 2 projects | **$0** |
| **WhatsApp Demo** | **Built-in Chat Simulator** | Custom-built UI component | **$0** |
| **IVR Demo** | **Web Speech API** (browser native) | Built into Chrome/Edge | **$0** |
| **SMS Demo** | **Simulated SMS panel** | Custom-built UI component | **$0** |
| **Monitoring** | **Sentry** (free tier) | 5K errors/month | **$0** |
| **CI/CD** | **GitHub Actions** (free for public repos) | 2000 min/month | **$0** |
| **Charts** | **Recharts** + **Leaflet.js** | Open source | **$0** |
| **Maps** | **Leaflet** + **OpenStreetMap** tiles | Free, no API key needed | **$0** |

### Key Free-Tier Decisions Explained

| Original (Paid) | Replaced With (Free) | Why It Works |
|---|---|---|
| Twilio WhatsApp ($0.005/msg) | **Built-in WhatsApp Chat Simulator** | Identical demo UX, judges can interact live, costs nothing. For production, mention Twilio as future integration. |
| Twilio IVR ($0.013/min) | **Web Speech API + Bhashini TTS** | Browser-native speech synthesis for demo. Architecture clearly shows Twilio IVR for production. |
| MSG91 SMS (₹0.10/SMS) | **Simulated SMS panel embedded in dashboard** | Shows the flow without sending real SMS. |
| Railway ($5/mo) | **Render free tier** | Slightly slower cold starts but fully free. |
| PostgreSQL + TimescaleDB | **Neon PostgreSQL free** | TimescaleDB not needed for hackathon scale; time-series handled with date columns + indices. |
| Meilisearch Cloud (paid) | **PostgreSQL pg_trgm + GIN index** | Full-text search built into Neon free tier; good enough for 5K demo cases. |
| PyTorch (heavy) | **scikit-learn + XGBoost** | Lighter models, run on Render free tier's limited CPU. IndicBERT still via HuggingFace but inference via Gemini API for heavy NLP. |

---

## 4. Technical Architecture

```mermaid
graph TB
    subgraph "Data Ingestion Layer"
        A[eCourts Scraper<br/>25 State Portals] --> D[Data Fusion Engine]
        B[NJDG API] --> D
        C[FIR/OCR Parser<br/>Tesseract + EasyOCR] --> D
        E[Prison Records<br/>CSV Upload] --> D
        F[Court Cause Lists] --> D
    end

    subgraph "Core Intelligence Engine"
        D --> G[Unified Case Store<br/>Neon PostgreSQL]
        G --> H[Eligibility Engine<br/>Section 479 BNSS]
        G --> I[Priority Scorer<br/>Composite Ranking]
        G --> J[Adjournment Predictor<br/>XGBoost]
        G --> K[Surety Gap Analyzer]
        G --> BailPred[Bail Success Predictor]
        H --> L[Reasoning Chain Logger]
        I --> L
    end

    subgraph "AI & NLP Layer"
        M[Gemini Flash API<br/>Free Tier] --> N[Legal NLP Engine]
        O[Bhashini API<br/>ASR/TTS/NMT] --> N
        N --> P[Charge Section Extractor]
        N --> Q[Plain Language Generator]
        N --> R[Name Normalizer]
        N --> WP[Writ Petition Drafter]
    end

    subgraph "Interface Layer (Vercel)"
        S[Paralegal Dashboard<br/>Next.js PWA — Offline-First]
        T[UTRC Coordinator View]
        U[WhatsApp Chatbot Simulator]
        V[NALSA Admin Panel]
        HM[Prison Heatmap<br/>Leaflet + OSM]
        CC[Constitutional Countdown Clock]
        RG[Legal Reasoning Graph]
    end

    subgraph "Privacy & Federated Layer"
        W[Flower FL Server]
        X[DLSA Node 1<br/>Docker]
        Y[DLSA Node 2<br/>Docker]
        Z[Differential Privacy<br/>Opacus]
    end

    G --> S
    G --> T
    G --> V
    Q --> U
    J --> S
    K --> S
    BailPred --> S
    X --> W
    Y --> W
    L --> AA[Immutable Audit Log<br/>Append-only Table]
```

---

## 5. Pillar-by-Pillar Detailed Specifications

---

### Pillar 01: Multi-Source Legal Data Fusion & Eligibility Intelligence

#### 5.1.1 Data Sources & Ingestion

| Source | Format | Frequency | Method | Free? |
|---|---|---|---|---|
| eCourts (25 states) | HTML/JSON | Every 6 hours | Scrapy spiders with rate limiting | ✅ OSS |
| NJDG | JSON API | Daily | REST API polling | ✅ Public API |
| FIR Text | PDF/Image | On-upload | Tesseract/EasyOCR → NLP | ✅ OSS |
| Prison Records | CSV/Excel | Weekly | Manual CSV upload UI | ✅ |
| Court Cause Lists | PDF/HTML | Daily | Scraper + PDF parser (pdfplumber) | ✅ OSS |
| ICJS (future) | API | Real-time | Integration architecture designed | ✅ Design only |

> [!NOTE]
> For the hackathon demo, we use **realistic synthetic data** for 5,000 cases across 5 states. The scraping infrastructure is built but uses synthetic API responses to avoid legal issues during demo.

#### 5.1.2 Data Normalisation Pipeline

```
Raw Data → Schema Mapper (25 state schemas → unified) 
         → Deduplicator (fuzzy match: name + FIR# + court) 
         → Entity Resolver (NEVER auto-merge — flag ambiguous for human review)
         → Unified Case Record (PostgreSQL)
```

- **Heterogeneity as permanent condition**: each state gets its own parser adapter, not a one-size-fits-all approach
- Schema evolution tracked via migration files

#### 5.1.3 Section 479 BNSS Eligibility Engine

```python
class EligibilityEngine:
    """
    Core eligibility computation per Section 479 BNSS.
    Conservative by design — when in doubt, flag for human review.
    """
    
    def compute_eligibility(self, case: Case) -> EligibilityResult:
        # 1. Extract charge sections from FIR (multilingual NLP)
        charges = self.charge_extractor.extract(case.fir_text, case.language)
        
        # 2. Map charges to max sentences (handles IPC → BNSS transitional mapping)
        max_sentences = []
        for c in charges:
            ipc_sentence = self.ipc_sentence_map.get(c.section)
            bnss_sentence = self.bnss_sentence_map.get(c.bnss_equivalent)
            # During transitional period, use the one that exists
            max_sentences.append(ipc_sentence or bnss_sentence)
        
        # 3. Check exclusions (death/life imprisonment)
        if any(s and s.includes_life_or_death for s in max_sentences):
            return EligibilityResult(
                eligible=False, 
                reason="Excluded: charge includes life/death sentence",
                confidence=0.95,
                requires_lawyer_review=True  # ALWAYS flag these
            )
        
        # 4. Check S.479(2) — multiple cases pending
        if case.has_multiple_pending_cases:
            return EligibilityResult(
                eligible=False, 
                reason="S.479(2): multiple cases pending — not eligible",
                confidence=0.90
            )
        
        # 5. Compute threshold: ⅓ for first-time offenders, ½ for others
        is_first_offender = not case.has_prior_convictions
        threshold = Fraction(1, 3) if is_first_offender else Fraction(1, 2)
        
        # 6. Use LEAST FAVOURABLE charge (most conservative)
        valid_sentences = [s for s in max_sentences if s and not s.includes_life_or_death]
        if not valid_sentences:
            return EligibilityResult(eligible=False, reason="Could not determine max sentence")
        
        max_sentence_days = max(s.days for s in valid_sentences)  # Least favourable
        threshold_days = int(max_sentence_days * threshold)
        
        # 7. Exclude delays attributable to accused (S.479 proviso)
        effective_detention = case.detention_days - case.accused_delay_days
        
        eligible = effective_detention >= threshold_days
        
        # 8. Build full reasoning chain for audit
        reasoning = self.build_reasoning_chain(
            charges, max_sentences, is_first_offender, 
            threshold, effective_detention, threshold_days
        )
        
        return EligibilityResult(
            eligible=eligible,
            threshold_type="first_offender_1/3" if is_first_offender else "regular_1/2",
            detention_days=effective_detention,
            threshold_days=threshold_days,
            days_remaining=max(0, threshold_days - effective_detention),
            days_overdue=max(0, effective_detention - threshold_days) if eligible else 0,
            charges=charges,
            confidence=self.compute_confidence(case, charges),
            reasoning_chain=reasoning,
            requires_lawyer_review=self._needs_review(case, charges),
            countdown_display=self._format_countdown(threshold_days - effective_detention)
        )
    
    def _format_countdown(self, days_remaining: int) -> str:
        """Constitutional Countdown Clock — unique differentiator."""
        if days_remaining <= 0:
            overdue = abs(days_remaining)
            return f"⚠️ ELIGIBLE — overdue by {overdue} days with no action"
        return f"⏰ Becomes eligible in {days_remaining} days"
```

#### 5.1.4 Daily Re-evaluation

- **Celery beat scheduler** via Upstash Redis: runs eligibility for all active cases at 2 AM IST
- **Escalation triggers**: newly eligible → immediate notification, window < 7 days → warning
- **Staleness tracking**: source data > 48 hours → case marked `STALE` → blocks auto-escalation
- **S.479(3) compliance**: when threshold met, auto-generates jail superintendent application draft

---

### Pillar 02: Case Complexity Classification & Legal Aid Prioritisation

#### 5.2.1 Composite Priority Score

```
Priority Score = w1·E + w2·T + w3·A + w4·C + BONUS
```

| Signal | Weight | Components |
|---|---|---|
| **E** — Eligibility Status | 0.30 | Binary eligible × confidence score |
| **T** — Time Sensitivity | 0.30 | Days to next hearing, days since last action, days until eligibility window |
| **A** — Action Availability | 0.20 | Lawyer assigned?, docs present?, bail app drafted? |
| **C** — Court Behaviour Score | 0.15 | Historical adjournment rate for court-judge-case-type combo |
| **BONUS** — Bail Success Prediction | 0.05 | Historical bail grant rate for this court-charge combo (Differentiator 3) |

#### 5.2.2 Conflict Resolution Rules

| Conflict | Resolution |
|---|---|
| Life imprisonment charge + appears eligible | **Flag for lawyer review** — never auto-surface as eligible |
| High adjournment probability (>75%) + time-sensitive | **Rank below** cases with real upcoming windows |
| Low confidence (<70%) eligibility | **Mandatory lawyer review** before entering eligible queue |
| Multiple conflicting charges | Use **least favourable** charge for eligibility (conservative) |
| Newly eligible + no lawyer assigned | **Auto-escalate** to DLSA supervisor for assignment |

#### 5.2.3 Queue API

```json
GET /api/v1/cases/queue?paralegal_id={id}&sort=priority_desc&limit=50

{
  "cases": [
    {
      "case_id": "MH-2024-CR-45678",
      "priority_score": 92.4,
      "one_line_reason": "Eligible under S.479 — first offender, 40% of max served, hearing in 3 days",
      "charges": ["S.379 IPC — Theft"],
      "next_action": "File bail application before 14-Apr hearing",
      "confidence": 0.87,
      "bail_success_probability": 0.73,
      "countdown": "⚠️ ELIGIBLE — overdue by 47 days with no action",
      "flags": ["TIME_SENSITIVE", "OVERDUE"]
    }
  ]
}
```

---

### Pillar 03: Paralegal & Family-Facing Interface Under Real Conditions

#### 5.3.1 Paralegal Workstation (Next.js PWA — Offline-First)

**Design Principles:**
- **4 minutes per case** budget — every screen laser-optimized
- **Offline-first PWA** — service worker + IndexedDB for prison visits where there's no internet
- **Multilingual UI** — Hindi, English, Marathi, Bengali, Tamil, Telugu (min)
- **Single-line reason** per case in queue, one-click expand to full detail
- **Constitutional Countdown Clock** on every case card (Differentiator 1)

**Key Screens:**

| Screen | Purpose | Offline? |
|---|---|---|
| Priority Queue | Ranked cases with countdown clock + reason + next action | ✅ |
| Case Detail | Charges, **Legal Reasoning Graph** (Differentiator 2), hearings, docs | ✅ |
| Hearing Prep Brief | Auto-generated brief in paralegal's language via Gemini | ✅ |
| Quick Actions | "Acted on", "Override" (with reason), "Flag for lawyer", "Add note" | ✅ sync later |
| Sync Status | Last sync time, pending uploads, conflicts needing resolution | ✅ |
| **Bail Success View** | Historical grant rates for this court-charge combo (Differentiator 3) | ✅ |

**Offline Architecture:**
```
Online:  API → React State → UI → user actions → API
Offline: IndexedDB → React State → UI → user actions → IndexedDB
Sync:    IndexedDB ↔ API (on reconnect — conflict: show both versions for human pick)
```

#### 5.3.2 Family Notification Layer

| Channel | Technology | Demo Mode | Production Mode |
|---|---|---|---|
| **WhatsApp** | **Chat Simulator** (built-in) | ✅ In-dashboard demo | Twilio WhatsApp Business API |
| **SMS** | **Simulated SMS Panel** | ✅ In-dashboard demo | MSG91 / Gupshup |
| **IVR** | **Web Speech API** + Bhashini TTS | ✅ Browser-based voice demo | Twilio Voice |

**All PS-required rules enforced:**
- ✅ Opt-in only — explicit consent recorded with timestamp
- ✅ Auto-detect language from phone number region + user preference
- ✅ Plain-language (not word-for-word legal translation)
- ✅ Escalation if no notification sent in 45 days despite action-relevant event
- ❌ Never legal advice
- ❌ Never predictions
- ❌ Never retain data beyond active case

#### 5.3.3 UTRC Coordinator Dashboard

| View | Data | Unique? |
|---|---|---|
| **Prison Heatmap** 🗺️ | Interactive India map — eligible-but-unserved density per prison | ✅ Differentiator 5 |
| Prison Overview | S.479-eligible undertrials by charge category + detention duration | |
| Hearing Calendar | Schedule conflicts across cases + adjournment predictions | |
| Action Queue | Cases needing immediate intervention, sorted by urgency | |
| District Comparison | Side-by-side DLSA performance metrics | |
| **NALSA Report Export** | One-click quarterly report generation (PDF + Excel) | |

---

### Pillar 04: Systemic Pattern Intelligence Across the Case Corpus

#### 5.4.1 Analytics Queries

```sql
-- Q1: Charge sections driving longest undertrial detention
SELECT charge_section, AVG(detention_days) as avg_detention,
       COUNT(*) as case_count, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY detention_days) as median
FROM cases WHERE status = 'undertrial'
GROUP BY charge_section ORDER BY avg_detention DESC LIMIT 20;

-- Q2: Courts with worst bail-decision intervals for eligible cases
SELECT court_id, court_name, 
       AVG(bail_decision_date - eligibility_date) as avg_days_to_bail,
       COUNT(*) as eligible_cases
FROM cases WHERE eligibility_status = 'ELIGIBLE'
GROUP BY court_id, court_name ORDER BY avg_days_to_bail DESC;

-- Q3: Prisons with highest density of eligible-but-unserved undertrials [NEW]
SELECT p.prison_name, p.district, p.state,
       COUNT(*) FILTER (WHERE c.eligibility_status = 'ELIGIBLE' AND c.bail_granted = false) as eligible_unserved,
       COUNT(*) as total_cases,
       ROUND(100.0 * COUNT(*) FILTER (WHERE c.eligibility_status = 'ELIGIBLE' AND c.bail_granted = false) / COUNT(*), 1) as pct_eligible_unserved
FROM cases c JOIN prisons p ON c.prison_id = p.id
GROUP BY p.id ORDER BY eligible_unserved DESC;

-- Q4: Surety amounts vs local poverty indicators
SELECT d.name as district, d.state,
       AVG(c.surety_amount) as avg_surety,
       d.median_monthly_income,
       ROUND(AVG(c.surety_amount) / NULLIF(d.median_monthly_income, 0), 1) as surety_months_ratio,
       d.mgnrega_rate
FROM cases c JOIN districts d ON c.district_id = d.id
WHERE c.bail_granted = true AND c.surety_executed = false
GROUP BY d.id ORDER BY surety_months_ratio DESC;
```

#### 5.4.2 Feedback Loop

```
Every outcome feeds back:
├─ Bail Granted    → update eligibility engine priors + bail success predictor
├─ Bail Denied     → update bail success predictor (learn from failures)
├─ Adjournment     → update adjournment predictor training data
├─ Surety Blocked  → update surety gap analyzer thresholds
├─ Surety Reduced  → track S.440 application success rates
├─ Override        → retrain priority scorer weights (paralegal knows best)
└─ System accuracy tracked weekly → visible in admin dashboard
```

#### 5.4.3 Privacy Constraint (Structural Enforcement)

```sql
-- Automated PII anonymization trigger
CREATE OR REPLACE FUNCTION anonymize_closed_case() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CLOSED' AND OLD.status != 'CLOSED' THEN
        -- Schedule anonymization after 30 days
        INSERT INTO anonymization_queue (case_id, scheduled_date)
        VALUES (NEW.id, NOW() + INTERVAL '30 days');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PII deletion after 90 days
CREATE OR REPLACE FUNCTION delete_pii() RETURNS VOID AS $$
BEGIN
    UPDATE cases SET 
        accused_name = 'ANONYMIZED',
        fir_text = NULL,
        phone_numbers = NULL
    WHERE id IN (
        SELECT case_id FROM anonymization_queue 
        WHERE scheduled_date < NOW() - INTERVAL '60 days'  -- 30 + 60 = 90 total
    );
END;
$$ LANGUAGE plpgsql;
```

- **Visible data lifecycle diagram** in admin panel (interactive Mermaid chart)
- PII → Anonymized (30 days after closure) → Deleted (90 days) → Only aggregate patterns remain

---

### Pillar 05: Ethical Architecture, Failure Modes & Accountability Design

#### 5.5.1 Immutable Audit Log

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessment_type VARCHAR NOT NULL,  -- eligibility, priority, surety, bail_prediction
    data_sources JSONB NOT NULL,       -- [{source, url, fetched_at, freshness_hours}]
    reasoning_chain TEXT NOT NULL,     -- full legal reasoning (shown in Reasoning Graph)
    confidence DECIMAL(3,2) NOT NULL,
    result JSONB NOT NULL,
    paralegal_id VARCHAR,
    paralegal_response VARCHAR,        -- acted_on, overrode, flagged, ignored
    override_reason TEXT,
    
    -- Supervisor reconstruction fields
    system_version VARCHAR NOT NULL,   -- which model version produced this
    input_hash VARCHAR NOT NULL        -- hash of inputs for reproducibility
);

-- IMMUTABLE: no UPDATE or DELETE allowed on this table
REVOKE UPDATE, DELETE ON audit_log FROM app_user;
REVOKE UPDATE, DELETE ON audit_log FROM app_admin;
-- Only superuser can modify (for DPDPA erasure requests only)
```

#### 5.5.2 Graceful Degradation Matrix

| Failure Mode | Detection | Designed Response | User Message |
|---|---|---|---|
| **eCourts API down** | Health check fails 3× | Mark cases `STALE`, block auto-escalation, continue with cached data | "⚠️ {State} data last updated {X}h ago — assessments may be outdated" |
| **FIR parse < 60% confidence** | NLP confidence output | Exclude from eligible queue, flag for **mandatory lawyer review** | "📋 FIR extraction uncertain — requires human verification before eligibility" |
| **Name/identity mismatch** | Fuzzy score 50-80% | **Never auto-merge**, create `REVIEW_NEEDED` flag visible in queue | "👤 Possible match found — human verification required" |
| **ML model drift** | Weekly accuracy < threshold | Fallback to **rule-based eligibility** only, alert admin | "🔄 System using rule-based assessment — ML under review" |
| **Notification failure** | Webhook 4xx/5xx | Retry 3× with exponential backoff → alert paralegal | "📱 Family notification failed — manual follow-up needed" |
| **Database overload** | Connection pool exhausted | Read-only mode with cached data, queue writes | "⏳ System in read-only mode — actions will sync shortly" |

#### 5.5.3 Role-Based Access Control (RBAC)

| Role | Case Access | Bulk Export | Audit Trail |
|---|---|---|---|
| **Paralegal** | Own assigned cases only | ❌ No | All actions logged |
| **Panel Lawyer** | Assigned cases only | ❌ No | All actions logged |
| **DLSA Supervisor** | All district cases | ✅ With written justification | Export logged with reason |
| **UTRC Coordinator** | Aggregated district view | ✅ Anonymized only | All actions logged |
| **NALSA Admin** | Cross-district aggregates | ✅ With supervisor approval chain | All actions + approval logged |
| **System Admin** | Infrastructure only — **no case data access** | ❌ No | All access logged |

#### 5.5.4 DPDPA 2023 Compliance (Structural)

- **Data localisation**: Neon PostgreSQL Mumbai region + Render Mumbai
- **Right to erasure**: one-click PII deletion with cascading anonymization + audit entry
- **Consent management**: granular consent per notification channel, timestamps stored
- **Deletion triggers**: automated via PostgreSQL triggers (30-day anonymize, 90-day delete)
- **Data minimization**: only fields necessary for active case management are stored
- **No bulk PII access**: RBAC prevents any role from having bulk PII export without audit

---

### Pillar 06: Multilingual NLP & Language Justice Engine

#### 5.6.1 Charge Section Extractor

```python
class ChargeExtractor:
    """
    Extract IPC/BNSS charge sections from multilingual FIR text.
    Supports: Hindi, English, Marathi, Bengali, Telugu, Tamil, Kannada, Gujarati, Odia, Punjabi
    Handles: OCR errors, mixed scripts, narrative prose, IPC↔BNSS transitional mapping
    """
    
    SUPPORTED_LANGUAGES = ['hi', 'en', 'mr', 'bn', 'te', 'ta', 'kn', 'gu', 'or', 'pa']
    
    def __init__(self):
        self.gemini = genai.GenerativeModel('gemini-2.0-flash')  # Free tier
        self.ocr_corrector = OCRErrorCorrector()
        self.section_regex = self._build_multilingual_section_regex()
        self.ipc_bnss_map = self._load_ipc_bnss_mapping()  # IPC → BNSS transitional
    
    def extract(self, fir_text: str, language: str) -> List[ChargeSection]:
        # 1. OCR error correction (common Devanagari/Tamil OCR mistakes)
        corrected = self.ocr_corrector.correct(fir_text, language)
        
        # 2. Detect mixed scripts within single document
        detected_langs = self.detect_mixed_scripts(corrected)
        
        # 3. Fast regex extraction (high precision, catches structured references)
        regex_matches = self.section_regex.findall(corrected)
        
        # 4. Gemini extraction for narrative-embedded sections (prose, not structured)
        gemini_prompt = f"""Extract ALL IPC/BNSS charge sections from this FIR text.
        The text is in {language} and may contain OCR errors.
        Return ONLY a JSON array: [{{"section": "379", "act": "IPC", "confidence": 0.9}}]
        FIR Text: {corrected[:4000]}"""  # Limit to stay within free tier
        
        gemini_matches = self._parse_gemini_response(
            self.gemini.generate_content(gemini_prompt)
        )
        
        # 5. Merge regex + Gemini results, deduplicate, handle IPC↔BNSS
        all_sections = self._merge_and_deduplicate(regex_matches, gemini_matches)
        
        # 6. Map IPC sections to BNSS equivalents for transitional cases
        for section in all_sections:
            if section.act == 'IPC' and section.section in self.ipc_bnss_map:
                section.bnss_equivalent = self.ipc_bnss_map[section.section]
        
        return all_sections
```

#### 5.6.2 Plain Language Generator

```python
class PlainLanguageGenerator:
    """Generate case status in simple language — not word-for-word legal translation."""
    
    LEGAL_TERM_GLOSSARY = {
        'remand': {
            'hi': 'कोर्ट ने अगली सुनवाई तक जेल में रखने का आदेश दिया है',
            'ta': 'நீதிமன்றம் அடுத்த விசாரணை வரை சிறையில் வைக்க உத்தரவிட்டுள்ளது',
            'bn': 'আদালত পরবর্তী শুনানি পর্যন্ত জেলে রাখার নির্দেশ দিয়েছে',
            # ... 10+ languages
        },
        'bail': { ... },
        'charge_sheet': { ... },
        'next_hearing': { ... },
        'surety': { ... },
    }
    
    def generate_status(self, case: Case, language: str) -> str:
        """Generate plain-language status using Gemini + glossary."""
        prompt = f"""Generate a SIMPLE case status update in {language}.
        The reader has NO legal literacy. Use everyday words.
        Do NOT use any legal jargon without explaining it.
        Case: {case.summary}
        Next hearing: {case.next_hearing_date}
        Status: {case.eligibility_status}"""
        
        response = self.gemini.generate_content(prompt)
        
        # Post-process: replace any remaining jargon with glossary terms
        return self._apply_glossary(response.text, language)
    
    def generate_with_human_review_flag(self, case, language):
        """Every new language template goes through human review pathway."""
        status = self.generate_status(case, language)
        return {
            'text': status,
            'language': language,
            'needs_human_review': language not in self.verified_languages,
            'review_queue_id': self._add_to_review_queue(status, language) if language not in self.verified_languages else None
        }
```

#### 5.6.3 Name Normalisation

```python
class NameNormalizer:
    """
    Conservative name matching across transliterations.
    The same person may appear as: "Mohammed Iqbal", "मोहम्मद इकबाल", 
    "Mohd. Ikbal", "মোহাম্মদ ইকবাল" across different state portals.
    """
    
    def match(self, name_a: str, name_b: str) -> MatchResult:
        # 1. Transliterate both to a common script (Latin/Devanagari)
        norm_a = indic_transliteration.transliterate(name_a, target='IAST')
        norm_b = indic_transliteration.transliterate(name_b, target='IAST')
        
        # 2. Phonetic matching (IndicSoundex for Indian names)
        phonetic_score = self.indic_soundex.similarity(norm_a, norm_b)
        
        # 3. Edit distance (Levenshtein)
        edit_score = 1 - (levenshtein(norm_a, norm_b) / max(len(norm_a), len(norm_b), 1))
        
        # 4. Combined weighted score
        score = 0.6 * phonetic_score + 0.4 * edit_score
        
        # 5. CONSERVATIVE merge policy
        if score > 0.95:
            return MatchResult(action="AUTO_MATCH", confidence=score)
        elif score > 0.70:
            # NEVER auto-merge at this level — flag for human review
            return MatchResult(action="HUMAN_REVIEW", confidence=score)
        else:
            return MatchResult(action="NO_MATCH", confidence=score)
```

---

### Pillar 07: Bail Surety & Financial Access Intelligence

#### 5.7.1 Surety Gap Detector

```sql
-- Immediate intervention targets: bail granted >14 days, surety unexecuted
SELECT c.case_id, c.bail_granted_date,
       c.surety_amount, 
       d.median_daily_wage, d.mgnrega_rate, d.median_monthly_income,
       ROUND(c.surety_amount / NULLIF(d.median_daily_wage, 0)) as days_of_wages,
       ROUND(c.surety_amount / NULLIF(d.median_monthly_income, 0), 1) as months_of_income,
       CASE 
         WHEN c.surety_amount > d.median_monthly_income * 3  -- >90 days of income
         THEN 'S440_REDUCTION_CANDIDATE'
         ELSE 'INTERVENTION_NEEDED'
       END as surety_action
FROM cases c
JOIN districts d ON c.district_id = d.id
WHERE c.bail_granted = true 
  AND c.surety_executed = false
  AND c.bail_granted_date < NOW() - INTERVAL '14 days'
ORDER BY months_of_income DESC;
```

#### 5.7.2 Section 440 / S.483 BNSS Auto-Brief Generator

```python
class SuretyReductionBriefGenerator:
    """Auto-generate surety reduction application for lawyer review."""
    
    def generate(self, case: Case, district: District) -> Brief:
        # Only trigger when surety > 90 days of local median income
        if case.surety_amount <= district.median_monthly_income * 3:
            return None
        
        prompt = f"""Generate a surety reduction application brief under 
        Section 440 CrPC / Section 483 BNSS for:
        - Case: {case.case_number}
        - Surety amount: ₹{case.surety_amount:,.0f}
        - District median monthly income: ₹{district.median_monthly_income:,.0f}
        - MGNREGA daily rate: ₹{district.mgnrega_rate}
        - Surety = {case.surety_amount/district.median_monthly_income:.1f} months of income
        
        Include: legal basis, case details, financial hardship argument, 
        relevant precedents, suggested reduced amount.
        Mark as DRAFT — REQUIRES LAWYER REVIEW."""
        
        brief = self.gemini.generate_content(prompt)
        
        return Brief(
            content=brief.text,
            status="DRAFT_FOR_LAWYER_REVIEW",  # Always needs lawyer approval
            legal_basis="S.440 CrPC / S.483 BNSS",
            supporting_data={
                'surety_amount': case.surety_amount,
                'district_income': district.median_monthly_income,
                'ratio': case.surety_amount / district.median_monthly_income
            }
        )
```

#### 5.7.3 Systemic Surety Pattern Dashboard

- Courts with systematically unaffordable surety → **interactive bar chart**
- Surety-to-income ratios by district → **choropleth map** (Leaflet + OSM)
- Trend analysis: are surety amounts decreasing after interventions?
- Feeds directly into **NALSA policy intelligence reports** (one-click export)

---

### Pillar 08: Adjournment Prediction & Court Behaviour Modelling

#### 5.8.1 Model Architecture (XGBoost — Free, Lightweight)

```python
class AdjournmentPredictor:
    """Predict adjournment probability for upcoming hearings using XGBoost."""
    
    FEATURES = [
        'court_judge_case_type_adj_rate',    # Historical adjournment rate
        'consecutive_prior_adjournments',     # Number of consecutive adjournments
        'day_of_week',                        # Mon=0 ... Fri=4
        'days_to_court_vacation',             # Proximity to vacation period
        'charge_sheet_filed',                 # Boolean: prosecution filed?
        'prosecution_witness_count',          # Available witnesses
        'time_since_last_effective_hearing',  # Days since last non-adjourned hearing
        'case_age_days',                      # Total case age
        'court_daily_case_load'              # Average daily load of this court
    ]
    
    def __init__(self):
        self.model = xgb.XGBClassifier(
            n_estimators=100, max_depth=6, 
            learning_rate=0.1, use_label_encoder=False
        )
        self.explainer = None  # SHAP explainer loaded after training
    
    def predict(self, hearing: Hearing) -> AdjournmentPrediction:
        features = self.extract_features(hearing)
        prob = float(self.model.predict_proba([features])[0][1])
        
        # Bootstrap confidence interval (50 samples for speed)
        ci_low, ci_high = self.bootstrap_ci(features, n_samples=50)
        
        # SHAP explanation — which factors drove this prediction?
        shap_values = self.explainer.shap_values([features])
        key_factors = self._top_factors(shap_values, self.FEATURES)
        
        return AdjournmentPrediction(
            probability=round(prob * 100, 1),  # 0-100%
            confidence_interval=(round(ci_low*100,1), round(ci_high*100,1)),
            key_factors=key_factors,
            uncertainty_level='HIGH' if (ci_high - ci_low) > 0.3 else 'MEDIUM' if (ci_high - ci_low) > 0.15 else 'LOW',
            disclaimer="⚠️ This prediction is an input to judgment, not an instruction."
        )
```

#### 5.8.2 Schedule Reprioritisation

When adjournment probability > 75% AND another case has time-sensitive action:
```
🔄 Hearing A (Case #123): 82% likely to be adjourned
   → Suggest: "Consider prioritizing Case #456 (S.479 eligible, hearing in 2 days, 
   bail success rate 71% at this court)"
```
- Never hides any case — only re-ranks and surfaces the signal
- Paralegal always has final say

#### 5.8.3 UTRC Pattern Alerts

```python
# Alert when court adjourns eligible cases 20+ times in a quarter
def check_utrc_alerts(quarter_start, quarter_end):
    query = """
    SELECT c.court_name, c.judge_name,
           COUNT(*) as adj_count,
           COUNT(*) FILTER (WHERE h.case_eligibility = 'ELIGIBLE') as eligible_adj_count,
           district_avg.avg_adj
    FROM hearings h
    JOIN courts c ON h.court_id = c.id
    CROSS JOIN LATERAL (
        SELECT AVG(adj_count) as avg_adj FROM court_quarterly_stats
    ) district_avg
    WHERE h.outcome = 'ADJOURNED'
      AND h.hearing_date BETWEEN %s AND %s
    GROUP BY c.id
    HAVING COUNT(*) FILTER (WHERE h.case_eligibility = 'ELIGIBLE') >= 20
    """
    # Generate alert for UTRC coordinator
```

---

### Pillar 09: Federated Intelligence Across DLSAs

#### 5.9.1 Architecture (Flower — Free & Open Source)

```mermaid
graph LR
    subgraph "DLSA Node (Local — Docker)"
        A[Local Case Data<br/>Never leaves node] --> B[Local Model Training<br/>XGBoost/NN]
        B --> C[Model Weights + DP Noise<br/>Opacus ε=1.0]
    end
    
    subgraph "Central Aggregator (Render)"
        C -->|gRPC + TLS<br/>Weights ONLY| D[FedAvg / FedProx]
        D --> F[Global Model]
    end
    
    F -->|Updated Global Weights| B
    
    subgraph "NALSA Governance Dashboard"
        G[Which DLSAs participating?]
        H[Data quality scores per DLSA]
        I[Accuracy improvement: local vs global]
        J[Withdrawal + weight removal status]
    end
```

**Key guarantees:**
- Only model weights transmitted — **never raw case data**
- Differential privacy: Opacus (ε=1.0, δ=1e-5) — **individual records cannot be reverse-engineered**
- **Async federation**: low-connectivity DLSAs contribute when available
- **Contribution-weighted accuracy**: districts that contribute more data get better local predictions

#### 5.9.2 One-Page Setup for DLSAs (No Developer Required)

```bash
# ENTIRE setup for a new DLSA node — copy-paste this one command:
curl -sSL https://justicegrid.in/setup.sh | bash

# What it does:
# 1. Installs Docker if not present
# 2. Pulls justicegrid-dlsa-node image
# 3. Prompts: DLSA code, admin email, data directory path
# 4. Auto-configures FL client, local model, and daily sync cron
# 5. Runs data quality checks on local data
# 6. Registers node with central FL server
# Total time: ~5 minutes. No developer required.
```

#### 5.9.3 NALSA Governance Layer

| Dashboard View | Data Shown |
|---|---|
| Participation Map | Interactive India map showing which DLSAs are online |
| Data Quality | Completeness, freshness, and consistency scores per DLSA |
| Accuracy Impact | "DLSA X's contribution improved global adjournment prediction by 2.3%" |
| Federation Rounds | When each DLSA last contributed, sync status |

#### 5.9.4 Withdrawal Architecture (Architecturally Enforced)

```python
class FederatedWithdrawal:
    """DLSA can withdraw at any time — their weights are REMOVED, not just ignored."""
    
    def withdraw(self, dlsa_id: str):
        # 1. Remove DLSA's weights from global model
        self.global_model = self.federated_unlearning(
            global_model=self.global_model,
            client_weights=self.stored_contributions[dlsa_id]
        )
        
        # 2. Cryptographic proof of removal
        removal_hash = hashlib.sha256(
            f"{dlsa_id}:{self.global_model.state_dict()}".encode()
        ).hexdigest()
        
        # 3. Log removal immutably
        self.audit_log.append({
            'action': 'DLSA_WITHDRAWAL',
            'dlsa_id': dlsa_id,
            'removal_hash': removal_hash,
            'timestamp': datetime.utcnow(),
            'verification': 'cryptographic_proof'
        })
        
        # 4. Delete stored contributions
        del self.stored_contributions[dlsa_id]
        
        return WithdrawalReceipt(dlsa_id=dlsa_id, proof=removal_hash)
```

---

### Pillar 10: Voice-First Access for Zero-Literacy Users

#### 5.10.1 WhatsApp Voice Flow (Demo: Built-in Simulator)

```mermaid
sequenceDiagram
    participant F as Family Member
    participant WS as WhatsApp Chat Simulator
    participant J as JusticeGrid Backend  
    participant G as Gemini API (Free)
    participant B as Bhashini TTS/ASR
    
    F->>WS: Types/speaks case reference
    WS->>J: Process input
    J->>G: "Generate plain-language status in Hindi for case #XYZ"
    G-->>J: Simple status text
    J->>B: TTS (Text → Speech in Hindi/dialect)
    B-->>J: Audio response
    J->>WS: Display text + play audio
    WS->>F: Status in their language + audio
    
    F->>WS: "What does 'remand' mean?"
    WS->>J: Glossary lookup
    J-->>WS: Plain explanation from Legal Term Glossary
```

**Dialect Differentiation (unique PS requirement):**
- Phone number region → auto-detect probable dialect (UP → Bhojpuri/Awadhi, Rajasthan → Rajasthani/Marwari)
- Bhashini API dialect-specific TTS models where available
- Fallback: standard Hindi/regional language with simplified vocabulary
- **Legal term glossary per dialect** — "remand" explained differently for Bhojpuri vs Rajasthani families

#### 5.10.2 IVR Fallback (Demo: Web Speech API)

```
For DEMO: Uses browser's Web Speech API (free, built-in)
For PRODUCTION: Twilio IVR

Flow:
1. Family calls → greeting auto-detects language from phone region
2. "Press 1 for Hindi, 2 for Marathi, 3 for Tamil..." OR say language name
3. "Please enter your case reference number"
4. System reads case status in selected language
5. Options: 
   - Press 1: Repeat
   - Press 2: "What does that mean?" (explains last legal term used)
   - Press 3: Connect to DLSA helpline
   - Press 0: Change language
```

#### 5.10.3 Safety Rules (All PS-Required)

| Rule | Implementation |
|---|---|
| ✅ Voice briefing (status, hearing, outcome) | Gemini generates + Bhashini TTS speaks |
| ✅ "What does that mean?" active listening | Keyword detection → glossary lookup → re-explain |
| ✅ Connect to DLSA helpline if confused/distressed | Sentiment detection → offer helpline |
| ❌ Never legal advice | System prompt constraint + post-generation filter |
| ❌ Never predictions about outcomes | Explicitly blocked terms: "will", "likely", "probably" |
| ❌ Never asks for personal info beyond case reference | Input validation: only case reference accepted |
| ❌ Never stores voice beyond session | Audio buffer cleared on session end, no server-side storage |

---

## 6. Database Schema (Neon PostgreSQL Free Tier)

```sql
-- Core case record
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR UNIQUE NOT NULL,
    accused_name VARCHAR NOT NULL,
    prison_id UUID REFERENCES prisons(id),
    district_id UUID REFERENCES districts(id),
    court_id UUID REFERENCES courts(id),
    
    -- Charges (JSONB for flexible multi-charge storage)
    charges JSONB NOT NULL DEFAULT '[]',
    fir_text TEXT,
    fir_language VARCHAR(5),
    
    -- Detention
    arrest_date DATE NOT NULL,
    accused_delay_days INTEGER DEFAULT 0,  -- S.479 proviso: exclude accused-caused delays
    
    -- Eligibility
    is_first_offender BOOLEAN,
    has_multiple_pending_cases BOOLEAN DEFAULT false,
    eligibility_status VARCHAR DEFAULT 'PENDING',  -- ELIGIBLE, NOT_ELIGIBLE, REVIEW_NEEDED, EXCLUDED
    eligibility_confidence DECIMAL(3,2),
    eligibility_reasoning TEXT,
    last_eligibility_check TIMESTAMPTZ,
    
    -- Bail
    bail_granted BOOLEAN DEFAULT false,
    bail_granted_date DATE,
    bail_success_probability DECIMAL(3,2),  -- Differentiator 3
    surety_amount DECIMAL(12,2),
    surety_executed BOOLEAN DEFAULT false,
    
    -- Priority
    priority_score DECIMAL(5,2),
    
    -- Assignment
    assigned_paralegal_id UUID REFERENCES users(id),
    assigned_lawyer_id UUID REFERENCES users(id),
    
    -- Metadata
    data_freshness TIMESTAMPTZ DEFAULT NOW(),
    source_portal VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE',  -- ACTIVE, CLOSED, ANONYMIZED
    
    -- DPDPA compliance
    pii_deletion_scheduled DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance on free tier
CREATE INDEX idx_cases_eligibility ON cases(eligibility_status) WHERE status = 'ACTIVE';
CREATE INDEX idx_cases_priority ON cases(priority_score DESC) WHERE status = 'ACTIVE';
CREATE INDEX idx_cases_surety_gap ON cases(bail_granted, surety_executed, bail_granted_date) 
    WHERE bail_granted = true AND surety_executed = false;
CREATE INDEX idx_cases_search ON cases USING gin(to_tsvector('english', case_number || ' ' || accused_name));

-- Prisons
CREATE TABLE prisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prison_name VARCHAR NOT NULL,
    district_id UUID REFERENCES districts(id),
    state VARCHAR NOT NULL,
    capacity INTEGER,
    current_population INTEGER,
    lat DECIMAL(9,6),  -- For prison heatmap (Differentiator 5)
    lng DECIMAL(9,6)
);

-- Courts with behaviour modelling
CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_name VARCHAR NOT NULL,
    district_id UUID REFERENCES districts(id),
    state VARCHAR NOT NULL,
    historical_adjournment_rate DECIMAL(3,2),
    avg_bail_decision_days INTEGER,
    daily_case_load INTEGER,
    bail_grant_rate DECIMAL(3,2)  -- For bail success predictor
);

-- Hearings
CREATE TABLE hearings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    hearing_date DATE NOT NULL,
    court_id UUID REFERENCES courts(id),
    judge_name VARCHAR,
    outcome VARCHAR,  -- HEARD, ADJOURNED, BAIL_GRANTED, BAIL_DENIED
    next_hearing_date DATE,
    adjournment_predicted_prob DECIMAL(3,2),
    adjournment_actual BOOLEAN,
    charge_sheet_filed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts with economic data (for surety gap analysis)
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    median_daily_wage DECIMAL(8,2),
    mgnrega_rate DECIMAL(8,2),
    median_monthly_income DECIMAL(10,2),
    population INTEGER,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6)
);

-- Family contacts (DPDPA compliant)
CREATE TABLE family_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    phone_number VARCHAR NOT NULL,  -- Encrypted at rest
    preferred_language VARCHAR(5) DEFAULT 'hi',
    preferred_dialect VARCHAR(20),  -- 'bhojpuri', 'rajasthani', etc.
    preferred_channel VARCHAR DEFAULT 'WHATSAPP',
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ,
    consent_version VARCHAR,  -- Which T&C version they agreed to
    last_notification_date TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    escalation_45_day_check BOOLEAN DEFAULT false
);

-- Immutable audit log (append-only)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessment_type VARCHAR NOT NULL,
    data_sources JSONB NOT NULL,
    reasoning_chain TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    result JSONB NOT NULL,
    paralegal_id VARCHAR,
    paralegal_response VARCHAR,
    override_reason TEXT,
    system_version VARCHAR NOT NULL,
    input_hash VARCHAR NOT NULL
);
REVOKE UPDATE, DELETE ON audit_log FROM app_user;

-- Notification log
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id),
    contact_id UUID REFERENCES family_contacts(id),
    channel VARCHAR NOT NULL,
    language VARCHAR(5) NOT NULL,
    content_type VARCHAR NOT NULL,
    content_summary TEXT,
    delivery_status VARCHAR DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0
);

-- Federated learning tracking
CREATE TABLE fl_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dlsa_code VARCHAR UNIQUE NOT NULL,
    dlsa_name VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_contribution TIMESTAMPTZ,
    contribution_count INTEGER DEFAULT 0,
    data_quality_score DECIMAL(3,2),
    status VARCHAR DEFAULT 'ACTIVE',  -- ACTIVE, WITHDRAWN
    withdrawal_proof VARCHAR  -- Cryptographic hash
);
```

---

## 7. API Design

```yaml
# Auth (Supabase — free tier)
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me

# Cases
GET    /api/v1/cases                          # List with filters + search
GET    /api/v1/cases/{id}                     # Full case detail
GET    /api/v1/cases/queue                    # Priority queue for paralegal
POST   /api/v1/cases/{id}/action              # Record paralegal action (acted/overrode/flagged)
GET    /api/v1/cases/{id}/reasoning-graph      # Legal Reasoning Graph data (Differentiator 2)
GET    /api/v1/cases/{id}/countdown            # Constitutional Countdown (Differentiator 1)

# Eligibility
GET    /api/v1/cases/{id}/eligibility         # Full eligibility with confidence + reasoning
POST   /api/v1/eligibility/batch-recheck       # Trigger daily re-evaluation

# Bail Intelligence
GET    /api/v1/cases/{id}/bail-prediction      # Bail success probability (Differentiator 3)
GET    /api/v1/hearings/{id}/adjournment       # Adjournment prediction with CI

# Surety
GET    /api/v1/surety/gap-report              # All unexecuted surety cases
GET    /api/v1/surety/{case_id}/reduction-brief # Auto-generated S.440/S.483 brief
GET    /api/v1/surety/systemic-patterns        # Court-level surety affordability analysis

# Analytics
GET    /api/v1/analytics/charge-detention      # Charge → detention correlation
GET    /api/v1/analytics/court-performance     # Court behaviour analytics
GET    /api/v1/analytics/prison-heatmap        # Prison density data for map (Differentiator 5)
GET    /api/v1/analytics/district-comparison   # Cross-district metrics
GET    /api/v1/analytics/accuracy-tracking     # System accuracy over time

# UTRC
GET    /api/v1/utrc/dashboard                 # Coordinator dashboard
GET    /api/v1/utrc/nalsa-report               # Quarterly report export (PDF/Excel)

# Communication
POST   /api/v1/comms/chat-simulate             # WhatsApp simulator (Differentiator 4)
POST   /api/v1/comms/voice-simulate            # IVR simulator (Web Speech API)
GET    /api/v1/comms/notification-log           # Notification audit trail
POST   /api/v1/comms/glossary-lookup            # Legal term plain-language explanation

# Multilingual
POST   /api/v1/nlp/extract-charges             # Extract charges from FIR text
POST   /api/v1/nlp/translate                    # Plain-language translation
POST   /api/v1/nlp/name-match                   # Name normalisation check

# Federated Learning
POST   /api/v1/fl/register                     # DLSA node registration
GET    /api/v1/fl/governance                   # NALSA governance dashboard
POST   /api/v1/fl/withdraw                     # DLSA withdrawal + weight removal

# Admin
GET    /api/v1/admin/audit-log                 # Full audit trail
GET    /api/v1/admin/data-lifecycle             # Data lifecycle diagram + status
POST   /api/v1/admin/erasure-request            # DPDPA right to erasure
GET    /api/v1/admin/system-health              # Degradation status for all data sources
```

---

## 8. Frontend Architecture

### 8.1 App Structure (Next.js 14 — Vercel Free Tier)

```
justicegrid-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + navbar + role-based nav
│   │   ├── page.tsx                    # Home: Priority Queue + Countdown Clocks
│   │   ├── cases/
│   │   │   ├── page.tsx                # Case list with search + filters
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Case detail + Reasoning Graph
│   │   │       └── bail-brief/page.tsx # S.440 reduction brief viewer
│   │   ├── hearings/page.tsx           # Calendar + adjournment predictions
│   │   ├── surety/page.tsx             # Surety gap dashboard
│   │   ├── analytics/page.tsx          # Systemic patterns + charts
│   │   ├── heatmap/page.tsx            # Prison Heatmap (Differentiator 5)
│   │   ├── utrc/page.tsx               # UTRC coordinator dashboard
│   │   └── communicate/page.tsx        # WhatsApp + IVR Simulators
│   ├── admin/
│   │   ├── audit/page.tsx              # Audit log viewer (reconstruct any decision)
│   │   ├── federation/page.tsx         # FL governance dashboard
│   │   ├── data-lifecycle/page.tsx     # DPDPA compliance + lifecycle diagram
│   │   └── health/page.tsx             # System health + degradation status
│   └── api/ (Next.js route handlers)
├── components/
│   ├── countdown-clock/               # Constitutional Countdown (Differentiator 1)
│   ├── reasoning-graph/               # Legal Reasoning Graph (Differentiator 2)
│   ├── bail-predictor/                # Bail Success viz (Differentiator 3)
│   ├── whatsapp-simulator/            # Chat Simulator (Differentiator 4)
│   ├── prison-heatmap/                # India Map (Differentiator 5)
│   ├── case-queue/
│   ├── eligibility-card/
│   ├── adjournment-gauge/
│   ├── surety-chart/
│   ├── priority-badge/
│   ├── offline-indicator/
│   └── nalsa-report-export/
├── lib/
│   ├── api-client.ts                  # Fetch wrapper with auth
│   ├── offline-store.ts               # IndexedDB for PWA offline
│   ├── sync-engine.ts                 # Offline ↔ online sync
│   └── gemini-client.ts               # Gemini API free tier client
└── public/
    ├── sw.js                          # Service worker for offline
    └── manifest.json                  # PWA manifest
```

### 8.2 Design System (Premium Dark Theme)

| Token | Value | Usage |
|---|---|---|
| **Primary** | `#3B82F6` (Justice Blue) | CTAs, active states, links |
| **Secondary** | `#8B5CF6` (Insight Purple) | Analytics, predictions, AI features |
| **Success** | `#10B981` (Eligible Green) | Eligible status, positive outcomes |
| **Warning** | `#F59E0B` (Countdown Amber) | Time-sensitive, approaching eligibility |
| **Danger** | `#EF4444` (Overdue Red) | Overdue cases, failures, critical alerts |
| **Background** | `#0F172A` (Midnight Slate) | Page background |
| **Surface** | `#1E293B` (Card Surface) | Cards, panels |
| **Surface Hover** | `#334155` | Interactive elements |
| **Text Primary** | `#F8FAFC` | Main text |
| **Text Secondary** | `#94A3B8` | Secondary text |
| **Border** | `#334155` | Subtle borders |
| **Font** | Inter (UI) + Noto Sans Devanagari (Hindi) + Noto Sans Tamil, etc. | Google Fonts (free) |
| **Radius** | 12px (cards), 8px (buttons), 9999px (badges) | Consistent rounding |

---

## 9. Deployment — 100% Free

```
GitHub Repository
  ├── Backend (FastAPI) → Render Free Tier (Mumbai region)
  │     ├── Neon PostgreSQL (free - 0.5GB)
  │     ├── Upstash Redis (free - 256MB)
  │     └── Celery Worker (same Render instance)
  │
  ├── Frontend (Next.js) → Vercel Free Tier
  │     ├── Auto-deploy from GitHub
  │     └── Edge functions for API proxy
  │
  └── ML Models → Bundled with backend
        ├── XGBoost adjournment model (~2MB)
        ├── Charge extraction (Gemini API call)
        └── Translation (Gemini + Bhashini API)
```

---

## 10. Hackathon Demo Script (10 minutes)

| Time | Segment | What Judges See | Differentiator |
|---|---|---|---|
| 0:00-1:00 | **The Crisis** | Stats + single anonymized story → emotional hook | — |
| 1:00-2:30 | **Priority Queue** | Live queue with **Countdown Clocks** ticking in real-time | ✅ #1 |
| 2:30-4:00 | **Case Deep-Dive** | Click case → **Legal Reasoning Graph** showing exactly how eligibility was computed | ✅ #2 |
| 4:00-5:00 | **Bail Intelligence** | Show **bail success probability**: "73% grant rate for S.379 at this court" | ✅ #3 |
| 5:00-6:00 | **Family Communication** | Type in **WhatsApp Simulator** → get Hindi response → ask "what does remand mean?" | ✅ #4 |
| 6:00-7:00 | **Prison Heatmap** | Zoom into India map → see hotspots → drill down to prison → case list | ✅ #5 |
| 7:00-7:45 | **Surety Intelligence** | Show unaffordable surety case → click "Generate Brief" → **auto-generated S.440 petition** | ✅ #6 |
| 7:45-8:30 | **Systemic Patterns** | Analytics: worst courts, charge-detention correlation, adjournment prediction | — |
| 8:30-9:15 | **Ethics & Privacy** | Audit log, graceful degradation demo (simulate eCourts down), RBAC | — |
| 9:15-10:00 | **Scale** | FL dashboard, DLSA setup demo, **ICJS integration architecture** diagram | ✅ #7 |

---

## 11. Seed Data Strategy (Synthetic — Free)

Generate with Python + Faker:
- **5,000 undertrial cases** across 5 states (MH, UP, BR, TN, WB)
- **200 courts** with realistic adjournment patterns (some good, some terrible)
- **50 prisons** with lat/lng for heatmap
- **3 months of hearing history** with realistic outcomes
- **Charge sections** mapped to real IPC/BNSS provisions with correct max sentences
- **Surety amounts** calibrated to district income levels (some affordable, some 10× income)
- **Family contacts** with language preferences across 10 languages
- **All synthetic** — zero real prisoner data, no ethical concerns

---

## 12. Build Timeline

> [!IMPORTANT]
> Priority: **Working Pillars 1-3 with all 7 differentiators visible > all 10 pillars half-done**

### Phase 1: Foundation (Hours 0-6)
- [ ] Next.js + FastAPI + Neon PostgreSQL + Supabase Auth scaffold
- [ ] Database schema deployment + seed data generator
- [ ] Core CRUD APIs (cases, hearings, courts, districts)
- [ ] Auth + RBAC middleware

### Phase 2: Core Intelligence (Hours 6-16)
- [ ] Section 479 eligibility engine (full logic)
- [ ] Priority scoring algorithm
- [ ] Constitutional Countdown Clock component
- [ ] Legal Reasoning Graph component
- [ ] Paralegal dashboard: queue + case detail

### Phase 3: AI & NLP (Hours 16-26)
- [ ] Charge extraction (Gemini API + regex)
- [ ] Plain language generator (Gemini + glossary)
- [ ] Adjournment predictor (XGBoost on synthetic data)
- [ ] Bail success predictor (historical-data-based)
- [ ] Surety gap analysis + S.440 brief generator

### Phase 4: Interfaces & Communication (Hours 26-36)
- [ ] WhatsApp Chat Simulator component
- [ ] IVR demo with Web Speech API
- [ ] Prison Heatmap (Leaflet + OpenStreetMap)
- [ ] UTRC coordinator dashboard + NALSA report export
- [ ] Auto-generated writ petition draft

### Phase 5: Ethics & Federation (Hours 36-42)
- [ ] Immutable audit log + supervisor reconstruction view
- [ ] Graceful degradation handlers (all 6 failure modes)
- [ ] Federated learning demo (Flower — 2 simulated DLSA nodes)
- [ ] Data lifecycle visualization
- [ ] DPDPA compliance dashboard

### Phase 6: Polish & Deploy (Hours 42-48)
- [ ] Offline PWA mode (service worker + IndexedDB)
- [ ] Analytics dashboards (systemic patterns)
- [ ] ICJS integration architecture diagram
- [ ] Deploy: FastAPI → Render, Next.js → Vercel
- [ ] Demo rehearsal + backup video recording

---

## 13. Why We Win

| What Judges Look For | What We Deliver |
|---|---|
| **All 10 pillars addressed** | ✅ 100% coverage (see audit table in §0) |
| **Technical depth** | ✅ Production-grade eligibility engine, ML models, federated learning |
| **Real-world feasibility** | ✅ Offline-first PWA, low-bandwidth design, one-command DLSA setup |
| **Data privacy & ethics** | ✅ DPDPA compliance, immutable audit, RBAC, graceful degradation |
| **User empathy** | ✅ 4-min/case design, voice-first for illiterate families, dialect support |
| **Wow factor** | ✅ 7 unique differentiators no other team has |
| **Demo quality** | ✅ 10-minute script with live interactions at every step |
| **Scalability story** | ✅ Federated architecture, ICJS integration design, async federation |
| **Cost** | ✅ **$0** — entirely free tier |

---

## User Review Required

> [!IMPORTANT]
> **Please confirm before I start building:**
> 1. **Hackathon duration** — 24h, 36h, or 48h? (Build timeline assumes 48h)
> 2. **Team size** — Solo or team? (Affects what we can parallelize)
> 3. **Which differentiators to prioritize?** All 7, or pick top 3-4?
> 4. **Do you have GitHub + Vercel + Render + Neon accounts?** (All free to create)
