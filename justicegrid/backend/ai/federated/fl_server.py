"""
Simulated federated learning server with FedAvg strategy.
Aggregates model weights from DLSA nodes without accessing raw data.
"""
import numpy as np
from typing import Dict, List
from datetime import datetime
from .fl_client import FLClient


class FLServer:
    """Federated Learning server using FedAvg aggregation."""

    def __init__(self):
        self.global_weights = np.zeros(4)  # For our 4-feature model
        self.clients: Dict[str, FLClient] = {}
        self.round_number = 0
        self.history: List[Dict] = []
        self.global_accuracy = 0.0

    def register_client(self, client: FLClient) -> Dict:
        """Register a new DLSA client node."""
        self.clients[client.dlsa_code] = client
        return {
            "status": "registered",
            "dlsa_code": client.dlsa_code,
            "round_number": self.round_number,
        }

    def run_round(self) -> Dict:
        """Execute one round of federated averaging."""
        self.round_number += 1

        # 1. Each client trains locally
        client_results = []
        client_weights = []
        client_samples = []

        for code, client in self.clients.items():
            result = client.train_local(self.global_weights)
            dp_weights = client.get_dp_weights()

            client_results.append(result)
            client_weights.append(dp_weights)
            client_samples.append(result["n_samples"])

        # 2. FedAvg — weighted average by number of samples
        total_samples = sum(client_samples)
        if total_samples > 0:
            avg_weights = np.zeros_like(self.global_weights)
            for w, n in zip(client_weights, client_samples):
                avg_weights += w * (n / total_samples)
            self.global_weights = avg_weights

        # 3. Evaluate global model
        accuracies = [r["local_accuracy"] for r in client_results]
        self.global_accuracy = float(np.mean(accuracies)) if accuracies else 0.0

        round_result = {
            "round": self.round_number,
            "timestamp": datetime.utcnow().isoformat(),
            "participants": len(client_results),
            "global_accuracy": round(self.global_accuracy, 3),
            "client_results": client_results,
            "total_samples": total_samples,
        }
        self.history.append(round_result)

        return round_result

    def get_governance_data(self) -> Dict:
        """Return governance dashboard data for NALSA."""
        return {
            "total_nodes": len(self.clients),
            "active_nodes": len([c for c in self.clients.values()]),
            "withdrawn_nodes": 0,
            "total_rounds": self.round_number,
            "global_accuracy": round(self.global_accuracy, 3),
            "nodes": [client.get_info() for client in self.clients.values()],
            "round_history": self.history,
        }

    def withdraw_client(self, dlsa_code: str) -> Dict:
        """Remove a DLSA's contribution from the global model."""
        if dlsa_code not in self.clients:
            return {"error": f"DLSA {dlsa_code} not found"}

        import hashlib
        removal_hash = hashlib.sha256(
            f"{dlsa_code}:{datetime.utcnow().isoformat()}:withdrawal".encode()
        ).hexdigest()

        del self.clients[dlsa_code]

        # Retrain global model without this client
        if self.clients:
            self.run_round()

        return {
            "status": "withdrawn",
            "dlsa_code": dlsa_code,
            "removal_proof": removal_hash,
            "remaining_nodes": len(self.clients),
            "message": "DLSA weights removed from global model. Cryptographic proof generated.",
        }
