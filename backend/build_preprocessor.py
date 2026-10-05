"""Create the fitted preprocessing artifact needed by the API.

Run from the project root: .\\venv\\Scripts\\python.exe -m backend.build_preprocessor
"""

from backend.preprocessing import ARTIFACT_PATH, build_preprocessor_artifact


if __name__ == "__main__":
    artifact = build_preprocessor_artifact()
    print(f"Saved {ARTIFACT_PATH} with {len(artifact['feature_columns'])} features.")
