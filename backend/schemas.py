"""API input and output contracts."""

from typing import Literal

from pydantic import BaseModel, Field


class ApplicantRequest(BaseModel):
    person_age: int = Field(ge=18, le=100)
    person_income: float = Field(gt=0)
    person_home_ownership: Literal["MORTGAGE", "OTHER", "OWN", "RENT"]
    person_emp_length: float | None = Field(default=None, ge=0, le=60)
    loan_intent: Literal["DEBTCONSOLIDATION", "EDUCATION", "HOMEIMPROVEMENT", "MEDICAL", "PERSONAL", "VENTURE"]
    loan_amnt: float = Field(gt=0)
    loan_percent_income: float = Field(ge=0, le=1)
    cb_person_default_on_file: Literal["N", "Y"]
    cb_person_cred_hist_length: float = Field(ge=0)
    loan_term_months: int = Field(ge=1, le=600)
    employment_type: Literal["Contract", "Full-time", "Part-time", "Retired", "Self-employed", "Unemployed", "Unknown"] | None = None
    education_level: Literal["Bachelor", "Diploma", "Doctorate", "High School", "Master", "Unknown"] | None = None
    marital_status: Literal["Divorced", "Married", "Single", "Widowed", "Unknown"] | None = None
    num_dependents: float | None = Field(default=None, ge=0)
    credit_score: float | None = Field(default=None, ge=0, le=1000)
    credit_utilization_pct: float | None = Field(default=None, ge=0, le=100)
    num_open_accounts: float | None = Field(default=None, ge=0)
    num_late_payments_24m: float | None = Field(default=None, ge=0)
    num_hard_inquiries_6m: float | None = Field(default=None, ge=0)
    existing_monthly_debt: float | None = Field(default=None, ge=0)
    savings_balance: float | None = Field(default=None, ge=0)
    has_co_applicant: bool
    monthly_income: float = Field(gt=0)
    est_monthly_payment: float | None = Field(default=None, ge=0)
    total_interest_cost: float | None = Field(default=None, ge=0)
    debt_to_income_ratio: float | None = Field(default=None, ge=0, le=1)


class PredictionResponse(BaseModel):
    prediction: Literal["Default", "No default"]
    default_probability: float = Field(ge=0, le=1)
    default_probability_percent: float = Field(ge=0, le=100)
    risk_level: Literal["Low", "Moderate", "High"]
    recommendation: str
    model: str
    disclaimer: str
