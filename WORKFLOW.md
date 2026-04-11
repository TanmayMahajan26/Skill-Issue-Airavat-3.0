# JusticeGrid — Master Workflow & Git Sequence

## READ THIS FIRST — Everyone

This document tells you **exactly who does what, in what order, and when to push/pull**.
Each person also has their own detailed file:
- Laptop A → `LAPTOP_A_BACKEND.md`
- Laptop B → `LAPTOP_B_FRONTEND.md`
- Laptop C → `LAPTOP_C_AI_INFRA.md`

---

## Golden Rules

1. **Everyone works in the SAME repo** — monorepo, NOT separate repos
2. **Everyone works on the `main` branch** — no feature branches needed (each person owns separate folders, so no conflicts)
3. **NEVER edit another person's folder** without telling them first
4. **Commit and push often** — at least every 1-2 hours
5. **Pull before you push** — always `git pull` then `git push`

---

## Folder Ownership (This is why there are NO merge conflicts)

```
justicegrid/
├── backend/        ← ONLY Laptop A touches this
├── frontend/       ← ONLY Laptop B touches this
├── ai/             ← ONLY Laptop C touches this
├── docs/           ← Anyone can add, but don't edit others' files
├── .env.example    ← Laptop A creates, everyone reads
├── .gitignore      ← Laptop A creates
├── README.md       ← Laptop A creates, Laptop C updates at end
└── docker-compose.yml  ← Laptop A creates
```

**Because each person owns a separate folder, git merge conflicts are nearly impossible.**

---

## PHASE 0 — Setup (First 30 minutes)

### Step 1: Laptop A creates the repo (Minute 0-5)

```bash
# Laptop A does this FIRST. No one else touches anything yet.

mkdir justicegrid
cd justicegrid
git init

# Create folder structure
mkdir -p backend/app/routers
mkdir -p backend/app/services
mkdir -p backend/app/models
mkdir -p backend/app/tasks
mkdir -p backend/app/middleware
mkdir -p backend/seed
mkdir -p frontend
mkdir -p ai/nlp
mkdir -p ai/ml/models
mkdir -p ai/federated
mkdir -p ai/voice
mkdir -p ai/writ_generator
mkdir -p docs
```

Then create these starter files:

**.gitignore**
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
```

**.env.example**
```
# Database (Neon PostgreSQL - Laptop A creates this)
DATABASE_URL=postgresql://user:pass@host/dbname

# Redis (Upstash - Laptop A creates this)
REDIS_URL=redis://default:pass@host:port

# Auth (Supabase - Laptop A creates this)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# AI (Gemini - Laptop C creates this)
GEMINI_API_KEY=AIza...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**README.md**
```markdown
# JusticeGrid
AI-Augmented Legal Intelligence for India's Undertrial Crisis

## Setup
1. Clone: `git clone <repo-url>`
2. Copy `.env.example` to `.env` and fill in values
3. Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
4. Frontend: `cd frontend && npm install && npm run dev`
5. AI: `cd ai && pip install -r requirements.txt`
```

```bash
# Laptop A commits and pushes
git add .
git commit -m "Initial project structure"
git remote add origin https://github.com/YOUR_USERNAME/justicegrid.git
git push -u origin main
```

### Step 2: Laptop A shares repo URL (Minute 5)

**Send this to Laptops B and C on WhatsApp/Discord:**
> Repo is ready. Clone it:
> `git clone https://github.com/YOUR_USERNAME/justicegrid.git`
> I'll share .env values in a separate message — DO NOT commit .env

### Step 3: Laptops B and C clone (Minute 5-10)

```bash
# BOTH Laptop B and Laptop C do this:
git clone https://github.com/YOUR_USERNAME/justicegrid.git
cd justicegrid
```

### Step 4: Everyone creates their .env (Minute 10)

Laptop A shares the ACTUAL credentials (Neon DB URL, Supabase keys, etc.) via private message.
Everyone creates their own `.env` file locally (it's gitignored).

---

## PHASE 1 — Foundation (Hours 0-6) — Everyone works in parallel

### What happens in parallel:

```
LAPTOP A (Hours 0-6):
├── Creates Neon PostgreSQL database
├── Creates Supabase project for auth
├── Creates Upstash Redis instance
├── Writes database schema (all tables)
├── Builds seed data generator
├── Runs seed data (populates DB)
├── Builds first API endpoints (cases CRUD)
├── Pushes every ~1 hour
│
│   SIMULTANEOUSLY:
│
LAPTOP B (Hours 0-6):
├── Initializes Next.js project inside frontend/
├── Sets up design system (colors, fonts, theme)
├── Creates layout (sidebar, navbar)
├── Creates mock data file (agreed API shapes)
├── Builds Priority Queue page with mock data
├── Builds Countdown Clock component
├── Pushes every ~1 hour
│
│   SIMULTANEOUSLY:
│
LAPTOP C (Hours 0-6):
├── Gets Gemini API key
├── Sets up ai/ Python project
├── Builds charge extractor (regex + Gemini)
├── Builds legal glossary JSON
├── Tests with sample FIR texts
├── Pushes every ~1 hour
```

### Push/Pull Sequence During Phase 1:

```
Hour 0:  A pushes initial structure ──────→ B & C pull
Hour 1:  A pushes schema + .env.example ──→ B & C pull (get DB schema to understand data)
Hour 2:  B pushes Next.js skeleton ────────→ A & C can see frontend structure
         C pushes charge extractor v1 ─────→ A can see NLP module structure
Hour 3:  A pushes seed data generator ─────→ C pulls (needs seed data shapes for ML later)
Hour 4:  A pushes first APIs (cases CRUD) ─→ B can start switching from mock to real API
Hour 5:  B pushes Queue + Countdown UI ────→ A & C can see the frontend taking shape
Hour 6:  ALL pull, verify nothing is broken
```

**CHECKPOINT 1 (Hour 6):** Everyone pulls. The app should have:
- ✅ Database with 5000 seeded cases
- ✅ Basic case list API working
- ✅ Frontend skeleton with Queue page (still on mock data, but real API available)
- ✅ Charge extractor module ready to integrate

---

## PHASE 2 — Core Intelligence (Hours 6-16)

```
LAPTOP A (Hours 6-16):
├── Builds eligibility engine (S.479 BNSS logic)
├── Builds priority scorer
├── Builds eligibility API + reasoning graph API
├── Runs eligibility on all 5000 cases
├── MESSAGE TO B: "Eligibility API live — GET /api/v1/cases/{id}/eligibility"
│
LAPTOP B (Hours 6-16):
├── Switches Queue page from mock data → real API (when A says it's ready)
├── Builds Case Detail page
├── Builds Legal Reasoning Graph component
├── Builds Bail Success Card
├── Builds Hearing Prep Brief view
│
LAPTOP C (Hours 6-16):
├── Builds plain language generator
├── Builds name normalizer
├── Trains adjournment prediction model (XGBoost)
├── Trains bail success predictor model
├── Saves models as .pkl files
├── MESSAGE TO A: "ML models ready at ai/ml/models/ — here's how to load them"
```

### Critical Handoff (Hour ~12):

**Laptop C → Laptop A:** "Models are trained. Here's how to integrate:"
```python
# In backend/app/services/adjournment_service.py, load like this:
import joblib
model = joblib.load("ai/ml/models/adjournment_model.pkl")
prediction = model.predict_proba(features)[0][1]
```

**Laptop A → Laptop B:** "Eligibility API is live. Switch your mock data:"
```
Change in frontend: const USE_MOCK = false
Set NEXT_PUBLIC_API_URL=http://localhost:8000
```

**CHECKPOINT 2 (Hour 16):** Everyone pulls. The app should have:
- ✅ Eligibility engine computing results for all cases
- ✅ Priority queue showing real ranked cases
- ✅ Case detail with Reasoning Graph working
- ✅ NLP modules ready for integration
- ✅ ML models trained and saved

---

## PHASE 3 — Features (Hours 16-30)

```
LAPTOP A (Hours 16-30):
├── Integrates C's ML models into API endpoints
├── Builds surety gap analysis APIs
├── Builds analytics APIs (all 4 queries)
├── Builds UTRC dashboard API
├── Builds audit log + RBAC middleware
├── Builds communication simulator API (calls C's NLP modules)
├── Builds NALSA report export (PDF)
│
LAPTOP B (Hours 16-30):
├── Builds Prison Heatmap page (Leaflet + OpenStreetMap)
├── Builds Analytics page (5 charts with Recharts)
├── Builds UTRC Dashboard page
├── Builds Surety Dashboard page
├── Builds Hearings page with adjournment gauges
├── Builds WhatsApp Chat Simulator component
├── Builds IVR Simulator component
│
LAPTOP C (Hours 16-30):
├── Builds writ petition drafter (Gemini)
├── Builds surety reduction brief generator
├── Builds chat simulator backend logic
├── Builds federated learning demo (Flower server + 2 clients)
├── Builds dialect detection
├── Builds IVR handler logic
```

### Critical Handoffs:

**Hour ~20 — Laptop C → Laptop A:**
"Chat simulator backend is ready. Import it like this:"
```python
from ai.voice.chat_simulator_backend import process_chat_message
# Returns: {response_text, language, intent, offer_helpline}
```

**Hour ~22 — Laptop A → Laptop B:**
"Surety and analytics APIs are live. These endpoints work now:"
```
GET /api/v1/surety/gap-report
GET /api/v1/analytics/prison-heatmap
GET /api/v1/analytics/charge-detention
POST /api/v1/comms/chat-simulate
```

**Hour ~26 — Laptop C → Laptop A:**
"FL demo script ready. Here's the governance API data shape:"
```python
# The FL simulation generates this data, save to DB:
fl_data = {
    "nodes": [{"dlsa": "Pune", "status": "active", "contributions": 12, "accuracy_boost": "+2.3%"}],
    "rounds": 3,
    "global_accuracy": 0.78
}
```

**CHECKPOINT 3 (Hour 30):** Everyone pulls. The app should have:
- ✅ All 10 pillars functional
- ✅ All 7 differentiators visible
- ✅ Heatmap, analytics, surety, UTRC dashboards working
- ✅ WhatsApp simulator responding to messages
- ✅ Federated learning demo ready

---

## PHASE 4 — Integration + Deploy (Hours 30-40)

```
LAPTOP A (Hours 30-40):
├── Final API bug fixes
├── Performance tuning (add DB indexes)
├── Verify all API endpoints work end-to-end
├── Help C with deployment issues
│
LAPTOP B (Hours 30-40):
├── Admin pages: audit log, data lifecycle, federation dashboard, system health
├── Offline PWA mode (service worker + IndexedDB)
├── Responsive design pass (mobile)
├── Micro-animations and polish
├── Loading/error states on all pages
│
LAPTOP C (Hours 30-40):
├── Deploy backend to Render (free)
├── Deploy frontend to Vercel (free)
├── Fix any deployment-specific issues
├── CORS configuration
├── Warm-up script for Render cold starts
├── Integration testing on deployed URLs
```

### Deployment Sequence (Laptop C leads):

```
Step 1: C pushes Dockerfile for backend          → Render auto-deploys
Step 2: C sets env vars on Render dashboard       → Backend goes live
Step 3: C verifies backend: https://justicegrid-api.onrender.com/docs
Step 4: C sets NEXT_PUBLIC_API_URL on Vercel      → Frontend deploys
Step 5: C verifies frontend: https://justicegrid.vercel.app
Step 6: C sends deployed URLs to A & B            → Everyone tests
```

---

## PHASE 5 — Polish + Demo Prep (Hours 40-48)

```
ALL THREE LAPTOPS — Final Polish:
├── A: Fix any data/API issues found during testing
├── B: Final UI tweaks, ensure demo flow is smooth
├── C: Ensure deployment is stable, ML models responding
│
Hour 44-46: DEMO REHEARSAL (all three together)
├── Run through the 10-minute demo script
├── Time each section
├── Identify any crashes or slow loads
├── Prepare fallback plans (screenshots if live demo fails)
│
Hour 46-48: BUFFER for fixes + final commit
```

---

## Communication Templates

### When You Push:
```
Message to group: "PUSHED — [what you pushed]. Pull when ready."
Example: "PUSHED — eligibility engine + reasoning graph API. B can switch off mock data for case detail page."
```

### When You Need Something:
```
Message to group: "NEED FROM [A/B/C] — [what you need]"
Example: "NEED FROM A — prison heatmap API response shape. What does GET /analytics/prison-heatmap return?"
```

### When Something Breaks:
```
Message to group: "BROKEN — [what broke] — [who might know why]"
Example: "BROKEN — frontend can't reach API after pulling. A, did you change the port?"
```

---

## Quick Reference: Who Owns What

| I need to... | Ask... |
|---|---|
| Change a database table | Laptop A |
| Change an API endpoint shape | Laptop A |
| Change the UI layout or a component | Laptop B |
| Change how NLP/ML works | Laptop C |
| Fix deployment issues | Laptop C |
| Add new seed data | Laptop A |
| Change the design system (colors, fonts) | Laptop B |
| Change Gemini prompts | Laptop C |
