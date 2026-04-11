"""
JusticeGrid configuration — loads environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./justicegrid_dev.db")

# Redis
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Supabase Auth
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

# Gemini
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

# App
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

# Eligibility constants
FIRST_OFFENDER_THRESHOLD = 1 / 3  # S.479 BNSS: ⅓ of max sentence
REGULAR_THRESHOLD = 1 / 2          # S.479 BNSS: ½ of max sentence
STALENESS_HOURS = 48                # Data older than this is marked STALE
ESCALATION_DAYS = 7                 # Days before eligibility window → warning
SURETY_MONTHS_THRESHOLD = 3         # Surety > 3 months of income → S.440 candidate
NOTIFICATION_ESCALATION_DAYS = 45   # No notification in 45 days → escalation
