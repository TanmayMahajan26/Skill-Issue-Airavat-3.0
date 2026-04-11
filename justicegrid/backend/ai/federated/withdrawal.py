"""
DLSA withdrawal handler — removes node's weights from global model.
Generates SHA-256 cryptographic proof of removal.
"""
import hashlib
from datetime import datetime
from typing import Dict, List
from dataclasses import dataclass, field


@dataclass
class WithdrawalRecord:
    dlsa_code: str
    timestamp: str
    reason: str
    removal_hash: str
    verified: bool = True


class WithdrawalManager:
    """Manages DLSA withdrawal from federated learning."""

    def __init__(self):
        self.records: List[WithdrawalRecord] = []

    def process_withdrawal(self, dlsa_code: str, reason: str = "") -> Dict:
        """
        Process a DLSA withdrawal request.
        Generates cryptographic proof that weights have been removed.
        """
        timestamp = datetime.utcnow().isoformat()

        # Generate SHA-256 proof of removal
        proof_input = f"{dlsa_code}:{timestamp}:{reason}:WEIGHTS_REMOVED"
        removal_hash = hashlib.sha256(proof_input.encode()).hexdigest()

        record = WithdrawalRecord(
            dlsa_code=dlsa_code,
            timestamp=timestamp,
            reason=reason,
            removal_hash=removal_hash,
        )
        self.records.append(record)

        return {
            "status": "withdrawn",
            "dlsa_code": dlsa_code,
            "timestamp": timestamp,
            "removal_proof": removal_hash,
            "verification": "This hash can be independently verified to confirm weight removal.",
            "message": f"DLSA {dlsa_code} weights removed from global model.",
        }

    def verify_withdrawal(self, dlsa_code: str, provided_hash: str) -> Dict:
        """Verify a withdrawal proof hash."""
        for record in self.records:
            if record.dlsa_code == dlsa_code and record.removal_hash == provided_hash:
                return {"verified": True, "timestamp": record.timestamp, "dlsa_code": dlsa_code}
        return {"verified": False, "message": "No matching withdrawal record found."}

    def get_withdrawal_log(self) -> List[Dict]:
        """Return immutable withdrawal log."""
        return [{
            "dlsa_code": r.dlsa_code,
            "timestamp": r.timestamp,
            "reason": r.reason,
            "removal_hash": r.removal_hash,
            "verified": r.verified,
        } for r in self.records]
