# -*- coding: utf-8 -*-
"""
FastAPI service to expose business intelligence insights.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- App Initialization ---
app = FastAPI(
    title="Olist Business Insights API",
    description="Provides business intelligence insights.",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Endpoints ---
@app.get("/")
def read_root():
    """Root endpoint providing basic API information."""
    return {"message": "Welcome to the Olist Business Insights API"}

@app.get("/api/business/sentiment-distribution")
def get_sentiment_distribution():
    """Returns the distribution of customer sentiment."""
    logger.info("Received request for sentiment distribution.")
    # In a real application, this data would be fetched from a database or
    # calculated by a data processing pipeline.
    dummy_data = {
        "positive": 100,
        "neutral": 50,
        "negative": 20
    }
    return dummy_data

# To run this API, use the command in your terminal:
# uv run uvicorn business_api:app --reload
