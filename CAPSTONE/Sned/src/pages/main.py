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
from typing import List, Optional
from datetime import datetime
import uuid

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

class ClassVolatilityRequest(BaseModel):
    # Mapping of student_id to their list of behavior logs
    student_logs: dict[str, list[str]]

class ClassVolatilityResponse(BaseModel):
    class_volatility_score: float
    student_breakdown: dict[str, float]

# IEP Request Schemas
class IEPRequest(BaseModel):
    id: Optional[str] = None
    parentName: str
    parentEmail: str
    studentName: str
    timestamp: Optional[str] = None
    status: str = "pending" # pending, approved, declined

class IEPStatusUpdate(BaseModel):
    status: str

# In-memory database para sa IEP requests
iep_requests_db: List[IEPRequest] = []

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

@app.get("/api/iep-requests", response_model=List[IEPRequest])
async def get_iep_requests():
    """Kunin ang lahat ng IEP requests para kay teacher."""
    return iep_requests_db

@app.post("/api/iep-requests", response_model=IEPRequest)
async def create_iep_request(request: IEPRequest):
    """Endpoint na tatawagin ng Parent App para mag-submit ng request."""
    request.id = str(uuid.uuid4())
    request.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    iep_requests_db.append(request)
    return request

@app.patch("/api/iep-requests/{request_id}")
async def update_iep_request(request_id: str, update: IEPStatusUpdate):
    """Update ang status (approve/decline) ng request."""
    for req in iep_requests_db:
        if req.id == request_id:
            req.status = update.status
            return {"message": f"Request {request_id} updated to {update.status}", "request": req}
    raise HTTPException(status_code=404, detail="Request not found")