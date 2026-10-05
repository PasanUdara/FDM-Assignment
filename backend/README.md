# Credit Risk Prediction Backend

The API serves the tuned XGBoost model used in the project and returns a default probability plus a plain-language risk level. It is decision support only, not an automatic loan decision.

## One-time setup

From the project root, activate the virtual environment and install the API dependencies:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m backend.build_preprocessor
```

`build_preprocessor.py` recreates the fitted scaler and feature metadata from the original preprocessing workflow, then saves `models/deployment_preprocessor.joblib`.

## Run

```powershell
uvicorn backend.app:app --reload
```

Open `http://127.0.0.1:8000/docs` to try the interactive API documentation. Run tests with:

```powershell
pytest backend/tests -q
```

The frontend may call `POST /predict`; a valid request schema and example are available in `/docs`.
