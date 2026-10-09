# Credit Risk Prediction Project

This project contains a FastAPI backend for credit-risk prediction and a dependency-free frontend for submitting applicant assessments.

## Requirements

- Python 3.10 or newer
- PowerShell on Windows

## First-time setup

Open PowerShell in the project root:

```powershell
cd C:\Users\pasan\OneDrive\Desktop\SLIIT\FDM
```

Create a virtual environment, activate it, and install the backend dependencies:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Create the preprocessing artifact required by the API:

```powershell
python -m backend.build_preprocessor
```

The model artifact is already stored in `models\final_credit_risk_model.joblib`.

## Run the backend

In the first PowerShell terminal, from the project root, run:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn backend.app:app --reload
```

The backend will run at:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

Keep this terminal running.

## Run the frontend

Open a second PowerShell terminal and run:

```powershell
cd C:\Users\pasan\OneDrive\Desktop\SLIIT\FDM
python -m http.server 5500 --directory frontend
```

Open the application at:

http://127.0.0.1:5500

The frontend sends prediction requests to `http://127.0.0.1:8000/predict`.

## Run tests

From the project root, with the virtual environment activated:

```powershell
pytest backend\tests -q
```

Or run the test command without activating the environment:

```powershell
.\venv\Scripts\pytest.exe backend\tests -q
```

## PowerShell activation issue

If PowerShell prevents activation, allow it only for the current terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```

## Stop the application

Press `Ctrl+C` in each terminal running the backend or frontend server.
