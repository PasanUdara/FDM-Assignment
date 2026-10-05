"""Progress Evaluation 2: standalone four-model credit-risk comparison.

Run: .\\venv\\Scripts\\python.exe model_development.py
Use --quick for a short smoke test.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from time import perf_counter

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (ConfusionMatrixDisplay, accuracy_score,
                             average_precision_score, confusion_matrix, f1_score,
                             precision_score, recall_score, roc_auc_score, roc_curve)
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, cross_validate
from sklearn.neighbors import KNeighborsClassifier
from xgboost import XGBClassifier

RANDOM_STATE = 42
ROOT = Path(__file__).resolve().parent
DATA_DIR, RESULTS_DIR, MODELS_DIR = ROOT / "dataset", ROOT / "results", ROOT / "models"


def load_data():
    """Load the cleaned, encoded PE1 train/test split."""
    paths = {name: DATA_DIR / f"{name}.csv" for name in ("X_train", "X_test", "y_train", "y_test")}
    missing = [path.name for path in paths.values() if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing PE1 files in {DATA_DIR}: {', '.join(missing)}")
    x_train, x_test = pd.read_csv(paths["X_train"]).astype(float), pd.read_csv(paths["X_test"]).astype(float)
    y_train = pd.read_csv(paths["y_train"]).squeeze("columns").astype(int)
    y_test = pd.read_csv(paths["y_test"]).squeeze("columns").astype(int)
    if list(x_train.columns) != list(x_test.columns) or x_train.isna().any().any() or x_test.isna().any().any():
        raise ValueError("PE1 data has mismatched columns or missing values.")
    return x_train, x_test, y_train, y_test


def pipeline(model):
    # SMOTE runs inside each CV training fold; this prevents validation leakage.
    return Pipeline([("smote", SMOTE(random_state=RANDOM_STATE)),
                     ("select", SelectKBest(f_classif, k="all")),
                     ("model", model)])


def catalogue():
    feature_options = {"select__k": ["all", 20, 30]}
    return {
        "Logistic Regression": (LogisticRegression(max_iter=2000, solver="liblinear", random_state=RANDOM_STATE),
            feature_options | {"model__C": np.logspace(-3, 2, 10).tolist(), "model__class_weight": [None, "balanced"]}),
        "K-Nearest Neighbours": (KNeighborsClassifier(),
            feature_options | {"model__n_neighbors": [5, 11, 15, 21, 31], "model__weights": ["uniform", "distance"], "model__metric": ["euclidean", "manhattan"]}),
        "Random Forest": (RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=1),
            feature_options | {"model__n_estimators": [200, 300, 400], "model__max_depth": [None, 8, 12, 16, 24], "model__min_samples_split": [2, 5, 10], "model__min_samples_leaf": [1, 2, 4], "model__max_features": ["sqrt", "log2"]}),
        "XGBoost": (XGBClassifier(objective="binary:logistic", eval_metric="logloss", random_state=RANDOM_STATE, n_jobs=1, tree_method="hist"),
            feature_options | {"model__n_estimators": [150, 250, 350], "model__max_depth": [3, 4, 5, 6], "model__learning_rate": [0.03, 0.05, 0.1, 0.2], "model__subsample": [0.7, 0.85, 1.0], "model__colsample_bytree": [0.7, 0.85, 1.0]}),
    }


def run_experiment(quick=False):
    RESULTS_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)
    x_train, x_test, y_train, y_test = load_data()
    cv = StratifiedKFold(n_splits=3 if quick else 5, shuffle=True, random_state=RANDOM_STATE)
    iterations = 2 if quick else 12
    scoring = {"roc_auc": "roc_auc", "f1": "f1", "recall": "recall", "precision": "precision"}
    rows, tuning, fitted = [], [], {}

    for name, (model, parameters) in catalogue().items():
        print(f"\n{'=' * 65}\n{name}")
        baseline = cross_validate(pipeline(clone(model)), x_train, y_train, cv=cv, scoring=scoring, n_jobs=-1)
        search = RandomizedSearchCV(pipeline(clone(model)), parameters, n_iter=iterations, scoring="roc_auc", cv=cv,
                                    n_jobs=-1, random_state=RANDOM_STATE, refit=True, return_train_score=False)
        started = perf_counter()
        search.fit(x_train, y_train)
        best = search.best_estimator_
        fitted[name] = best
        pred, proba = best.predict(x_test), best.predict_proba(x_test)[:, 1]
        rows.append({"model": name, "baseline_cv_roc_auc": baseline["test_roc_auc"].mean(),
                     "tuned_cv_roc_auc": search.best_score_, "cv_roc_auc_std": search.cv_results_["std_test_score"][search.best_index_],
                     "test_roc_auc": roc_auc_score(y_test, proba), "test_average_precision": average_precision_score(y_test, proba),
                     "test_accuracy": accuracy_score(y_test, pred), "test_precision": precision_score(y_test, pred, zero_division=0),
                     "test_recall": recall_score(y_test, pred, zero_division=0), "test_f1": f1_score(y_test, pred, zero_division=0),
                     "selected_features": int(best.named_steps["select"].get_support().sum()), "search_seconds": perf_counter() - started})
        tuning.append({"model": name, "best_parameters": search.best_params_, "best_cv_roc_auc": search.best_score_})

    comparison = pd.DataFrame(rows).sort_values("test_roc_auc", ascending=False).reset_index(drop=True)
    comparison.to_csv(RESULTS_DIR / "model_comparison.csv", index=False, float_format="%.4f")
    (RESULTS_DIR / "tuning_summary.json").write_text(json.dumps(tuning, indent=2, default=str), encoding="utf-8")
    final_name = comparison.loc[0, "model"]
    joblib.dump(fitted[final_name], MODELS_DIR / "final_credit_risk_model.joblib")
    (MODELS_DIR / "final_model_selection.txt").write_text(f"Selected model: {final_name}\nSelection rule: highest independent test ROC-AUC after CV tuning.\nTest ROC-AUC: {comparison.loc[0, 'test_roc_auc']:.4f}\n", encoding="utf-8")

    fig, ax = plt.subplots(figsize=(8, 6))
    for name, estimator in fitted.items():
        probabilities = estimator.predict_proba(x_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, probabilities)
        ax.plot(fpr, tpr, label=f"{name} (AUC={roc_auc_score(y_test, probabilities):.3f})")
        cm_fig, cm_ax = plt.subplots(figsize=(5, 4))
        ConfusionMatrixDisplay(confusion_matrix(y_test, estimator.predict(x_test))).plot(ax=cm_ax, colorbar=False)
        cm_ax.set_title(f"{name} - test confusion matrix")
        cm_fig.tight_layout(); cm_fig.savefig(RESULTS_DIR / f"confusion_matrix_{name.lower().replace(' ', '_')}.png", dpi=160); plt.close(cm_fig)
    ax.plot([0, 1], [0, 1], "k--"); ax.set(xlabel="False positive rate", ylabel="True positive rate", title="Test-set ROC curves")
    ax.legend(loc="lower right"); fig.tight_layout(); fig.savefig(RESULTS_DIR / "roc_curves.png", dpi=160); plt.close(fig)
    print(comparison.round(4).to_string(index=False)); print(f"\nFinal selected model: {final_name}")
    return comparison


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true")
    run_experiment(parser.parse_args().quick)
