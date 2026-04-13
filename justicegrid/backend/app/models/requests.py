from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CaseCreateRequest(BaseModel):
    accused_name: str
    father_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    address: Optional[str] = None
    fir_number: Optional[str] = None
    police_station: Optional[str] = None
    arrest_date: str
    is_first_offender: Optional[bool] = None
    charges: List[Dict[str, Any]] = []
    court_id: Optional[str] = None
    prison_id: Optional[str] = None
    district_id: Optional[str] = None
    assigned_lawyer_id: Optional[str] = None
    assigned_paralegal_id: Optional[str] = None
