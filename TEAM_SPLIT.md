# JusticeGrid — 3-Laptop Team Split

## How This Works

```
LAPTOP A (Backend Lead)     ← Builds the brain: APIs, database, ML models, eligibility engine
LAPTOP B (Frontend Lead)    ← Builds the face: dashboard, all UI components, offline PWA
LAPTOP C (AI/NLP + Infra)   ← Builds the intelligence: NLP, voice, federated learning, deployment

All 3 work in ONE GitHub repo with 3 branches → merge at checkpoints
```

---

## Git Strategy

```
main (protected — merge only at checkpoints)
├── dev/backend    ← Laptop A
├── dev/frontend   ← Laptop B
└── dev/ai-infra   ← Laptop C
```

**Merge Checkpoints:**
- ⏱️ Hour 8: Foundation merge (schema + API stubs + frontend skeleton)
- ⏱️ Hour 20: Core features merge (eligibility + dashboard + NLP working end-to-end)
- ⏱️ Hour 36: Full features merge (all pillars integrated)
- ⏱️ Hour 44: Final merge (polish + deploy)

---

## Monorepo Structure (All 3 laptops clone this)

```
justicegrid/
├── backend/                  ← LAPTOP A owns this
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── config.py         # Env vars, DB connection
│   │   ├── models/           # SQLAlchemy/Pydantic models
│   │   ├── routers/          # API route files
│   │   │   ├── cases.py
│   │   │   ├── eligibility.py
│   │   │   ├── hearings.py
│   │   │   ├── surety.py
│   │   │   ├── analytics.py
│   │   │   ├── utrc.py
│   │   │   ├── audit.py
│   │   │   ├── admin.py
│   │   │   └── comms.py
│   │   ├── services/         # Business logic
│   │   │   ├── eligibility_engine.py
│   │   │   ├── priority_scorer.py
│   │   │   ├── surety_analyzer.py
│   │   │   ├── bail_predictor.py
│   │   │   └── report_generator.py
│   │   ├── tasks/            # Celery async tasks
│   │   │   ├── daily_recheck.py
│   │   │   └── notification_tasks.py
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── rbac.py
│   ├── seed/                 # Seed data generator
│   │   └── generate_data.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/                 ← LAPTOP B owns this
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Priority Queue home
│   │   │   ├── cases/[id]/page.tsx   # Case detail + Reasoning Graph
│   │   │   ├── hearings/page.tsx
│   │   │   ├── surety/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── heatmap/page.tsx      # Prison Heatmap
│   │   │   ├── utrc/page.tsx
│   │   │   └── communicate/page.tsx  # WhatsApp + IVR sim
│   │   └── admin/
│   ├── components/
│   │   ├── countdown-clock/
│   │   ├── reasoning-graph/
│   │   ├── case-queue/
│   │   ├── priority-badge/
│   │   ├── adjournment-gauge/
│   │   ├── surety-chart/
│   │   ├── prison-heatmap/
│   │   ├── whatsapp-simulator/
│   │   ├── nalsa-report/
│   │   └── offline-indicator/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── offline-store.ts
│   │   └── sync-engine.ts
│   ├── public/sw.js
│   ├── package.json
│   └── vercel.json
│
├── ai/                       ← LAPTOP C owns this
│   ├── nlp/
│   │   ├── charge_extractor.py
│   │   ├── plain_language.py
│   │   ├── name_normalizer.py
│   │   ├── ocr_corrector.py
│   │   └── legal_glossary.json
│   ├── ml/
│   │   ├── adjournment_model.py
│   │   ├── bail_predictor_model.py
│   │   ├── train.py
│   │   └── models/              # Saved model files (.pkl)
│   ├── federated/
│   │   ├── fl_server.py
│   │   ├── fl_client.py
│   │   ├── dp_config.py
│   │   └── withdrawal.py
│   ├── voice/
│   │   ├── ivr_handler.py
│   │   ├── tts_engine.py
│   │   └── dialect_detector.py
│   ├── writ_generator/
│   │   └── petition_drafter.py
│   └── requirements.txt
│
├── docs/
│   ├── PRD.md
│   ├── TEAM_SPLIT.md
│   └── DEMO_SCRIPT.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## LAPTOP A — Backend Lead

### Owner: The Strongest Python/Backend Developer
### Branch: `dev/backend`

### What You Build

You are the **spine** of the product. Every API, database query, business logic rule, and data pipeline lives with you.

---

### Hour-by-Hour Timeline

#### Hours 0–2: Project Scaffold + Database
```
[ ] Create GitHub repo, set up monorepo structure
[ ] Initialize FastAPI project with project structure above
[ ] Set up Neon PostgreSQL (free) — create account at neon.tech
[ ] Write ALL database migrations (the full schema from PRD §6)
[ ] Create .env.example with all required env vars
[ ] Set up Supabase project for auth (free) — create at supabase.com
[ ] Write docker-compose.yml for local development
```

**Deliverable**: Other laptops can `git pull` and have a working backend skeleton.

#### Hours 2–6: Seed Data Generator + Core APIs
```
[ ] Build seed data generator (seed/generate_data.py):
    - 5,000 cases across 5 states (MH, UP, BR, TN, WB)
    - 200 courts with realistic adjournment rates (30%–90%)
    - 50 prisons with lat/lng coordinates
    - 500 districts with median income / MGNREGA rates
    - 3 months of hearing history
    - Charge sections mapped to real IPC provisions
    - Surety amounts (some affordable, some 10× income)
    - Family contacts with language preferences
[ ] Run seed → populate Neon database
[ ] Build CRUD APIs:
    - GET /api/v1/cases (list + filters + pg_trgm search)
    - GET /api/v1/cases/{id} (full detail)
    - GET /api/v1/cases/queue (priority-ranked)
    - GET /api/v1/hearings/upcoming
    - POST /api/v1/cases/{id}/action
```

**Deliverable**: Frontend can start fetching real data from APIs.

#### Hours 6–12: Eligibility Engine + Priority Scorer
```
[ ] Implement EligibilityEngine class (PRD §5.1.3):
    - S.479 BNSS logic (⅓ first offender, ½ regular)
    - Exclusions (death/life imprisonment)
    - Multiple pending cases check S.479(2)
    - IPC ↔ BNSS transitional mapping table
    - Accused delay exclusion
    - Confidence score computation
    - Full reasoning chain builder
    - Constitutional countdown calculator
[ ] Implement PriorityScorer class (PRD §5.2.1):
    - Composite score: E(0.30) + T(0.30) + A(0.20) + C(0.15) + Bonus(0.05)
    - Conflict resolution rules
[ ] Build eligible API endpoint:
    - GET /api/v1/cases/{id}/eligibility
    - GET /api/v1/cases/{id}/reasoning-graph (JSON for visual graph)
    - GET /api/v1/cases/{id}/countdown
[ ] Run eligibility engine on all 5,000 seed cases
```

**Deliverable**: Eligibility results available for all cases. Frontend can show reasoning graphs.

#### Hours 12–18: Surety + Analytics + UTRC APIs
```
[ ] Implement SuretyAnalyzer (PRD §5.7.1):
    - Gap detection query (bail >14 days, surety unexecuted)
    - Surety-to-income ratio calculation
    - S.440 candidate flagging
[ ] Build surety APIs:
    - GET /api/v1/surety/gap-report
    - GET /api/v1/surety/systemic-patterns
[ ] Implement analytics queries (PRD §5.4.1):
    - Charge-detention correlation
    - Court performance rankings
    - Prison eligible-but-unserved density (for heatmap)
    - District comparison stats
[ ] Build analytics APIs:
    - GET /api/v1/analytics/charge-detention
    - GET /api/v1/analytics/court-performance
    - GET /api/v1/analytics/prison-heatmap
    - GET /api/v1/analytics/district-comparison
[ ] Build UTRC dashboard API:
    - GET /api/v1/utrc/dashboard
[ ] NALSA report export (PDF via ReportLab / Excel via openpyxl):
    - GET /api/v1/utrc/nalsa-report?format=pdf
```

#### Hours 18–24: Audit Log + RBAC + Degradation
```
[ ] Implement immutable audit log:
    - Every eligibility check → audit_log insert
    - REVOKE UPDATE/DELETE on audit_log table
    - Supervisor reconstruction query API
    - GET /api/v1/admin/audit-log?case_id={id}
[ ] Implement RBAC middleware (PRD §5.5.3):
    - Role-based route guards (paralegal, lawyer, supervisor, UTRC, admin)
    - Bulk export requires justification (POST body with reason)
    - All bulk exports logged
[ ] Implement graceful degradation (PRD §5.5.2):
    - Health check endpoint for all data sources
    - Staleness tracker (marks data >48h old as STALE)
    - Fallback mode flag (rule-based only when ML drifts)
    - GET /api/v1/admin/system-health
[ ] DPDPA compliance:
    - PII anonymization trigger (30 days after case closure)
    - Right to erasure endpoint: POST /api/v1/admin/erasure-request
    - Data lifecycle status: GET /api/v1/admin/data-lifecycle
```

#### Hours 24–30: Celery Tasks + Communication APIs
```
[ ] Set up Celery with Upstash Redis as broker
[ ] Daily re-evaluation task (runs eligibility on all active cases)
[ ] 45-day notification escalation checker
[ ] Communication simulator APIs:
    - POST /api/v1/comms/chat-simulate (takes message + language, returns response)
    - POST /api/v1/comms/glossary-lookup (legal term → plain language)
[ ] Integrate with Laptop C's NLP modules:
    - POST /api/v1/nlp/extract-charges (calls charge_extractor)
    - POST /api/v1/nlp/translate (calls plain_language)
    - POST /api/v1/nlp/name-match (calls name_normalizer)
```

#### Hours 30–36: Integration + Bail Prediction
```
[ ] Integrate Laptop C's ML models:
    - Adjournment prediction endpoint wrapping their model
    - Bail success prediction endpoint
    - Surety reduction brief generator (using Gemini)
    - Writ petition draft generator
[ ] Wire up federated learning API stubs:
    - POST /api/v1/fl/register
    - GET /api/v1/fl/governance
    - POST /api/v1/fl/withdraw
[ ] Integration testing with frontend (Laptop B)
```

#### Hours 36–44: Deploy + Polish
```
[ ] Deploy to Render (free tier):
    - Create render.yaml
    - Set env vars
    - Connect to Neon PostgreSQL
    - Connect to Upstash Redis
[ ] API performance tuning (add DB indexes if slow)
[ ] Final integration test with deployed frontend
[ ] Fix any bugs from Laptop B/C integration
```

### APIs You Must Have Ready (Contract for Laptop B)

Laptop B will start building UI against these endpoints from **Hour 6**. Until your real APIs are ready, they'll use mock data, but the endpoint shapes must be agreed on:

```
PRIORITY (needed by Hour 6):
  GET /api/v1/cases/queue           → [{case_id, priority_score, one_line_reason, countdown, charges, confidence, flags}]
  GET /api/v1/cases/{id}            → {full case detail}
  GET /api/v1/cases/{id}/eligibility → {eligible, reasoning_chain, confidence, countdown}

NEEDED BY HOUR 12:
  GET /api/v1/cases/{id}/reasoning-graph → {nodes: [], edges: []} (for visual graph)
  GET /api/v1/hearings/upcoming          → [{hearing_id, case_id, date, adjournment_prob}]
  GET /api/v1/analytics/prison-heatmap   → [{prison_id, lat, lng, eligible_count, total}]

NEEDED BY HOUR 18:
  GET /api/v1/surety/gap-report          → [{case_id, surety_amount, income_ratio, action}]
  GET /api/v1/analytics/*                → chart data
  GET /api/v1/utrc/dashboard             → aggregated stats
  POST /api/v1/comms/chat-simulate       → {response_text, language, audio_url?}

NEEDED BY HOUR 24:
  GET /api/v1/admin/audit-log            → [{timestamp, case_id, assessment, reasoning, response}]
  GET /api/v1/admin/system-health        → [{source, status, last_updated, is_stale}]
  GET /api/v1/fl/governance              → {nodes: [], accuracy_data: {}}
```

---

## LAPTOP B — Frontend Lead

### Owner: The Strongest React/UI Developer
### Branch: `dev/frontend`

### What You Build

You are the **face** of the product. Everything the judges see and interact with comes from you. Your job is to make the demo **unforgettable**.

---

### Hour-by-Hour Timeline

#### Hours 0–3: Project Setup + Design System
```
[ ] Initialize Next.js 14 project:
    npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --no-src-dir
    (NOTE: We use Tailwind here because Next.js ships with it — easier than fighting it)
[ ] Install dependencies:
    npm install recharts leaflet react-leaflet @supabase/supabase-js
    npm install framer-motion lucide-react clsx
    npm install idb (for IndexedDB offline storage)
[ ] Set up design system (globals.css / tailwind.config.ts):
    - Dark theme: backgrounds (#0F172A, #1E293B), text (#F8FAFC, #94A3B8)
    - Primary blue (#3B82F6), purple (#8B5CF6), green (#10B981)
    - Warning amber (#F59E0B), danger red (#EF4444)
    - Font: Inter from Google Fonts + Noto Sans Devanagari
    - Border radius: 12px cards, 8px buttons
[ ] Create layout.tsx with:
    - Sidebar navigation (role-based — show different items per role)
    - Top bar with user info + offline indicator
    - Responsive: sidebar collapses on mobile
[ ] Create API client (lib/api-client.ts):
    - Fetch wrapper with auth token
    - Base URL from env var
    - Error handling with graceful messages
```

**Deliverable**: Other laptops can see the app skeleton running.

#### Hours 3–8: Priority Queue + Countdown Clock (Differentiator 1)
```
[ ] Build CountdownClock component:
    - Live ticking timer: "Eligible in 3d 14h 22m" (amber) or "OVERDUE by 47 days" (red pulsing)
    - Uses requestAnimationFrame or setInterval
    - Smooth flip animation on digit change
    - Color transitions: green (>30d) → amber (7-30d) → red (<7d) → pulsing red (overdue)
[ ] Build PriorityBadge component:
    - Score 90+ = red "CRITICAL", 70-89 = amber "HIGH", 50-69 = blue "MEDIUM", <50 = gray "LOW"
    - Subtle glow animation on critical cases
[ ] Build CaseQueue page (/ dashboard home):
    - Ranked list of cases from GET /api/v1/cases/queue
    - Each row: priority badge, case number, accused name (masked), 
      one-line reason, countdown clock, confidence %, next action button
    - Click row → expand inline OR navigate to case detail
    - Search bar with pg_trgm search
    - Filters: eligibility status, priority range, state, court
    - Loading skeleton while data fetches
    - Empty state when no cases
[ ] Use MOCK DATA until Laptop A's APIs are ready:
    - Create lib/mock-data.ts with 20 realistic cases
    - Same shape as real API response
    - Toggle: const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL
```

**This is the FIRST thing judges see. Make it stunning.**

#### Hours 8–14: Case Detail + Reasoning Graph (Differentiator 2)
```
[ ] Build CaseDetail page (/cases/[id]):
    - Header: case number, accused, prison, court, state
    - Countdown Clock (prominent, top-right)
    - Eligibility card: status badge, confidence bar, one-line reason
    - Charges list with IPC/BNSS section numbers
    - Hearing history timeline (vertical timeline component)
    - Assigned paralegal + lawyer info
    - Quick action buttons: "Acted On", "Override", "Flag for Lawyer", "Add Note"
    - Override modal: requires text justification (saved to audit log)
[ ] Build ReasoningGraph component (Differentiator 2):
    - Interactive flowchart showing eligibility computation:
      FIR Text → Charges Extracted → Max Sentence → Threshold → Detention → Result
    - Each node shows: value, confidence, data source
    - Click any node → see the raw data that fed into it
    - Use SVG + framer-motion for smooth animations
    - Color-coded: green nodes (favorable), red nodes (unfavorable), amber (uncertain)
[ ] Build BailSuccessCard component (Differentiator 3):
    - Donut chart: "73% historical bail grant rate at this court for this charge"
    - Bar chart: grant rates by judge at this court
    - Disclaimer: "Historical data — not a prediction of outcome"
[ ] Build HearingPrepBrief component:
    - Auto-generated brief displayed in a clean card
    - Language selector dropdown (shows brief in selected language)
    - Print / download button
```

#### Hours 14–20: Prison Heatmap + Analytics (Differentiator 5)
```
[ ] Build PrisonHeatmap page (/heatmap):
    - Full-screen Leaflet map with OpenStreetMap tiles (FREE, no API key)
    - Heatmap overlay: eligible-but-unserved undertrial density
    - Circle markers at each prison: size = eligible count, color = severity
    - Click marker → popup with prison name, eligible count, total count
    - Click "View Cases" in popup → filtered case list for that prison
    - State-level zoom: click a state → zoom in to see prisons
    - Legend: color scale explanation
[ ] Build Analytics page (/analytics):
    - Chart 1: Bar chart — charge sections vs avg detention days (Recharts)
    - Chart 2: Horizontal bar — worst courts by bail-decision delay
    - Chart 3: Scatter plot — surety amount vs district income
    - Chart 4: Line chart — system accuracy over time (feedback loop)
    - Chart 5: Pie chart — case distribution by eligibility status
    - All charts: dark theme, smooth animations, hover tooltips
[ ] Build DistrictComparison component:
    - Side-by-side cards comparing 2-3 districts
    - Key metrics: eligible %, avg detention, surety ratio, adjournment rate
```

#### Hours 20–26: UTRC Dashboard + Surety + Hearings
```
[ ] Build UTRC Dashboard page (/utrc):
    - Summary cards: total eligible, action needed, overdue, hearings today
    - Prison-level table: sortable by eligible count, state, capacity
    - Hearing calendar: weekly view with adjournment probability badges
    - Action-needed queue: subset of main queue, filtered for urgency
    - District comparison selector
    - NALSA Report Export button → calls API → downloads PDF/Excel
[ ] Build Surety Dashboard page (/surety):
    - Gap report table: unexecuted surety cases sorted by income ratio
    - Each row: case, surety amount, income ratio, days since bail, action
    - "Generate S.440 Brief" button → calls API → shows draft in modal
    - Surety pattern chart: choropleth map of surety affordability by district
[ ] Build Hearings page (/hearings):
    - Calendar view (weekly/monthly)
    - Each hearing card: case, court, time, adjournment probability gauge
    - AdjournmentGauge component: circular gauge 0-100% with color
    - Reprioritization alert: "⚠️ 82% likely adjourned — consider Case #456 instead"
```

#### Hours 26–32: WhatsApp Simulator + IVR Demo (Differentiator 4)
```
[ ] Build WhatsAppSimulator component (/communicate):
    - Phone-shaped container (320×568px) with WhatsApp-green header
    - Chat bubbles: user messages (right, green) + system responses (left, white)
    - Input field at bottom: type message or click mic icon
    - Auto-responses powered by POST /api/v1/comms/chat-simulate
    - Demo flow:
      1. User types case number → system responds with status in Hindi
      2. User types "what does remand mean?" → plain language explanation
      3. User clicks language selector → switch to Tamil/Bengali/etc.
    - Show language auto-detection badge
    - "This is a simulation" watermark (transparency for judges)
[ ] Build IVR Simulator:
    - Phone UI with keypad
    - "Call" button → Web Speech API speaks greeting
    - Keypad presses trigger IVR menu options
    - Case status read aloud via browser Speech Synthesis
    - "What does that mean?" option re-explains in simpler terms
[ ] Build NotificationLog page (within /communicate):
    - Table: all family notifications sent, channel, language, status, timestamp
    - 45-day escalation alerts highlighted in red
```

#### Hours 32–38: Admin Panel + Offline PWA
```
[ ] Build Audit Log page (/admin/audit):
    - Searchable by case ID, date range, paralegal
    - Each entry: timestamp, case, assessment type, reasoning, confidence, paralegal action
    - "Reconstruct" button: shows full chain for a specific case
    - Export to CSV
[ ] Build Data Lifecycle page (/admin/data-lifecycle):
    - Interactive Mermaid diagram: Active → Anonymized → Deleted
    - Stats: cases in each stage, next scheduled deletion batch
    - DPDPA compliance checklist (all green checkmarks)
[ ] Build Federation Dashboard (/admin/federation):
    - India map with DLSA node markers (green = online, gray = offline)
    - Table: DLSA, last contribution, data quality score, accuracy impact
    - Withdrawal log
[ ] Build System Health page (/admin/health):
    - Status cards for each data source (eCourts, NJDG, etc.)
    - Green/amber/red indicators
    - Shows degradation mode when sources are stale
[ ] Implement Offline PWA:
    - Service worker (sw.js): cache API responses for offline queue view
    - IndexedDB store: save case queue + case details locally
    - Offline indicator component (yellow bar at top)
    - Sync engine: when back online, push queued actions to API
    - manifest.json for installable PWA
```

#### Hours 38–44: Polish + Responsive + Demo Prep
```
[ ] Responsive design pass: all pages work on mobile (paralegal uses phone in prison)
[ ] Loading states: skeleton loaders on all data-dependent components
[ ] Error states: friendly error messages, not blank screens
[ ] Micro-animations: 
    - Page transitions (framer-motion)
    - Card hover effects (subtle scale + shadow)
    - Countdown digit flip animation
    - Priority badge pulse on critical cases
[ ] Dark mode consistency check: no white flashes, all components themed
[ ] Multilingual UI labels: at minimum English + Hindi toggle
[ ] Demo data validation: all screens look great with seed data
[ ] Create demo user accounts: paralegal, lawyer, UTRC coordinator, admin
```

---

## LAPTOP C — AI/NLP + Infra Lead

### Owner: The Person Most Comfortable with AI/ML + DevOps
### Branch: `dev/ai-infra`

### What You Build

You are the **intelligence** and **infrastructure**. Every ML model, every NLP pipeline, every Gemini API call, and the final deployment lives with you.

---

### Hour-by-Hour Timeline

#### Hours 0–4: Gemini API Setup + Charge Extractor
```
[ ] Get Gemini API key (free): https://aistudio.google.com/apikey
[ ] Set up ai/ directory with requirements.txt:
    google-generativeai, scikit-learn, xgboost, pandas, numpy,
    python-Levenshtein, indic-transliteration, easyocr, pdfplumber
[ ] Build charge_extractor.py (PRD §5.6.1):
    - Regex patterns for IPC/BNSS section numbers in 10 languages
    - Gemini API call for narrative-embedded charge extraction
    - OCR error correction (common Devanagari mistakes: ध→घ, ब→व, etc.)
    - IPC → BNSS transitional mapping table (JSON file)
    - Mixed-script detection
    - Confidence scoring per extracted charge
    - OUTPUT: List[{section, act, confidence, source_text}]
[ ] Test with 20 sample FIR texts (create test fixtures in Hindi, English, Tamil)
[ ] Create API endpoint function that Laptop A can import:
    def extract_charges(fir_text: str, language: str) -> List[ChargeSection]
```

#### Hours 4–8: Plain Language Generator + Name Normalizer
```
[ ] Build plain_language.py (PRD §5.6.2):
    - Gemini prompt template for case status in simple language
    - Legal term glossary (legal_glossary.json) with:
      - 'remand', 'bail', 'charge_sheet', 'surety', 'next_hearing',
        'adjournment', 'FIR', 'undertrial', 'prosecution'
      - Each term in 10+ languages with SIMPLE explanations (not word-for-word)
      - Dialect variants for Bhojpuri, Rajasthani, Marwari where different
    - Post-processing: replace jargon in Gemini output with glossary terms
    - Human review flag for unverified language templates
    - OUTPUT: {text, language, needs_review, audio_text}
[ ] Build name_normalizer.py (PRD §5.6.3):
    - Transliteration to common script (IAST/Latin)
    - IndicSoundex for phonetic matching
    - Levenshtein edit distance
    - Combined score: 0.6×phonetic + 0.4×edit
    - Decision: >0.95 AUTO_MATCH, 0.70-0.95 HUMAN_REVIEW, <0.70 NO_MATCH
    - NEVER auto-merge — conservative policy
    - OUTPUT: {action, confidence, normalized_a, normalized_b}
[ ] Create legal_glossary.json with all terms in all 10 languages
```

#### Hours 8–14: ML Models — Adjournment + Bail Predictor
```
[ ] Build adjournment_model.py (PRD §5.8.1):
    - Features: court_adj_rate, consecutive_adjournments, day_of_week,
      days_to_vacation, charge_sheet_filed, case_age, court_load
    - Model: XGBoost classifier
    - Train on synthetic hearing data (coordinate with Laptop A's seed generator)
    - Bootstrap confidence intervals (50 samples)
    - SHAP explanation for top factors
    - Save model as .pkl file
    - OUTPUT: {probability, ci_low, ci_high, key_factors, uncertainty_level}
[ ] Build bail_predictor_model.py (Differentiator 3):
    - Features: court_id, judge, charge_section, case_age, prior_adjournments
    - Model: XGBoost/LogisticRegression on historical bail outcomes
    - Train on synthetic data with realistic patterns
    - OUTPUT: {grant_probability, court_avg, judge_avg, similar_cases_count}
[ ] Build train.py:
    - Single script that trains both models on seed data
    - Saves to ai/ml/models/*.pkl
    - Prints accuracy metrics
[ ] Test both models, ensure reasonable performance
```

#### Hours 14–20: Writ Petition Drafter + Surety Brief Generator
```
[ ] Build petition_drafter.py (Differentiator 6):
    - Gemini prompt for S.479 BNSS bail application draft
    - Includes: case details, computation showing threshold exceeded,
      charge sections, detention duration, legal basis, precedent citations
    - Output marked as "DRAFT — REQUIRES LAWYER REVIEW"
    - OUTPUT: {petition_text, status: "DRAFT", legal_basis, warnings}
[ ] Build surety_reduction_brief.py:
    - Gemini prompt for S.440 CrPC / S.483 BNSS surety reduction
    - Includes: surety amount, district income, ratio, hardship argument
    - OUTPUT: {brief_text, status: "DRAFT_FOR_LAWYER_REVIEW", supporting_data}
[ ] Build chat_simulator_backend.py:
    - Takes user message + language
    - Detects intent: case_query, glossary_lookup, confused, distressed
    - Routes to appropriate handler
    - Returns response in requested language via Gemini
    - Never gives legal advice (system prompt constraint)
    - For "what does X mean?" → glossary lookup
    - For distressed detection → suggest DLSA helpline
    - OUTPUT: {response_text, language, intent_detected, offer_helpline}
```

#### Hours 20–28: Federated Learning Demo
```
[ ] Build fl_server.py (PRD §5.9.1):
    - Flower server with FedAvg strategy
    - Accepts connections from DLSA client nodes
    - Aggregates model weights
    - Tracks contributions per DLSA
    - Logs governance data (participating nodes, quality, accuracy)
[ ] Build fl_client.py:
    - Flower client that trains on local data
    - Applies Opacus differential privacy (ε=1.0, δ=1e-5) to weights before sharing
    - Reports data quality metrics
[ ] Build dp_config.py:
    - Opacus configuration for differential privacy
    - Privacy budget tracking
[ ] Build withdrawal.py (PRD §5.9.4):
    - Remove DLSA's weights from global model
    - Generate cryptographic proof of removal (SHA-256 hash)
    - Log withdrawal immutably
[ ] Create simulation script:
    - Spins up FL server + 2 simulated DLSA clients
    - Runs 3 federated rounds
    - Shows accuracy improvement after federation
    - Generates governance dashboard data
    - This runs during demo to show FL in action
```

#### Hours 28–34: Voice / IVR Backend + Dialect Detection
```
[ ] Build tts_engine.py:
    - Bhashini API integration for Text-to-Speech
    - Fallback: Google TTS (gTTS library — free)
    - Support for Hindi, Tamil, Bengali, Marathi, Telugu
    - Dialect detection: phone number prefix → probable region → dialect
[ ] Build dialect_detector.py:
    - UP numbers (prefix 91-522, 91-532, etc.) → Bhojpuri/Awadhi
    - Rajasthan numbers → Rajasthani/Marwari
    - Standard Hindi for others
    - Returns dialect + recommended glossary variant
[ ] Build ivr_handler.py:
    - IVR menu tree logic (not actual Twilio — logic only)
    - State machine: greeting → language_select → case_input → status → repeat/explain/helpline
    - Integrates with plain_language.py for status generation
    - "What does that mean?" handler: re-explain last legal term
    - Distress detection: if user asks same question 3+ times → offer helpline
[ ] Test entire NLP pipeline end-to-end:
    - FIR text → charge extraction → eligibility → plain language → voice output
```

#### Hours 34–40: Deployment + Integration
```
[ ] Write backend Dockerfile:
    FROM python:3.11-slim
    - Install system deps (tesseract-ocr, etc.)
    - Copy backend/ + ai/ directories
    - pip install requirements
    - CMD uvicorn app.main:app
[ ] Write render.yaml for Render deployment:
    - Web service: backend
    - Environment variables
    - Build command, start command
[ ] Write vercel.json for frontend:
    - Rewrites for API proxy
    - Build settings
[ ] Deploy backend to Render (free tier):
    - Connect GitHub repo
    - Set env vars (DATABASE_URL, REDIS_URL, GEMINI_API_KEY, SUPABASE_*)
    - Verify /docs endpoint works
[ ] Deploy frontend to Vercel (free):
    - Connect GitHub repo
    - Set NEXT_PUBLIC_API_URL to Render URL
    - Verify pages load
[ ] Integration testing:
    - Frontend → Backend → NLP → Gemini → Response
    - Test every API endpoint
    - Fix CORS issues
    - Fix any cold-start timeout issues on Render
```

#### Hours 40–44: Polish + Demo Prep
```
[ ] Optimize Gemini API calls (batch where possible, cache responses)
[ ] Ensure all ML models are loaded at startup (not per-request)
[ ] Create ICJS integration architecture diagram (Mermaid in docs/):
    - Shows how JusticeGrid would connect to:
      CCTNS (Crime) ↔ eCourts ↔ e-Prisons ↔ Forensic ↔ Prosecution
    - This is Differentiator 7 — just the architecture, not implementation
[ ] Write setup.sh script (one-command DLSA setup for demo):
    - Docker pull + config + register
[ ] Run FL simulation → capture screenshots for demo
[ ] Help Laptop A with final deployment issues
[ ] Help Laptop B with any API integration bugs
```

---

## Merge & Communication Protocol

### Real-Time Communication
```
Use WhatsApp/Discord group for:
- "API /cases/queue is LIVE — you can switch off mock data"
- "I pushed charge_extractor.py — pull from dev/ai-infra"
- "Need the prison lat/lng data in seed generator"
- "Heatmap is crashing — is the API returning the right shape?"
```

### Merge Schedule

| Time | Action | Who |
|---|---|---|
| Hour 0 | Laptop A creates repo, all clone | A |
| Hour 2 | A pushes schema + stubs, B&C pull | A |
| Hour 6 | B pushes frontend skeleton, A pushes first APIs | A, B |
| Hour 8 | **MERGE CHECKPOINT 1**: A's APIs + B's skeleton + C's NLP | ALL |
| Hour 14 | C pushes ML models, A integrates | A, C |
| Hour 20 | **MERGE CHECKPOINT 2**: Core features end-to-end | ALL |
| Hour 28 | B pushes all differentiator UIs | B |
| Hour 36 | **MERGE CHECKPOINT 3**: Full feature merge | ALL |
| Hour 40 | C deploys everything | C |
| Hour 44 | **FINAL MERGE**: Polish + deployed | ALL |
| Hour 45-48 | Demo rehearsal — all hands | ALL |

### Integration Contracts (API Shapes)

Laptop B will build against these mock shapes from Hour 0. Laptop A replaces mocks with real APIs progressively:

```typescript
// lib/mock-data.ts — Laptop B creates this on Hour 0

export const mockCaseQueue = [
  {
    case_id: "MH-2024-CR-45678",
    case_number: "MH-2024-CR-45678",
    accused_name: "R████ K████",  // Masked for privacy
    priority_score: 92.4,
    one_line_reason: "Eligible under S.479 — first offender, hearing in 3 days",
    charges: [{ section: "379", act: "IPC", description: "Theft" }],
    next_action: "File bail application before hearing",
    confidence: 0.87,
    bail_success_probability: 0.73,
    countdown: { days: -47, display: "OVERDUE by 47 days", type: "overdue" },
    flags: ["TIME_SENSITIVE", "OVERDUE"],
    state: "Maharashtra",
    court: "Sessions Court, Pune",
    prison: "Yerwada Central Prison",
    eligibility_status: "ELIGIBLE"
  },
  // ... more mock cases
];

export const mockReasoningGraph = {
  nodes: [
    { id: "fir", label: "FIR Text", value: "Hindi FIR uploaded", confidence: 1.0, type: "input" },
    { id: "charges", label: "Charges Extracted", value: "S.379 IPC — Theft", confidence: 0.92, type: "process" },
    { id: "sentence", label: "Max Sentence", value: "3 years", confidence: 0.95, type: "data" },
    { id: "offender", label: "First Offender", value: "Yes", confidence: 0.88, type: "data" },
    { id: "threshold", label: "Threshold (⅓)", value: "365 days", confidence: 0.95, type: "compute" },
    { id: "detention", label: "Detained", value: "412 days", confidence: 1.0, type: "data" },
    { id: "result", label: "ELIGIBLE ✅", value: "Exceeded by 47 days", confidence: 0.87, type: "result" }
  ],
  edges: [
    { from: "fir", to: "charges" },
    { from: "charges", to: "sentence" },
    { from: "sentence", to: "threshold" },
    { from: "offender", to: "threshold" },
    { from: "threshold", to: "result" },
    { from: "detention", to: "result" }
  ]
};
```

---

## Accounts to Create (Do this FIRST — Hour 0)

| Service | URL | Who Creates | Free Tier |
|---|---|---|---|
| **GitHub** | github.com | Laptop A | ✅ Unlimited public repos |
| **Neon PostgreSQL** | neon.tech | Laptop A | ✅ 0.5 GB |
| **Supabase** | supabase.com | Laptop A | ✅ 50K MAUs |
| **Upstash Redis** | upstash.com | Laptop A | ✅ 256 MB |
| **Gemini API** | aistudio.google.com/apikey | Laptop C | ✅ 60 RPM |
| **Render** | render.com | Laptop C | ✅ 750 hrs/mo |
| **Vercel** | vercel.com | Laptop B | ✅ Hobby tier |
| **Sentry** | sentry.io | Laptop C | ✅ 5K errors/mo |

**Share all credentials via a private Discord channel or .env file (NEVER commit to git).**

---

## Emergency Protocols

### "Backend API isn't ready but Frontend needs data"
→ Laptop B continues with mock data. All components are built mock-first. Switch to real API is a one-line env var change.

### "ML model isn't training well"
→ Use rules-based fallback. Adjournment rate = court's historical average. Bail prediction = court's overall grant rate. No ML needed.

### "Gemini API rate limited"
→ Cache ALL Gemini responses in Redis. Same FIR text → same charges, don't re-call. Most demo interactions are repeatable.

### "Render cold start too slow for demo"
→ Keep the backend warm: set up a cron job (ping every 14 min) on a free cron service (cron-job.org).

### "Git merge conflicts"
→ Each laptop owns their folder. Conflicts should be RARE. If they happen, the backend owner (Laptop A) resolves.

### "Feature X won't be done in time"
→ Priority order: Queue + Countdown + Reasoning Graph > Heatmap > Analytics > WhatsApp Sim > FL Demo > Admin Panel. Cut from the bottom.
