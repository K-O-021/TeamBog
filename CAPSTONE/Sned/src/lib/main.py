from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MultiLabelBinarizer
import os
import sys
import pickle
import json
import numpy as np

# Use abspath so the path is correct regardless of where uvicorn is launched from
ML_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
if ML_MODEL_DIR not in sys.path:
    sys.path.insert(0, ML_MODEL_DIR)

try:
    from recommend import build_recommendation as _build_recommendation
    _RECOMMEND_AVAILABLE = True
    print(f"✅ recommend.py loaded from {ML_MODEL_DIR}")
except Exception as _rec_err:
    _RECOMMEND_AVAILABLE = False
    print(f"⚠  recommend.py failed to load: {_rec_err}")

# MultiLabelEncoder must be defined here so pickle can deserialize stored encoders
class MultiLabelEncoder:
    def __init__(self, classes):
        self.classes = classes
        self.mlb = MultiLabelBinarizer(classes=classes)

    def fit_transform(self, series):
        return self.mlb.fit_transform(series)

    def transform(self, series):
        return self.mlb.transform(series)

    @property
    def feature_names(self):
        return list(self.mlb.classes_)

_ML_ARTIFACTS = None

class _FixedUnpickler(pickle.Unpickler):
    """Resolves MultiLabelEncoder regardless of the module it was pickled from."""
    def find_class(self, module, name):
        if name == "MultiLabelEncoder":
            return MultiLabelEncoder
        return super().find_class(module, name)

def _load_pickle(path):
    with open(path, "rb") as f:
        return _FixedUnpickler(f).load()

def _get_ml_artifacts():
    global _ML_ARTIFACTS
    if _ML_ARTIFACTS is not None:
        return _ML_ARTIFACTS
    model_dir = os.path.join(ML_MODEL_DIR, "ml_model")
    ml_model = _load_pickle(os.path.join(model_dir, "model.pkl"))
    le       = _load_pickle(os.path.join(model_dir, "label_encoder.pkl"))
    encoders = _load_pickle(os.path.join(model_dir, "feature_encoders.pkl"))
    with open(os.path.join(model_dir, "meta.json"), "r") as f:
        meta = json.load(f)
    _ML_ARTIFACTS = (ml_model, le, encoders, meta)
    return _ML_ARTIFACTS

_MULTI_SELECT_COLS = ["interventions_applied", "positive_indicators", "negative_indicators"]

def _build_features(df, encoders):
    parts = [df[["participation_level"]].values.astype(float)]
    parts.append(encoders["ohe_mood"].transform(df[["mood"]].values))
    parts.append(encoders["ohe_incident"].transform(df[["incident_report"]].values))
    for col, enc in encoders["mlb_map"].items():
        parts.append(enc.transform(df[col]))
    parts.append(encoders["tfidf_obs"].transform(df["observation_text"]).toarray())
    parts.append(encoders["tfidf_remark"].transform(df["teacher_remarks"]).toarray())
    return np.hstack(parts).astype(float)

app = FastAPI(title="SNED Behavior AI Service")

# Enable the CORS so the Vite frontend (port 8000) can access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre load the SVM model at startup so the first request is not slow
try:
    _get_ml_artifacts()
except Exception as _e:
    print(f"⚠  AI model failed to load: {_e}")

MODEL_FILE = "behavior_model.pkl"

class BehaviorRequest(BaseModel):
    description: str

class BehaviorResponse(BaseModel):
    type: str  # Positive, Attention Needed, Concerning
    risk_level: str  # Low, Moderate, High
    confidence: float

class PredictRiskRequest(BaseModel):
    student_logs: list[dict]

class PredictRiskResponse(BaseModel):
    forecast: list[dict]  # { "day": "Mon", "riskScore": 45 }
    alert: str | None
    early_intervention_advice: str

class RecommendationRequest(BaseModel):
    behavior_description: str
    student_context: str = "Special Needs"

class RecommendationResponse(BaseModel):
    steps: list[str]
    rationale: str
    professional_script: str

class ClassVolatilityRequest(BaseModel):
    # Mapping of student_id to their list of behavior logs
    student_logs: dict[str, list[str]]

class ClassVolatilityResponse(BaseModel):
    class_volatility_score: float
    student_breakdown: dict[str, float]

def train_and_save_model():
    """Simple initial training to ensure the API has a model to load."""
    data = {
        'text': [
            "Shared toys with friend", "Shouted at teacher", "Sat quietly", 
            "Hit a classmate", "Helped clean up", "Refused to follow instructions"
        ],
        'type': ['Positive', 'Concerning', 'Attention Needed', 'Concerning', 'Positive', 'Attention Needed'],
        'risk': ['Low', 'High', 'Moderate', 'High', 'Low', 'Moderate']
    }
    df = pd.DataFrame(data)
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', MultiOutputClassifier(RandomForestClassifier(n_estimators=100)))
    ])
    pipeline.fit(df['text'], df[['type', 'risk']])
    joblib.dump(pipeline, MODEL_FILE)
    return pipeline

# Load the model on startup
if not os.path.exists(MODEL_FILE):
    model = train_and_save_model()
else:
    model = joblib.load(MODEL_FILE)

@app.post("/api/classify", response_model=BehaviorResponse)
async def classify(request: BehaviorRequest):
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description is required")
    
    # Perform prediction
    prediction = model.predict([request.description])
    # Get probability for confidence (taking the average of the two outputs)
    probs = model.predict_proba([request.description])
    confidence = (max(probs[0][0]) + max(probs[1][0])) / 2

    return {
        "type": prediction[0][0],
        "risk_level": prediction[0][1],
        "confidence": round(float(confidence), 2)
    }

@app.post("/api/class-volatility", response_model=ClassVolatilityResponse)
async def calculate_class_volatility(request: ClassVolatilityRequest):
    if not request.student_logs:
        return {"class_volatility_score": 0.0, "student_breakdown": {}}
    
    tfidf = model.named_steps['tfidf']
    student_scores = {}
    
    for student_id, logs in request.student_logs.items():
        # We need at least 4 logs to identify a mathematical outlier
        if len(logs) < 4:
            student_scores[student_id] = 0.0
            continue
            
        try:
            X = tfidf.transform(logs).toarray()
            # Fit Isolation Forest on the student's specific log cluster
            iso = IsolationForest(contamination=0.1, random_state=42)
            # -1 indicates an outlier (anomaly), 1 indicates normal
            predictions = iso.fit_predict(X)
            
            anomaly_count = np.count_nonzero(predictions == -1)
            student_scores[student_id] = round((anomaly_count / len(logs)) * 100, 2)
        except Exception:
            student_scores[student_id] = 0.0
            
    overall_avg = sum(student_scores.values()) / len(student_scores) if student_scores else 0.0
    
    return {
        "class_volatility_score": round(overall_avg, 2),
        "student_breakdown": student_scores
    }

@app.post("/api/predict-risk", response_model=PredictRiskResponse)
async def predict_risk(request: PredictRiskRequest):
    # This is just the  placeholder output of a Time-Series trend analysis.
    return {
        "forecast": [
            {"day": "Mon", "riskScore": 25},
            {"day": "Tue", "riskScore": 40},
            {"day": "Wed", "riskScore": 55},
            {"day": "Thu", "riskScore": 82},
            {"day": "Fri", "riskScore": 30}
        ],
        "alert": "Pattern alert: High-risk behavior trends detected for Thursday afternoons.",
        "early_intervention_advice": "Based on patterns, high-risk behavior is likely tomorrow afternoon. Suggest scheduled sensory breaks at 1:30 PM."
    }

class MLRecommendRequest(BaseModel):
    student_name: str = ""
    subject: str = "Mathematics"
    observation_text: str
    mood: str
    participation_level: int
    incident_report: str
    interventions_applied: list[str] = []
    positive_indicators: list[str] = []
    negative_indicators: list[str] = []
    teacher_remarks: str = ""

class MLTop3Item(BaseModel):
    category: str
    confidence: float

class MLRecommendResponse(BaseModel):
    category: str
    confidence: float
    recommendation: str
    top3: list[MLTop3Item]

@app.post("/api/ml-recommend", response_model=MLRecommendResponse)
def ml_recommend(request: MLRecommendRequest):
    try:
        ml_model, le, encoders, _ = _get_ml_artifacts()

        row = {
            "observation_text": request.observation_text or "",
            "mood": request.mood,
            "participation_level": int(request.participation_level),
            "incident_report": request.incident_report,
            "interventions_applied": tuple(request.interventions_applied),
            "positive_indicators": tuple(request.positive_indicators),
            "negative_indicators": tuple(request.negative_indicators),
            "teacher_remarks": request.teacher_remarks or "",
        }

        df_single = pd.DataFrame([row])
        df_single["participation_level"] = df_single["participation_level"].astype(int)

        X = _build_features(df_single, encoders)
        pred_idx = ml_model.predict(X)[0]
        pred_label = le.inverse_transform([pred_idx])[0]

        proba = ml_model.predict_proba(X)[0] if hasattr(ml_model, "predict_proba") else None
        confidence = round(float(proba[pred_idx]) * 100, 1) if proba is not None else 0.0

        top3 = []
        if proba is not None:
            for idx, prob in sorted(enumerate(proba), key=lambda x: -x[1])[:3]:
                top3.append({"category": le.inverse_transform([idx])[0], "confidence": round(float(prob) * 100, 1)})

        inputs = {"student_name": request.student_name, "subject": request.subject, **row}
        if _RECOMMEND_AVAILABLE:
            recommendation = _build_recommendation(pred_label, inputs)
        else:
            recommendation = f"{request.student_name or 'The student'} requires follow-up based on today's session."

        return {"category": pred_label, "confidence": confidence, "recommendation": recommendation, "top3": top3}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/get-recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    # This simulates a call to an LLM (Gemini/GPT). 
    # It processes the specific behavior and returns a professional script.
    desc = request.behavior_description.lower()
    
    if "loud" in desc or "noise" in desc:
        return {
            "steps": [
                "1. Provide noise-canceling headphones immediately.",
                "2. Move student to a pre-designated 'Quiet Zone'.",
                "3. Use a 'dimmer' light setting if possible.",
                "4. Use visual cards to communicate until auditory stress subsides."
            ],
            "rationale": "Student exhibits hypersensitivity to auditory stimuli. Sensory overload is the primary antecedent.",
            "professional_script": "Teacher should say: 'It is a bit loud in here. Let's use our headphones and find a quiet space for five minutes.'"
        }
    
    return {
        "steps": [
            "1. Positive reinforcement of on-task peers.",
            "2. Proximity control: move closer to the student.",
            "3. Offer a choice of two preferred activities."
        ],
        "rationale": "General escalation detected. Redirection via choice-making increases student autonomy.",
        "professional_script": "Teacher should say: 'I see you're struggling. Would you like to finish the math on your tablet or using the blocks?'"
    }