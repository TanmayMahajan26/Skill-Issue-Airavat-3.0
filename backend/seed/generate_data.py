"""
JusticeGrid Seed Data Generator.
Generates 5,000 synthetic undertrial cases across 5 Indian states
with realistic distributions for charges, detention durations,
surety amounts, hearings, and court behaviour.

Run from the backend directory:
    python -m seed.generate_data
"""
import sys
import os
import random
from datetime import date, datetime, timedelta

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faker import Faker
from app.database import engine, Base, SessionLocal
from app.models.schemas import (
    District, Prison, Court, User, Case,
    Hearing, FamilyContact, FLNode
)

fake = Faker("en_IN")
random.seed(42)
Faker.seed(42)


# ─── Constants ───────────────────────────────────────────────────────────────

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
    {"section": "420", "act": "IPC", "description": "Cheating", "max_years": 7, "life_or_death": False},
    {"section": "454", "act": "IPC", "description": "Lurking House-trespass", "max_years": 10, "life_or_death": False},
    {"section": "457", "act": "IPC", "description": "Lurking at Night", "max_years": 5, "life_or_death": False},
    {"section": "468", "act": "IPC", "description": "Forgery for Cheating", "max_years": 7, "life_or_death": False},
    {"section": "498A", "act": "IPC", "description": "Cruelty by Husband", "max_years": 3, "life_or_death": False},
    {"section": "304B", "act": "IPC", "description": "Dowry Death", "max_years": 100, "life_or_death": True},
    {"section": "306", "act": "IPC", "description": "Abetment of Suicide", "max_years": 10, "life_or_death": False},
    {"section": "323", "act": "IPC", "description": "Voluntarily Causing Hurt", "max_years": 1, "life_or_death": False},
    {"section": "354", "act": "IPC", "description": "Assault on Woman", "max_years": 5, "life_or_death": False},
    {"section": "406", "act": "IPC", "description": "Criminal Breach of Trust", "max_years": 3, "life_or_death": False},
    {"section": "506", "act": "IPC", "description": "Criminal Intimidation", "max_years": 2, "life_or_death": False},
    {"section": "120B", "act": "IPC", "description": "Criminal Conspiracy", "max_years": 7, "life_or_death": False},
]

COURT_TYPES = ["Sessions Court", "Magistrate Court", "District Court", "Addl. Sessions Court"]

# Lat/Lng for prison heatmap
PRISON_COORDS = {
    "Maharashtra": [(18.52, 73.85), (19.08, 72.88), (21.15, 79.09), (19.99, 73.78), (19.88, 75.34)],
    "Uttar Pradesh": [(26.85, 80.95), (25.32, 82.99), (25.43, 81.84), (26.45, 80.35), (27.18, 78.02)],
    "Bihar": [(25.61, 85.14), (24.80, 85.01), (25.24, 86.97), (26.12, 85.39), (26.16, 85.90)],
    "Tamil Nadu": [(13.08, 80.27), (9.93, 78.12), (11.01, 76.97), (11.65, 78.16), (10.79, 78.69)],
    "West Bengal": [(22.57, 88.36), (22.59, 88.26), (23.68, 86.97), (26.71, 88.43), (23.49, 87.32)],
}

JUDGE_NAMES = [fake.name() for _ in range(60)]
DIALECTS = {
    "Maharashtra": [None, None, None],  # Standard Marathi
    "Uttar Pradesh": ["bhojpuri", "awadhi", None, None],
    "Bihar": ["bhojpuri", "maithili", None],
    "Tamil Nadu": [None, None, None],  # Standard Tamil
    "West Bengal": [None, None, None],  # Standard Bengali
}


def generate():
    """Generate all seed data."""
    print("=" * 60)
    print("JusticeGrid Seed Data Generator")
    print("=" * 60)

    # Create tables
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    # Check if data already exists
    existing = session.query(Case).count()
    if existing > 0:
        print(f"Database already has {existing} cases. Skipping seed.")
        session.close()
        return

    try:
        # ─── 1. Districts ────────────────────────────────────────────
        print("\n[1/7] Creating districts...")
        district_map = {}
        for state, info in STATES.items():
            for i, dist_name in enumerate(info["districts"]):
                d = District(
                    name=dist_name,
                    state=state,
                    median_daily_wage=round(random.uniform(220, 520), 2),
                    mgnrega_rate=round(random.uniform(250, 370), 2),
                    median_monthly_income=round(random.uniform(8000, 28000), 2),
                    population=random.randint(500000, 5000000),
                    lat=PRISON_COORDS[state][i][0] + random.uniform(-0.3, 0.3),
                    lng=PRISON_COORDS[state][i][1] + random.uniform(-0.3, 0.3),
                )
                session.add(d)
                session.flush()
                district_map[(state, dist_name)] = d.id
        print(f"  Created {len(district_map)} districts")

        # ─── 2. Prisons (2 per district = 50 total) ─────────────────
        print("[2/7] Creating prisons...")
        prison_map = {}
        for state, info in STATES.items():
            for i, dist_name in enumerate(info["districts"]):
                for j, p_type in enumerate(["Central", "District"]):
                    p = Prison(
                        prison_name=f"{dist_name} {p_type} Prison",
                        district_id=district_map[(state, dist_name)],
                        state=state,
                        capacity=random.randint(500, 3500),
                        current_population=random.randint(600, 4500),
                        lat=PRISON_COORDS[state][i][0] + random.uniform(-0.05, 0.05),
                        lng=PRISON_COORDS[state][i][1] + random.uniform(-0.05, 0.05),
                    )
                    session.add(p)
                    session.flush()
                    prison_map[(state, dist_name, j)] = p.id
        print(f"  Created {len(prison_map)} prisons")

        # ─── 3. Courts (4 per district = 100 total) ─────────────────
        print("[3/7] Creating courts...")
        court_map = {}
        for state, info in STATES.items():
            for dist_name in info["districts"]:
                for ct in COURT_TYPES:
                    c = Court(
                        court_name=f"{ct}, {dist_name}",
                        district_id=district_map[(state, dist_name)],
                        state=state,
                        historical_adjournment_rate=round(random.uniform(0.25, 0.92), 2),
                        avg_bail_decision_days=random.randint(7, 95),
                        daily_case_load=random.randint(15, 85),
                        bail_grant_rate=round(random.uniform(0.25, 0.88), 2),
                    )
                    session.add(c)
                    session.flush()
                    court_map[(state, dist_name, ct)] = c.id
        print(f"  Created {len(court_map)} courts")

        # ─── 4. Demo Users ──────────────────────────────────────────
        print("[4/7] Creating demo users...")
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
        print(f"  Created {len(demo_users)} demo users")

        # ─── 5. Cases (5000) ────────────────────────────────────────
        print("[5/7] Creating 5000 cases (this may take a moment)...")
        today = date.today()
        all_states = list(STATES.keys())

        for i in range(5000):
            state = random.choice(all_states)
            dist_name = random.choice(STATES[state]["districts"])

            # Pick 1-3 charges (weighted: most cases have 1-2)
            num_charges = random.choices([1, 2, 3], weights=[0.55, 0.35, 0.10])[0]
            # Ensure we pick substantive charges (not just S.34)
            substantive = [c for c in IPC_CHARGES if c["section"] != "34"]
            case_charges = random.sample(substantive, min(num_charges, len(substantive)))

            # Detention: 30 to 1200 days ago
            days_detained = random.randint(30, 1200)
            arrest = today - timedelta(days=days_detained)

            is_first = random.random() < 0.65
            has_multiple = random.random() < 0.12
            has_life = any(ch["life_or_death"] for ch in case_charges)

            # Bail (25% chance, never for life charges in active status)
            bail_granted = random.random() < 0.25 and not has_life
            bail_date = arrest + timedelta(days=random.randint(60, max(61, days_detained))) if bail_granted else None
            surety_amounts = [5000, 10000, 15000, 25000, 50000, 75000, 100000, 200000, 500000]
            surety = random.choice(surety_amounts) if bail_granted else None
            surety_exec = random.random() < 0.35 if bail_granted else False

            state_abbrev = state[:2].upper()
            year = 2024 + random.choice([0, 1])

            case = Case(
                case_number=f"{state_abbrev}-{year}-CR-{10000 + i}",
                accused_name=fake.name(),
                prison_id=prison_map[(state, dist_name, random.choice([0, 1]))],
                district_id=district_map[(state, dist_name)],
                court_id=court_map[(state, dist_name, random.choice(COURT_TYPES))],
                charges=case_charges,
                fir_language=STATES[state]["lang"],
                arrest_date=arrest,
                accused_delay_days=random.randint(0, 25),
                is_first_offender=is_first,
                has_multiple_pending_cases=has_multiple,
                eligibility_status="PENDING",
                bail_granted=bail_granted,
                bail_granted_date=bail_date,
                surety_amount=surety,
                surety_executed=surety_exec,
                assigned_paralegal_id=paralegal_id if random.random() < 0.65 else None,
                assigned_lawyer_id=lawyer_id if random.random() < 0.45 else None,
                source_portal=f"ecourts_{state_abbrev.lower()}",
                status="ACTIVE",
            )
            session.add(case)
            session.flush()

            # ─── Hearings (3-20 past + 1 upcoming) ──────────────────
            num_hearings = random.randint(3, 20)
            hearing_date = arrest + timedelta(days=random.randint(10, 21))
            for h in range(num_hearings):
                if hearing_date > today:
                    break
                outcome = random.choices(
                    ["HEARD", "ADJOURNED", "BAIL_GRANTED", "BAIL_DENIED"],
                    weights=[0.20, 0.52, 0.12, 0.16]
                )[0]
                next_h = hearing_date + timedelta(days=random.randint(7, 50))
                hearing = Hearing(
                    case_id=case.id,
                    hearing_date=hearing_date,
                    court_id=case.court_id,
                    judge_name=random.choice(JUDGE_NAMES),
                    outcome=outcome,
                    next_hearing_date=next_h if next_h <= today else None,
                    charge_sheet_filed=random.random() < 0.55,
                )
                session.add(hearing)
                hearing_date = next_h

            # Add one upcoming hearing (if in the future)
            if hearing_date > today:
                upcoming = Hearing(
                    case_id=case.id,
                    hearing_date=hearing_date if hearing_date <= today + timedelta(days=60) else today + timedelta(days=random.randint(3, 30)),
                    court_id=case.court_id,
                    judge_name=random.choice(JUDGE_NAMES),
                    outcome=None,  # Not yet heard
                    charge_sheet_filed=random.random() < 0.65,
                )
                session.add(upcoming)

            # ─── Family Contact (70% of cases) ──────────────────────
            if random.random() < 0.70:
                dialect_options = DIALECTS.get(state, [None])
                contact = FamilyContact(
                    case_id=case.id,
                    phone_number=f"+91{random.randint(7000000000, 9999999999)}",
                    preferred_language=STATES[state]["lang"],
                    preferred_dialect=random.choice(dialect_options),
                    preferred_channel=random.choice(["WHATSAPP", "SMS", "IVR"]),
                    consent_given=random.random() < 0.80,
                    consent_date=datetime.now() if random.random() < 0.80 else None,
                )
                session.add(contact)

            # Progress indicator
            if (i + 1) % 1000 == 0:
                session.commit()
                print(f"  ... {i + 1}/5000 cases created")

        session.commit()
        print(f"  Created 5000 cases with hearings and contacts")

        # ─── 6. Federated Learning Demo Nodes ────────────────────────
        print("[6/7] Creating FL demo nodes...")
        fl_nodes = [
            FLNode(dlsa_code="MH-PUNE", dlsa_name="DLSA Pune", state="Maharashtra",
                   district="Pune", contribution_count=15, data_quality_score=0.89, accuracy_improvement=0.023,
                   last_contribution=datetime.now() - timedelta(hours=2)),
            FLNode(dlsa_code="UP-LKO", dlsa_name="DLSA Lucknow", state="Uttar Pradesh",
                   district="Lucknow", contribution_count=12, data_quality_score=0.82, accuracy_improvement=0.018,
                   last_contribution=datetime.now() - timedelta(hours=5)),
            FLNode(dlsa_code="BR-PAT", dlsa_name="DLSA Patna", state="Bihar",
                   district="Patna", contribution_count=8, data_quality_score=0.75, accuracy_improvement=0.012,
                   last_contribution=datetime.now() - timedelta(days=1)),
            FLNode(dlsa_code="TN-CHE", dlsa_name="DLSA Chennai", state="Tamil Nadu",
                   district="Chennai", contribution_count=18, data_quality_score=0.91, accuracy_improvement=0.028,
                   last_contribution=datetime.now() - timedelta(hours=1)),
            FLNode(dlsa_code="WB-KOL", dlsa_name="DLSA Kolkata", state="West Bengal",
                   district="Kolkata", contribution_count=10, data_quality_score=0.78, accuracy_improvement=0.015,
                   last_contribution=datetime.now() - timedelta(hours=8)),
        ]
        for n in fl_nodes:
            session.add(n)
        session.commit()
        print(f"  Created {len(fl_nodes)} FL demo nodes")

        # ─── 7. Run Eligibility + Priority on All Cases ──────────────
        print("[7/7] Computing eligibility and priority for all cases...")
        from app.services.eligibility_engine import run_eligibility_and_save
        from app.services.priority_scorer import run_priority_and_save

        all_cases = session.query(Case).filter(Case.status == "ACTIVE").all()
        for idx, case in enumerate(all_cases):
            try:
                run_eligibility_and_save(case, session)
                run_priority_and_save(case, session)
            except Exception as e:
                pass  # Some edge cases may fail — that's OK for seed data

            if (idx + 1) % 1000 == 0:
                print(f"  ... {idx + 1}/{len(all_cases)} cases processed")

        session.commit()

        # ─── Stats ───────────────────────────────────────────────────
        eligible = session.query(Case).filter(Case.eligibility_status == "ELIGIBLE").count()
        not_eligible = session.query(Case).filter(Case.eligibility_status == "NOT_ELIGIBLE").count()
        excluded = session.query(Case).filter(Case.eligibility_status == "EXCLUDED").count()
        review = session.query(Case).filter(Case.eligibility_status == "REVIEW_NEEDED").count()
        pending = session.query(Case).filter(Case.eligibility_status == "PENDING").count()

        print("\n" + "=" * 60)
        print("SEED DATA GENERATION COMPLETE!")
        print("=" * 60)
        print(f"  Districts:     {len(district_map)}")
        print(f"  Prisons:       {len(prison_map)}")
        print(f"  Courts:        {len(court_map)}")
        print(f"  Users:         {len(demo_users)}")
        print(f"  Cases:         5000")
        print(f"    ELIGIBLE:      {eligible}")
        print(f"    NOT_ELIGIBLE:  {not_eligible}")
        print(f"    EXCLUDED:      {excluded}")
        print(f"    REVIEW_NEEDED: {review}")
        print(f"    PENDING:       {pending}")
        print(f"  FL Nodes:      {len(fl_nodes)}")
        print("=" * 60)

    except Exception as e:
        session.rollback()
        print(f"\nERROR: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    generate()
