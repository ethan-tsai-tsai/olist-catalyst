# -*- coding: utf-8 -*-
"""
FastAPI service to expose platform-level predictive insights.
"""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# Import the main pipeline function from our refactored script
from predictive_analysis import main as run_predictive_pipeline

# --- App Initialization ---
app = FastAPI(
    title="Olist Platform Insights API",
    description="Provides predictive analytics for platform operations.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allows the frontend (running on a different port) to communicate with this API
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

# --- In-memory Cache ---
# A simple cache to store the results of the expensive pipeline run.
# In a production environment, you would use a more robust solution like Redis.
analysis_cache = {
    "data": None
}

def format_data_for_json(data):
    """
    Recursively converts pandas DataFrames within the data structure to
    JSON-serializable format (list of dictionaries).
    """
    if isinstance(data, pd.DataFrame):
        return data.to_dict('records')
    
    if isinstance(data, dict):
        return {key: format_data_for_json(value) for key, value in data.items()}

    if isinstance(data, list):
        return [format_data_for_json(item) for item in data]
        
    return data

# --- API Endpoints ---
@app.get("/")
def read_root():
    """Root endpoint providing basic API information."""
    return {"message": "Welcome to the Olist Platform Insights API"}

@app.get("/api/platform/predictive-insights")
def get_predictive_insights(force_refresh: bool = False):
    """
    Runs the full predictive pipeline and returns the results.
    Results are cached in memory to avoid re-running the expensive analysis on every call.
    Use ?force_refresh=true to bypass the cache and re-run the analysis.
    """
    logger.info(f"Received request for predictive insights. Force refresh: {force_refresh}")

    if not force_refresh and analysis_cache["data"]:
        logger.info("Returning cached data.")
        return analysis_cache["data"]

    logger.info("Cache empty or refresh forced. Running the predictive pipeline...")
    
    # --- Paths to additional data needed for seller aggregation ---
    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parent
    DATA_DIR = BASE_DIR / "data"
    ORDERS_PATH = DATA_DIR / "olist_orders_dataset.csv"
    ORDER_ITEMS_PATH = DATA_DIR / "olist_order_items_dataset.csv"
    CUSTOMERS_PATH = DATA_DIR / "olist_customers_dataset.csv"

    # Run the analysis pipeline
    pipeline_results = run_predictive_pipeline()

    if not pipeline_results:
        logger.error("Predictive pipeline failed to return data.")
        raise HTTPException(status_code=500, detail="Analysis pipeline failed to produce results. Check server logs.")

    logger.info("Pipeline executed successfully. Starting seller performance aggregation.")

    # --- Seller Performance Aggregation ---
    try:
        # Load necessary files for mapping
        orders_df = pd.read_csv(ORDERS_PATH)
        order_items_df = pd.read_csv(ORDER_ITEMS_PATH)
        customers_df = pd.read_csv(CUSTOMERS_PATH)

        # Create mappings: customer_unique_id -> customer_id -> order_id -> seller_id
        customer_map = customers_df[['customer_id', 'customer_unique_id']]
        order_map = orders_df[['order_id', 'customer_id']]
        seller_map = order_items_df[['order_id', 'seller_id']].drop_duplicates()

        # Join mappings
        full_map = pd.merge(order_map, customer_map, on='customer_id')
        full_map = pd.merge(full_map, seller_map, on='order_id')
        # We only need the link between a unique customer and a seller they bought from
        customer_seller_map = full_map[['customer_unique_id', 'seller_id']].drop_duplicates()

        # Get churn predictions DataFrame
        churn_df = pipeline_results['churn_analysis']['predictions']
        
        # Merge churn data with the seller map
        seller_churn_df = pd.merge(churn_df, customer_seller_map, on='customer_unique_id')

        # Aggregate by seller
        seller_agg = seller_churn_df.groupby('seller_id').agg(
            total_customers=('customer_unique_id', 'nunique'),
            monetary_sum=('Monetary', 'sum')
        ).reset_index()

        high_risk_customers_by_seller = seller_churn_df[seller_churn_df['churn_probability'] > 0.5].groupby('seller_id').agg(
            high_risk_customers=('customer_unique_id', 'nunique'),
            affected_gmv=('Monetary', 'sum')
        ).reset_index()

        # Combine aggregations
        seller_performance = pd.merge(seller_agg, high_risk_customers_by_seller, on='seller_id', how='left').fillna(0)

        # Calculate churn rate
        seller_performance['seller_churn_rate'] = (seller_performance['high_risk_customers'] / seller_performance['total_customers']) * 100
        
        # Add to the results
        pipeline_results['seller_performance'] = seller_performance
        logger.info("Successfully aggregated seller performance data.")

    except FileNotFoundError as e:
        logger.error(f"Could not perform seller aggregation due to missing file: {e}")
        # Continue without seller performance data if files are not found
        pipeline_results['seller_performance'] = []

    # Convert pandas DataFrames to JSON-serializable format
    json_friendly_results = format_data_for_json(pipeline_results)
    
    # Cache the new results
    analysis_cache["data"] = json_friendly_results
    
    logger.info("Returning new data and updating cache.")
    return json_friendly_results

# To run this API, use the command in your terminal:
# uv run uvicorn platform_api:app --reload
