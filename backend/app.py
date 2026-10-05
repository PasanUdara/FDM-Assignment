"""FastAPI service for the IT3051 credit-risk prediction demo."""

from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.preprocessing import ROOT, load_preprocessor, transform_applicant
from backend.schemas import ApplicantRequest, PredictionResponse


MODEL_PATH = ROOT / "models" / "final_credit_risk_model.joblib"
app = FastAPI(title="Credit Risk Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["GET", "POST"], allow_headers=["*"],
)

model = None
preprocessor = None


@app.on_event("startup")
def load_artifacts() -> None:
    global model, preprocessor
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model artifact not found: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    preprocessor = load_preprocessor()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok" if model is not None and preprocessor is not None else "starting"}


@app.post("/predict", response_model=PredictionResponse)
def predict(applicant: ApplicantRequest) -> PredictionResponse:
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model is still loading.")
    features = transform_applicant(applicant.model_dump(), preprocessor)
    probability = float(model.predict_proba(features)[0, 1])
    prediction = "Default" if probability >= 0.5 else "No default"
    risk_level = "Low" if probability < 0.30 else "Moderate" if probability < 0.60 else "High"
    recommendation = (
        "Refer for enhanced review before making a lending decision."
        if risk_level == "High" else
        "Review supporting evidence and lending terms carefully."
        if risk_level == "Moderate" else
        "Proceed with normal lending review; this is a decision-support result."
    )
    return PredictionResponse(
        prediction=prediction, default_probability=round(probability, 4),
        default_probability_percent=round(probability * 100, 2), risk_level=risk_level,
        recommendation=recommendation, model="Tuned XGBoost",
        disclaimer="For decision support only; a loan officer must make the final lending decision.",
    )
