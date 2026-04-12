"""
JusticeGrid API — main FastAPI application.
AI-Augmented Legal Intelligence for India's Undertrial Crisis.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import cases, eligibility, hearings, surety, analytics, utrc, audit, comms, nlp, fl, auth, alerts, drafts, bail_conditions

# Create all tables on startup
Base.metadata.create_all(bind=engine)

from contextlib import asynccontextmanager

# ── Startup/Shutdown Lifespan ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start ngrok tunnel in development for Bolna Webhooks
    import os
    if os.getenv("ENVIRONMENT", "development") == "development":
        try:
            from pyngrok import ngrok
            # Open a ngrok tunnel to the dev server
            public_url = ngrok.connect(8001).public_url
            print(f"[NGROK] tunnel established: {public_url}")
            print(f"[BOLNA] Webhook URL: {public_url}/api/v1/bolna/webhook")
        except Exception as e:
            print(f"[ERROR] Failed to start ngrok: {e}")
    yield
    # Shutdown logic
    if os.getenv("ENVIRONMENT", "development") == "development":
        try:
            from pyngrok import ngrok
            ngrok.kill()
        except:
            pass

app = FastAPI(
    title="JusticeGrid API",
    description=(
        "AI-Augmented Legal Intelligence Platform for India's Undertrial Crisis.\n\n"
        "Covers all 10 pillars: Data Fusion, Case Prioritization, Paralegal Interface, "
        "Systemic Patterns, Ethical Architecture, Multilingual NLP, Bail Surety Intelligence, "
        "Adjournment Prediction, Federated Learning, and Voice-First Access.\n\n"
        "**Free tier deployment** — $0 total cost."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow frontend from any origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ────────────────────────────────────────────────────────────
from .routers import cases, eligibility, hearings, surety, analytics, utrc, audit, comms, nlp, fl, auth, alerts, drafts, bail_conditions, bolna
app.include_router(cases.router,        prefix="/api/v1/cases",        tags=["Cases"])
app.include_router(eligibility.router,  prefix="/api/v1/eligibility",  tags=["Eligibility"])
app.include_router(hearings.router,     prefix="/api/v1/hearings",     tags=["Hearings"])
app.include_router(surety.router,       prefix="/api/v1/surety",       tags=["Surety"])
app.include_router(analytics.router,    prefix="/api/v1/analytics",    tags=["Analytics"])
app.include_router(utrc.router,         prefix="/api/v1/utrc",         tags=["UTRC"])
app.include_router(audit.router,        prefix="/api/v1/admin",        tags=["Admin & Audit"])
app.include_router(comms.router,        prefix="/api/v1/comms",        tags=["Communication"])
app.include_router(nlp.router,          prefix="/api/v1/nlp",          tags=["NLP"])
app.include_router(fl.router,           prefix="/api/v1/fl",           tags=["Federated Learning"])
app.include_router(auth.router,         prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(alerts.router,       prefix="/api/v1/alerts",       tags=["Alerts"])
app.include_router(drafts.router,       prefix="/api/v1/drafts",       tags=["Drafts"])
app.include_router(bail_conditions.router, prefix="/api/v1/bail",      tags=["Bail Conditions"])
app.include_router(bolna.router,        prefix="/api/v1/bolna",        tags=["Bolna"])

@app.get("/", tags=["Health"])
def root():
    return {
        "name": "JusticeGrid API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "pillars": 10,
        "differentiators": 7,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint — pinged by cron-job.org to prevent Render cold starts."""
    return {"status": "healthy", "service": "justicegrid-api"}
