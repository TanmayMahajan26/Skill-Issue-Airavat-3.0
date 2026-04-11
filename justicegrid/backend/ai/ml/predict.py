"""
Prediction functions called by Laptop A's backend.
Load trained models and return predictions with confidence intervals.
"""
import os
import numpy as np
import joblib
from typing import Dict

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# Load models at import time (once, not per-request)
_adj_data = None
_bail_data = None


def _load_models():
    global _adj_data, _bail_data
    try:
        _adj_data = joblib.load(os.path.join(MODEL_DIR, "adjournment_model.pkl"))
        print("[ML] Adjournment model loaded.")
    except Exception:
        print("WARNING: Adjournment model not found. Run ai/ml/train.py first.")
    try:
        _bail_data = joblib.load(os.path.join(MODEL_DIR, "bail_predictor.pkl"))
        print("[ML] Bail predictor model loaded.")
    except Exception:
        print("WARNING: Bail predictor not found. Run ai/ml/train.py first.")


_load_models()


def predict_adjournment(features: Dict) -> Dict:
    """
    Predict adjournment probability for a hearing.
    Called by Laptop A: GET /api/v1/hearings/{id}/adjournment

    Input features: {court_adj_rate, consecutive_adjournments, day_of_week,
                     days_to_vacation, charge_sheet_filed, case_age_days, court_load}
    """
    if _adj_data is None:
        return {"probability": 50.0, "ci_low": 30.0, "ci_high": 70.0,
                "uncertainty": "HIGH", "error": "Model not loaded"}

    model = _adj_data["model"]
    feature_names = _adj_data["features"]

    X = np.array([[features.get(f, 0) for f in feature_names]])
    prob = float(model.predict_proba(X)[0][1])

    # Bootstrap confidence interval
    ci_low, ci_high = _bootstrap_ci(model, X, n=50)

    # Key factors (feature importances for this prediction)
    importances = model.feature_importances_
    top_factors = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:3]

    return {
        "probability": round(prob * 100, 1),
        "ci_low": round(ci_low * 100, 1),
        "ci_high": round(ci_high * 100, 1),
        "key_factors": [{"feature": f, "importance": round(float(i), 3)} for f, i in top_factors],
        "uncertainty": "HIGH" if (ci_high - ci_low) > 0.3 else "MEDIUM" if (ci_high - ci_low) > 0.15 else "LOW",
        "disclaimer": "This prediction is an input to judgment, not an instruction."
    }


def predict_bail_success(features: Dict) -> Dict:
    """
    Predict bail grant probability for a case.
    Called by Laptop A: GET /api/v1/cases/{id}/bail-prediction
    """
    if _bail_data is None:
        return {"probability": 50.0, "error": "Model not loaded"}

    model = _bail_data["model"]
    feature_names = _bail_data["features"]

    X = np.array([[features.get(f, 0) for f in feature_names]])
    prob = float(model.predict_proba(X)[0][1])

    return {
        "probability": round(prob * 100, 1),
        "disclaimer": "Historical data — not a prediction of your specific case outcome."
    }


def _bootstrap_ci(model, X, n=50, alpha=0.05):
    """Quick bootstrap confidence interval."""
    predictions = []
    for _ in range(n):
        noise = np.random.normal(0, 0.02, X.shape)
        prob = model.predict_proba(X + noise)[0][1]
        predictions.append(prob)
    return float(np.percentile(predictions, 100 * alpha / 2)), float(np.percentile(predictions, 100 * (1 - alpha / 2)))
