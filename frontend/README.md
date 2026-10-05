# Credence loan-risk interface

This is a dependency-free, responsive frontend for the FastAPI service in `../backend`.

1. Start the API from the project root: `uvicorn backend.app:app --reload`
2. In another terminal, start a static web server: `python -m http.server 5500 --directory frontend`
3. Visit `http://127.0.0.1:5500`.

The frontend calls `http://127.0.0.1:8000/predict`. It includes a sample applicant button for the live demonstration.
