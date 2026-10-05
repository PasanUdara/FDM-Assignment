"""Feature preparation shared by the training-export step and FastAPI service."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
RAW_DATA_PATH = ROOT / "dataset" / "credit_risk_dataset.csv"
TRAIN_FEATURES_PATH = ROOT / "dataset" / "X_train.csv"
ARTIFACT_PATH = ROOT / "models" / "deployment_preprocessor.joblib"
RANDOM_STATE = 42

CATEGORICAL_COLUMNS = [
    "person_home_ownership", "loan_intent", "employment_type",
    "education_level", "marital_status",
]
MEDIAN_COLUMNS = [
    "person_emp_length", "num_dependents", "credit_score",
    "credit_utilization_pct", "num_open_accounts", "num_late_payments_24m",
    "num_hard_inquiries_6m", "existing_monthly_debt", "savings_balance",
    "est_monthly_payment", "total_interest_cost", "debt_to_income_ratio",
]


def _clean_training_data(raw: pd.DataFrame) -> pd.DataFrame:
    """Reproduce the cleaning steps used in ``pre-prosseing.ipynb``."""
    data = raw.drop_duplicates().copy()
    data = data[(data["person_age"] <= 100) & (data["person_emp_length"] <= 60)].copy()
    data["loan_int_rate"] = data["loan_int_rate"].fillna(
        data.groupby("loan_grade")["loan_int_rate"].transform("median")
    )
    for column in MEDIAN_COLUMNS:
        data[column] = data[column].fillna(data[column].median())
    for column in ("employment_type", "education_level", "marital_status"):
        data[column] = data[column].fillna("Unknown")
    return data.dropna().reset_index(drop=True)


def _to_model_features(data: pd.DataFrame, feature_columns: list[str] | None = None) -> pd.DataFrame:
    """Apply feature engineering and one-hot encoding used at training time."""
    result = data.copy()
    result["income_to_loan_ratio"] = (result["person_income"] / result["loan_amnt"]).round(2)
    result["credit_history_to_age_ratio"] = (
        result["cb_person_cred_hist_length"] / result["person_age"]
    ).round(3)
    result["log_income"] = np.log1p(result["person_income"])
    result["cb_person_default_on_file"] = (result["cb_person_default_on_file"] == "Y").astype(int)
    result = pd.get_dummies(result, columns=CATEGORICAL_COLUMNS, drop_first=True)
    drop_columns = [
        column for column in ("loan_status", "loan_grade", "loan_grade_encoded", "loan_int_rate")
        if column in result.columns
    ]
    result = result.drop(columns=drop_columns)
    if feature_columns is not None:
        result = result.reindex(columns=feature_columns, fill_value=False)
    return result


def build_preprocessor_artifact() -> dict[str, Any]:
    """Fit and save the deployment scaler/metadata using the original training split."""
    raw = pd.read_csv(RAW_DATA_PATH)
    clean = _clean_training_data(raw)
    features = _to_model_features(clean)
    target = clean["loan_status"].astype(int)
    x_train, _x_test, _y_train, _y_test = train_test_split(
        features, target, test_size=0.2, stratify=target, random_state=RANDOM_STATE
    )
    numeric_columns = x_train.select_dtypes(include=["number"]).columns.tolist()
    scaler = StandardScaler().fit(x_train[numeric_columns])
    artifact: dict[str, Any] = {
        "feature_columns": list(x_train.columns),
        "numeric_columns": numeric_columns,
        "numeric_medians": {column: float(clean[column].median()) for column in MEDIAN_COLUMNS},
        "categorical_defaults": {
            column: "Unknown" for column in ("employment_type", "education_level", "marital_status")
        },
        "scaler": scaler,
    }
    ARTIFACT_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(artifact, ARTIFACT_PATH)
    return artifact


def load_preprocessor() -> dict[str, Any]:
    if not ARTIFACT_PATH.exists():
        raise FileNotFoundError(
            f"Preprocessor artifact not found at {ARTIFACT_PATH}. "
            "Run: python backend/build_preprocessor.py"
        )
    return joblib.load(ARTIFACT_PATH)


def transform_applicant(applicant: dict[str, Any], artifact: dict[str, Any]) -> pd.DataFrame:
    """Impute allowed missing values, engineer features, and scale one applicant."""
    values = dict(applicant)
    for column, median in artifact["numeric_medians"].items():
        if values.get(column) is None:
            values[column] = median
    for column, default in artifact["categorical_defaults"].items():
        if values.get(column) is None:
            values[column] = default

    frame = pd.DataFrame([values])
    features = _to_model_features(frame, artifact["feature_columns"])
    numeric_columns = artifact["numeric_columns"]
    features[numeric_columns] = artifact["scaler"].transform(features[numeric_columns])
    return features.astype(float)
