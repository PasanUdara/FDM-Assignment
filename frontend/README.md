# Credence loan-risk interface

This is a dependency-free, responsive frontend for the FastAPI service in `../backend`.

1. Start the API from the project root: `uvicorn backend.app:app --reload`
2. In another terminal, start a static web server: `python -m http.server 5500 --directory frontend`
3. Visit `http://127.0.0.1:5500`.

The frontend has four pages: Home, EDA, Model Performance, and Risk Assessment. The EDA and model pages load the saved project charts through the API at `http://127.0.0.1:8000/assets` and `http://127.0.0.1:8000/results`.

The Risk Assessment page calls `http://127.0.0.1:8000/predict` and includes a sample applicant button for the live demonstration.
