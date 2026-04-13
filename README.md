<div align="center">
  <img src="https://skill-issue-airavat-3-0.vercel.app/og.png" alt="JusticeGrid Logo" width="300" />
  <h1>⚖️ JusticeGrid: AI Legal Intelligence & Priority Queue</h1>
  <p><strong>A force-multiplier for India's Undertrial Prisoner Crisis</strong></p>
  <p>
    <a href="https://skill-issue-airavat-3-0.vercel.app/">Live Platform</a> • 
    <a href="#features">Features</a> • 
    <a href="#tech-stack">Tech Stack</a> • 
    <a href="#installation">Installation</a> • 
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🛑 The Problem: The Undertrial Crisis
India's prisons are overcrowded at alarming rates, with over **75% of inmates being undertrials**—individuals awaiting trial who have not been convicted of any crime. According to Section 479 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), an undertrial is legally entitled to default bail if they have served half (or one-third, for first-time offenders) of the maximum possible sentence for their accused crime. 

However, systemic delays, lack of human paralegal resources, complex charge parsing, and poor connectivity between prisons and courts mean that thousands languish in jail illegally.

## ⚡ Our Solution: JusticeGrid
**JusticeGrid** is a complete, full-stack predictive AI dashboard and CRM designed for District Legal Services Authorities (DLSA), Paralegals, and Under-Trial Review Committees (UTRC). 

By ingesting raw data (FIR texts, Court Hearing histories), JusticeGrid automatically parses complex legal vernacular, maps them against the Indian Penal Code (IPC) or BNSS limits, and instantly scores the prisoner's bail eligibility.

###  Key Capabilities & 10 Pillars:
* **Constitutional Countdown Engine:** Automatically calculates exact `S.479` BNSS limits from the dynamically extracted maximum years for charges and predicts the exact countdown day when default bail triggers.
* **Explainable AI Pipeline:** A priority scoring gradient engine evaluating `detention ratio`, `adjournment risks`, and `surety execution gaps`.
* **Multilingual FIR Parsing:** Translates vernacular FIRs into actionable datasets, correcting OCR and generating structured charges arrays.
* **One-Click Drafting:** Auto-generates S.479 Bail Petitions containing specific legal ratios, math, and case records ready to be filed in High Court.
* **Surety Gap Analytics:** Analyzes court behaviors and flag financial inequities, visually graphing District wage medians vs imposed Bail surety amounts.
* **Voice-First Paralegal Assist:** Generates real-time audio clips detailing hearing predictions to aid families of prisoners with zero-literacy.

---

## 💻 Tech Stack
This project is built using a modern, scalable, and completely **free-tier compatible** stack:

#### Frontend
* **Framework:** Next.js (React) + TypeScript
* **Styling:** Tailwind CSS (Dark Mode/Glassmorphism - Editorial Brutalism)
* **Visualizations:** Recharts (Analytics), Leaflet (Mapping)

#### Backend & Data
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL (Hosted on Neon)
* **ORM:** SQLAlchemy + Pydantic

#### Machine Learning & AI
* **LLM Engine:** Gemini 2.0 Flash (Text parsing, FIR extraction)
* **Predictive ML:** Scikit-Learn Gradient Boosting (Adjournment predictions)
* **Infrastructure:** Render (Backend Host), Vercel (Frontend Host)

---

## 🛠️ Architecture Deep-Dive
The architecture separates duties effectively across microservices, ensuring speed and deterministic responses without LLM hallucination risks.

1. **Ingestion Layer:** Raw case data (or manually entered cases via the SaaS pipeline) map to `Backend/app/models/schemas.py`.
2. **AI Processing (`ai/` directory):** 
   - `eligibility_engine.py` validates First Offender thresholds and executes legal math.
   - `charge_extractor.py` wraps Gemini for OCR mapping.
   - `priority_scorer.py` weighs case severity across the district queue to assign a global Priority Score (0-100).
3. **Database Layer:** SQLAlchemy transactions synchronize the resulting schema with Postgres.
4. **Presentation Layer:** Next.js uses client-side fetchers, Skeleton hydration, and a highly accessible UI for the paralegals to take "Quick Actions".

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TanmayMahajan26/Skill-Issue-Airavat-3.0.git
cd Skill-Issue-Airavat-3.0
```

### 2. Backend Setup (FastAPI)
The backend is located in the `justicegrid/backend` directory.

```bash
cd justicegrid/backend
# Create a virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows users

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI Developer Server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. Full OpenAPI interactive documentation is available at `http://localhost:8000/docs`.

#### Environment Setup (`/justicegrid/backend/.env`)
Ensure you map the database to Neon or a local SQLite:
```env
# Example .env
DATABASE_URL=sqlite:///./justicegrid_dev.db
# DATABASE_URL=postgresql://neondb_owner:***@ep-***.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Frontend Setup (Next.js)
The frontend is located in the `justicegrid/frontend` directory.

```bash
cd ../frontend

# Install node dependencies
npm install

# Start the Next.js development server
npm run dev
```
The UI dashboard will be accessible at `http://localhost:3000`.

#### Environment Setup (`/justicegrid/frontend/.env.local`)
```env
# Point to your local FastAPI server
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

<div align="center">
  <p><i>Developed for Legal Tech Hackathons</i></p>
</div>
