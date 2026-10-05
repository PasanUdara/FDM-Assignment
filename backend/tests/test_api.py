from fastapi.testclient import TestClient

from backend.app import app


VALID_APPLICANT = {
    "person_age": 32, "person_income": 65000, "person_home_ownership": "RENT",
    "person_emp_length": 5, "loan_intent": "PERSONAL", "loan_amnt": 12000,
    "loan_percent_income": 0.18, "cb_person_default_on_file": "N",
    "cb_person_cred_hist_length": 9, "loan_term_months": 36,
    "employment_type": "Full-time", "education_level": "Bachelor", "marital_status": "Single",
    "num_dependents": 1, "credit_score": 690, "credit_utilization_pct": 28,
    "num_open_accounts": 5, "num_late_payments_24m": 0, "num_hard_inquiries_6m": 1,
    "existing_monthly_debt": 450, "savings_balance": 6000, "has_co_applicant": False,
    "monthly_income": 5416.67, "est_monthly_payment": 390, "total_interest_cost": 2100,
    "debt_to_income_ratio": 0.19,
}


def test_health_and_prediction():
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        response = client.post("/predict", json=VALID_APPLICANT)
    assert response.status_code == 200
    body = response.json()
    assert body["prediction"] in {"Default", "No default"}
    assert 0 <= body["default_probability"] <= 1
    assert body["risk_level"] in {"Low", "Moderate", "High"}


def test_invalid_age_is_rejected():
    invalid = VALID_APPLICANT | {"person_age": 140}
    with TestClient(app) as client:
        response = client.post("/predict", json=invalid)
    assert response.status_code == 422
