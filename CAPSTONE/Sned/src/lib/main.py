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
import os
import numpy as np

app = FastAPI(title="SNED Behavior AI Service")

# Enable CORS so your Vite frontend (port 8080) can access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://0.0.0.0:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # In a production scenario, you would pass these logs into an LSTM or Facebook Prophet model.
    # Here we simulate the output of a Time-Series trend analysis.
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