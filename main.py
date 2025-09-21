import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # Allow Next.js dev server
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Construct the direct database URL from environment variables
DB_URL = f"postgres://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DATABASE')}"

def get_db_connection():
    """Establishes a connection to the database."""
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

@app.get("/")
def read_root():
    return {"message": "Olist Seller Success Dashboard API is running."}


@app.get("/api/overview/{metric_name}")
def get_overview_metric(metric_name: str):
    """Fetch a specific pre-calculated metric for the platform overview."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT data_payload FROM platform_overview WHERE metric_name = %s", 
            (metric_name,)
        )
        
        result = cur.fetchone()
        cur.close()
        
        if result:
            return result[0]  # Return the JSONB data_payload
        else:
            raise HTTPException(status_code=404, detail=f"Metric '{metric_name}' not found")
            
    except HTTPException as e:
        raise e # Re-raise HTTPException
    except Exception as e:
        print(f"An error occurred while fetching metric '{metric_name}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()


@app.get("/api/sellers/{seller_id}/{metric_name}")
def get_seller_metric(seller_id: str, metric_name: str):
    """Fetch a specific metric for a given seller. MOCK IMPLEMENTATION."""
    # This is a mock implementation. In a real scenario, you would query
    # the 'seller_profiles' table based on seller_id and metric_name.
    # For now, we return pre-existing sample data to connect the frontend.
    
    print(f"Fetching mock data for seller '{seller_id}', metric '{metric_name}'")

    # Reuse data from platform_overview for demonstration purposes
    if metric_name == "rfm_customer_segments":
        # RFM chart is a scatter plot, reuse bubble chart data structure
        metric_to_fetch = "product_potential_matrix"
    elif metric_name == "association_rules_graph":
        # Association rules is a graph, reuse sankey data structure
        metric_to_fetch = "customer_journey_sankey"
    else:
        # Default to a known metric if no specific mapping
        metric_to_fetch = "sales_trend"

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT data_payload FROM platform_overview WHERE metric_name = %s", (metric_to_fetch,))
        result = cur.fetchone()
        cur.close()
        if result:
            return result[0]
        else:
            raise HTTPException(status_code=404, detail=f"Mock data for metric '{metric_name}' not found")
    finally:
        if conn:
            conn.close()

@app.get("/api/platform-averages/{metric_name}")
def get_platform_average(metric_name: str):
    """Fetch a platform average metric. MOCK IMPLEMENTATION."""
    # Mock data for gauge and box plot comparisons
    if metric_name == "shipping_stats":
        return {"series": [{"type": "boxPlot", "data": [{"x": "Platform Average", "y": [2, 4, 5, 8, 12]}]}]}
    elif metric_name == "average_rating":
        return {"series": [4.2]}
    else:
        raise HTTPException(status_code=404, detail=f"Platform average for '{metric_name}' not found")