"""
Auth API — simple session-based login for demo purposes.
In production, this would use Supabase Auth / JWT tokens.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models.schemas import User, Case

router = APIRouter()


class LoginRequest(BaseModel):
    email: str


class LoginResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    language_preference: str
    assigned_cases: int = 0
    district: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Simple login by email — returns user profile with case count.
    In production, this would verify against Supabase Auth.
    """
    user = db.query(User).filter(User.email == req.email, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials. User not found.")

    # Count cases assigned to this user
    if user.role == "paralegal":
        case_count = db.query(Case).filter(
            Case.assigned_paralegal_id == user.id,
            Case.status == "ACTIVE",
        ).count()
    elif user.role == "lawyer":
        case_count = db.query(Case).filter(
            Case.assigned_lawyer_id == user.id,
            Case.status == "ACTIVE",
        ).count()
    else:
        case_count = db.query(Case).filter(Case.status == "ACTIVE").count()

    return LoginResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        language_preference=user.language_preference or "en",
        assigned_cases=case_count,
        district=None,
    )


@router.get("/me")
def get_me(user_id: str, db: Session = Depends(get_db)):
    """Get current user's profile with live stats."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "paralegal":
        total = db.query(Case).filter(Case.assigned_paralegal_id == user.id, Case.status == "ACTIVE").count()
        eligible = db.query(Case).filter(
            Case.assigned_paralegal_id == user.id,
            Case.status == "ACTIVE",
            Case.eligibility_status == "ELIGIBLE",
        ).count()
    elif user.role == "lawyer":
        total = db.query(Case).filter(Case.assigned_lawyer_id == user.id, Case.status == "ACTIVE").count()
        eligible = db.query(Case).filter(
            Case.assigned_lawyer_id == user.id,
            Case.status == "ACTIVE",
            Case.eligibility_status == "ELIGIBLE",
        ).count()
    else:
        total = db.query(Case).filter(Case.status == "ACTIVE").count()
        eligible = db.query(Case).filter(Case.status == "ACTIVE", Case.eligibility_status == "ELIGIBLE").count()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "total_assigned": total,
        "eligible_cases": eligible,
        "language_preference": user.language_preference,
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """List all demo users for the login selector."""
    users = db.query(User).filter(User.is_active == True).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
            }
            for u in users
        ]
    }
