from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
import os

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