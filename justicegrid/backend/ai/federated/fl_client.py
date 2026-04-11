"""
Simulated FL client representing a DLSA node.
Trains a local model on district-level data and shares DP-noised weights.
"""
import numpy as np
from typing import Dict, List
from .dp_config import DPConfig, add_gaussian_noise, clip_weights, PrivacyBudgetTracker


class FLClient:
    """Simulated DLSA federated learning client."""

    def __init__(self, dlsa_code: str, dlsa_name: str, state: str, district: str = ""):
        self.dlsa_code = dlsa_code
        self.dlsa_name = dlsa_name
        self.state = state
        self.district = district
        self.dp_config = DPConfig()
        self.privacy_tracker = PrivacyBudgetTracker()
        self.local_weights = None
        self.data_quality_score = np.random.uniform(0.7, 0.95)
        self.local_accuracy = 0.0
        self.n_samples = 0

    def generate_local_data(self, n: int = 500) -> tuple:
        """Generate synthetic local training data for this DLSA."""
        np.random.seed(hash(self.dlsa_code) % 2**32)
        self.n_samples = n

        # Features: court_adj_rate, case_age, charge_filed, bail_rate
        X = np.random.randn(n, 4) * 0.5 + 0.5
        X = np.clip(X, 0, 1)

        # Local patterns — each DLSA has slightly different distributions
        local_bias = hash(self.dlsa_code) % 10 / 100
        y = ((X[:, 0] * 0.4 + X[:, 3] * 0.3 + local_bias + np.random.randn(n) * 0.2) > 0.5).astype(int)

        return X, y

    def train_local(self, global_weights: np.ndarray = None) -> Dict:
        """
        Train local model on district data.
        If global_weights provided, initialize from global model.
        """
        X, y = self.generate_local_data()

        # Simple logistic regression via gradient descent
        n_features = X.shape[1]
        weights = global_weights.copy() if global_weights is not None else np.zeros(n_features)
        bias = 0.0
        lr = 0.1

        for _ in range(50):  # 50 epochs
            z = X @ weights + bias
            predictions = 1 / (1 + np.exp(-np.clip(z, -500, 500)))
            error = predictions - y
            grad_w = X.T @ error / len(y)
            grad_b = np.mean(error)

            # Clip gradients for DP
            grad_w = clip_weights(grad_w, self.dp_config.max_grad_norm)

            weights -= lr * grad_w
            bias -= lr * grad_b

        # Compute local accuracy
        z = X @ weights + bias
        preds = (1 / (1 + np.exp(-np.clip(z, -500, 500)))) > 0.5
        self.local_accuracy = float(np.mean(preds == y))
        self.local_weights = weights

        return {
            "dlsa_code": self.dlsa_code,
            "local_accuracy": round(self.local_accuracy, 3),
            "n_samples": self.n_samples,
            "data_quality_score": round(self.data_quality_score, 3),
        }

    def get_dp_weights(self) -> np.ndarray:
        """Return locally trained weights with differential privacy noise."""
        if self.local_weights is None:
            return np.zeros(4)

        # Add DP noise
        dp_weights = add_gaussian_noise(self.local_weights, self.dp_config)
        self.privacy_tracker.spend(self.dp_config.epsilon / 10)  # Per-round budget
        return dp_weights

    def get_info(self) -> Dict:
        return {
            "dlsa_code": self.dlsa_code,
            "dlsa_name": self.dlsa_name,
            "state": self.state,
            "district": self.district,
            "local_accuracy": round(self.local_accuracy, 3),
            "data_quality_score": round(self.data_quality_score, 3),
            "privacy_budget": self.privacy_tracker.to_dict(),
            "n_samples": self.n_samples,
        }
