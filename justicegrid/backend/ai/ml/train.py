"""
Train adjournment predictor and bail success predictor.
Uses synthetic data matching Laptop A's seed generator patterns.
Saves models as .pkl files for backend to load.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_training_data(n=10000):
    """Generate synthetic training data matching seed data patterns."""
    np.random.seed(42)

    data = pd.DataFrame({
        'court_adj_rate': np.random.uniform(0.3, 0.9, n),
        'consecutive_adjournments': np.random.randint(0, 12, n),
        'day_of_week': np.random.randint(0, 5, n),
        'days_to_vacation': np.random.randint(1, 90, n),
        'charge_sheet_filed': np.random.choice([0, 1], n, p=[0.35, 0.65]),
        'case_age_days': np.random.randint(30, 1000, n),
        'court_load': np.random.randint(20, 80, n),
        'bail_grant_rate': np.random.uniform(0.3, 0.85, n),
    })

    # Adjournment target — correlated with features
    adj_prob = (
        0.4 * data['court_adj_rate'] +
        0.05 * np.minimum(data['consecutive_adjournments'], 6) / 6 +
        0.1 * (1 - data['charge_sheet_filed']) +
        0.05 * (data['court_load'] / 80) +
        0.05 * (data['day_of_week'] == 0).astype(float) +  # Monday effect
        np.random.normal(0, 0.1, n)
    )
    data['adjourned'] = (adj_prob > 0.45).astype(int)

    # Bail grant target
    bail_prob = (
        0.5 * data['bail_grant_rate'] +
        0.1 * data['charge_sheet_filed'] +
        0.1 * np.minimum(data['case_age_days'], 500) / 500 +
        -0.1 * data['court_adj_rate'] +
        np.random.normal(0, 0.15, n)
    )
    data['bail_granted'] = (bail_prob > 0.4).astype(int)

    return data


def train_adjournment_model():
    """Train GradientBoosting model for adjournment prediction."""
    print("Training adjournment prediction model...")
    data = generate_training_data()

    features = ['court_adj_rate', 'consecutive_adjournments', 'day_of_week',
                'days_to_vacation', 'charge_sheet_filed', 'case_age_days', 'court_load']

    X = data[features]
    y = data['adjourned']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(
        n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy: {accuracy:.3f}, AUC: {auc:.3f}")

    # Save
    model_path = os.path.join(MODEL_DIR, "adjournment_model.pkl")
    joblib.dump({"model": model, "features": features}, model_path)
    print(f"  Saved to {model_path}")

    return model


def train_bail_predictor():
    """Train model for bail success prediction."""
    print("Training bail success prediction model...")
    data = generate_training_data()

    features = ['bail_grant_rate', 'charge_sheet_filed', 'case_age_days',
                'court_adj_rate', 'court_load']

    X = data[features]
    y = data['bail_granted']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(
        n_estimators=80, max_depth=5, learning_rate=0.1, random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy: {accuracy:.3f}, AUC: {auc:.3f}")

    model_path = os.path.join(MODEL_DIR, "bail_predictor.pkl")
    joblib.dump({"model": model, "features": features}, model_path)
    print(f"  Saved to {model_path}")

    return model


if __name__ == "__main__":
    train_adjournment_model()
    train_bail_predictor()
    print("\nAll models trained and saved to ai/ml/models/")
