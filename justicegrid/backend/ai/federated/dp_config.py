"""
Differential Privacy configuration for federated learning.
Implements Gaussian noise mechanism for weight perturbation.
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List


@dataclass
class DPConfig:
    """Differential privacy parameters."""
    epsilon: float = 1.0         # Privacy budget
    delta: float = 1e-5          # Failure probability
    max_grad_norm: float = 1.0   # Gradient clipping bound
    noise_multiplier: float = 1.1


@dataclass
class PrivacyBudgetTracker:
    """Track cumulative privacy spend across rounds."""
    epsilon_per_round: float = 0.1
    total_epsilon_spent: float = 0.0
    max_epsilon: float = 1.0
    rounds_completed: int = 0
    history: List[float] = field(default_factory=list)

    def spend(self, epsilon: float) -> bool:
        """Spend privacy budget. Returns False if budget exceeded."""
        if self.total_epsilon_spent + epsilon > self.max_epsilon:
            return False
        self.total_epsilon_spent += epsilon
        self.rounds_completed += 1
        self.history.append(self.total_epsilon_spent)
        return True

    @property
    def remaining(self) -> float:
        return self.max_epsilon - self.total_epsilon_spent

    def to_dict(self) -> dict:
        return {
            "epsilon_spent": round(self.total_epsilon_spent, 4),
            "epsilon_remaining": round(self.remaining, 4),
            "max_epsilon": self.max_epsilon,
            "rounds_completed": self.rounds_completed,
        }


def add_gaussian_noise(weights: np.ndarray, config: DPConfig) -> np.ndarray:
    """Add calibrated Gaussian noise to model weights for differential privacy."""
    sensitivity = config.max_grad_norm
    sigma = sensitivity * config.noise_multiplier / config.epsilon
    noise = np.random.normal(0, sigma, weights.shape)
    return weights + noise


def clip_weights(weights: np.ndarray, max_norm: float) -> np.ndarray:
    """Clip weight updates to bounded sensitivity."""
    norm = np.linalg.norm(weights)
    if norm > max_norm:
        weights = weights * (max_norm / norm)
    return weights
