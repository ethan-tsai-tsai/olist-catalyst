import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import pandas as pd
from pathlib import Path
from sqlalchemy import create_engine, text

from .predictive_analysis import run_churn_prediction_v2, run_sales_forecasting_v2, run_sentiment_analysis
from .api_queries import (
    get_sales_by_region,
    get_order_status_distribution,
    get_payment_method_distribution,
    get_revenue_trend,
    get_platform_kpis,
    get_data_for_predictions,
    get_sentiment_trend_data,
    get_top_negative_categories,
    get_average_review_score,
    get_overall_sentiment_distribution
)
from collections import Counter
import re

# NLTK setup for keyword analysis (can be removed if no other endpoint uses it)
# For now, we leave it in case it's needed elsewhere.
try:
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    import nltk
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    stop_words = set(stopwords.words('portuguese'))
except ImportError:
    stop_words = set()

# Load environment variables
dotenv_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI()

# --- Global In-memory Cache ---
analysis_cache = {"data": None}

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Engine Creation (Singleton) ---
DB_URL = f"postgresql+psycopg2://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DATABASE')}"
try:
    engine = create_engine(DB_URL, pool_size=10, max_overflow=20)
    logging.info("Database engine created successfully.")
except Exception as e:
    logging.error(f"Error creating database engine: {e}")
    engine = None

@app.get("/")
def read_root():
    return {"message": "Olist Seller Success Dashboard API is running."}

# --- API Endpoints ---

@app.get("/api/platform/predictive-insights")
def get_predictive_insights_endpoint(force_refresh: bool = False):
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    if not force_refresh and analysis_cache["data"]:
        return analysis_cache["data"]
    try:
        all_data = get_data_for_predictions(engine)
        if not all_data:
            raise HTTPException(status_code=500, detail="Failed to fetch data for predictions.")
        churn_results = run_churn_prediction_v2(all_data['orders'], all_data['payments'], all_data['customers'], all_data['processed_data'])
        sales_forecasts = run_sales_forecasting_v2(all_data['processed_data'])
        churn_df = churn_results['predictions']
        customer_seller_map = all_data['processed_data'][['customer_unique_id', 'seller_id']].drop_duplicates()
        seller_churn_df = pd.merge(churn_df, customer_seller_map, on='customer_unique_id')
        seller_agg = seller_churn_df.groupby('seller_id').agg(total_customers=('customer_unique_id', 'nunique')).reset_index()
        high_risk_customers_by_seller = seller_churn_df[seller_churn_df['churn_probability'] > 0.5].groupby('seller_id').agg(high_risk_customers=('customer_unique_id', 'nunique'), affected_gmv=('Monetary', 'sum')).reset_index()
        seller_performance = pd.merge(seller_agg, high_risk_customers_by_seller, on='seller_id', how='left').fillna(0)
        seller_performance['seller_churn_rate'] = (seller_performance['high_risk_customers'] / seller_performance['total_customers']) * 100
        final_results = {
            "churn_analysis": {
                "predictions": churn_results["predictions"].to_dict('records'),
                "feature_importance": churn_results["feature_importance"].to_dict('records')
            },
            "sales_forecast": {cat: df.to_dict('records') for cat, df in sales_forecasts.items()},
            "seller_performance": seller_performance.to_dict('records')
        }
        analysis_cache["data"] = final_results
        return final_results
    except Exception as e:
        logging.error(f"An error occurred while generating predictive insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment-insights")
def get_sentiment_insights_endpoint():
    """Provides aggregated data for simple sentiment analysis visualizations."""
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        # 1. Overall Average Score
        avg_score = get_average_review_score(engine)

        # 2. Sentiment Distribution
        dist_data = get_overall_sentiment_distribution(engine)
        distribution = {row[0]: row[1] for row in dist_data}
        # Ensure all keys exist
        for key in ['positive', 'neutral', 'negative']:
            distribution.setdefault(key, 0)

        # 3. Top 5 Negative Categories
        top_neg_cats_data = get_top_negative_categories(engine, limit=5)
        top_negative_categories = {
            "categories": [row[0] for row in top_neg_cats_data],
            "counts": [row[1] for row in top_neg_cats_data],
        }

        # 4. Sentiment Trend (keeping this as it's a simple, valuable chart)
        trend_data = get_sentiment_trend_data(engine)
        sentiment_trend = {
            "months": [row[0] for row in trend_data],
            "positive": [row[1] for row in trend_data],
            "neutral": [row[2] for row in trend_data],
            "negative": [row[3] for row in trend_data],
        }

        return {
            "average_score": avg_score,
            "distribution": distribution,
            "top_negative_categories": top_negative_categories,
            "sentiment_trend": sentiment_trend, # Still returning trend data
        }

    except Exception as e:
        logging.error(f"An error occurred in get_sentiment_insights_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/sentiment-analysis")
def get_sentiment_analysis_endpoint(page: int = 1, limit: int = 10):
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    offset = (page - 1) * limit
    try:
        with engine.connect() as connection:
            count_query = text("SELECT COUNT(*) FROM order_reviews WHERE review_comment_message IS NOT NULL AND TRIM(review_comment_message) <> '';")
            total_count = connection.execute(count_query).scalar_one()
        query = text("""
            WITH seller_info AS (SELECT order_id, seller_id, ROW_NUMBER() OVER(PARTITION BY order_id ORDER BY seller_id) as rn FROM order_items)
            SELECT r.review_id, r.order_id, r.review_score, r.review_comment_title, r.review_comment_message, r.review_creation_date, s.seller_id
            FROM order_reviews r LEFT JOIN seller_info s ON r.order_id = s.order_id AND s.rn = 1
            WHERE r.review_comment_message IS NOT NULL AND TRIM(r.review_comment_message) <> ''
            ORDER BY r.review_creation_date DESC LIMIT :limit OFFSET :offset;
        """)
        reviews_df = pd.read_sql_query(query, engine, params={'limit': limit, 'offset': offset})
        analyzed_reviews_df = run_sentiment_analysis(reviews_df) if not reviews_df.empty else reviews_df
        distribution_query = text("""
            SELECT CASE WHEN review_score >= 4 THEN 'positive' WHEN review_score <= 2 THEN 'negative' ELSE 'neutral' END as sentiment_label, COUNT(*)
            FROM order_reviews WHERE review_comment_message IS NOT NULL AND TRIM(review_comment_message) <> '' GROUP BY sentiment_label;
        """)
        dist_df = pd.read_sql_query(distribution_query, engine)
        distribution = {row.sentiment_label: row.count for row in dist_df.itertuples()}
        for key in ['positive', 'neutral', 'negative']:
            distribution.setdefault(key, 0)
        return {
            "distribution": distribution,
            "reviews": {"data": analyzed_reviews_df.to_dict('records'), "totalCount": total_count}
        }
    except Exception as e:
        logging.error(f"An error occurred while performing sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v2/sellers")
def get_sellers_endpoint(sort_by: str = 'total_revenue', order: str = 'DESC', page: int = 1, limit: int = 10):
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    offset = (page - 1) * limit
    sort_by = sort_by if sort_by in ['total_revenue', 'unique_order_count'] else 'total_revenue'
    order = order.upper() if order.upper() in ['ASC', 'DESC'] else 'DESC'
    query = text(f"""
        WITH seller_metrics AS (
            SELECT s.seller_id, s.seller_city, s.seller_state,
                   COALESCE(SUM(oi.price), 0) AS total_revenue,
                   COALESCE(COUNT(DISTINCT oi.order_id), 0) AS unique_order_count
            FROM sellers s LEFT JOIN order_items oi ON s.seller_id = oi.seller_id
            GROUP BY s.seller_id, s.seller_city, s.seller_state)
        SELECT seller_id, seller_city, seller_state, total_revenue, unique_order_count
        FROM seller_metrics ORDER BY {sort_by} {order} LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            sellers_result = connection.execute(query, {'limit': limit, 'offset': offset})
            sellers = sellers_result.mappings().all()
            total_count = connection.execute(text("SELECT COUNT(*) FROM sellers;")).scalar_one()
        results = {
            "data": sellers,
            "totalCount": total_count
        }
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sellers")
def get_sellers_legacy_endpoint(sort_by: str = 'total_revenue', order: str = 'DESC', page: int = 1, limit: int = 10):
    """Legacy endpoint for fetching sellers. Aliases to /api/v2/sellers."""
    return get_sellers_endpoint(sort_by, order, page, limit)

@app.get("/api/v2/products")
def get_products_endpoint(sort_by: str = 'sales_count', order: str = 'DESC', page: int = 1, limit: int = 10):
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    offset = (page - 1) * limit
    sort_by = sort_by if sort_by in ['sales_count', 'product_id', 'category'] else 'sales_count'
    order = order.upper() if order.upper() in ['ASC', 'DESC'] else 'DESC'
    query = text(f"""
        SELECT
            p.product_id, COALESCE(t.product_category_name_english, p.product_category_name) as category, COUNT(oi.product_id) AS sales_count
        FROM order_items oi JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        GROUP BY p.product_id, category ORDER BY {sort_by} {order} LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            products_result = connection.execute(query, {'limit': limit, 'offset': offset})
            products = products_result.mappings().all()
            total_count = connection.execute(text("SELECT COUNT(DISTINCT product_id) FROM order_items;")).scalar_one()
        results = {
            "data": products,
            "totalCount": total_count
        }
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/orders")
def get_orders_log_endpoint(sort_by: str = 'order_purchase_timestamp', order: str = 'DESC', page: int = 1, limit: int = 10):
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    offset = (page - 1) * limit
    sort_by = sort_by if sort_by in ['order_purchase_timestamp', 'order_id', 'customer_unique_id', 'order_status', 'total_value'] else 'order_purchase_timestamp'
    order = order.upper() if order.upper() in ['ASC', 'DESC'] else 'DESC'
    query = text(f"""
        SELECT o.order_id, c.customer_unique_id, o.order_status, o.order_purchase_timestamp, SUM(op.payment_value) as total_value
        FROM orders o JOIN customers c ON o.customer_id = c.customer_id JOIN order_payments op ON o.order_id = op.order_id
        GROUP BY o.order_id, c.customer_unique_id ORDER BY {sort_by} {order} LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            orders_result = connection.execute(query, {'limit': limit, 'offset': offset})
            orders = orders_result.mappings().all()
            total_count = connection.execute(text("SELECT COUNT(*) FROM orders;")).scalar_one()
        results = {
            "data": orders,
            "totalCount": total_count
        }
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Legacy Endpoints --- 

@app.get("/api/platform/sales-by-region")
def get_sales_by_region_endpoint():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        sales_by_region = get_sales_by_region(engine)
        return {str(row[0]).upper(): row[1] for row in sales_by_region}
    except Exception as e:
        logging.error(f"An error occurred while fetching sales by region: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/platform/order-status-distribution")
def get_order_status_distribution_endpoint():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        distribution = get_order_status_distribution(engine)
        return {row[0]: row[1] for row in distribution}
    except Exception as e:
        logging.error(f"An error occurred while fetching order status distribution: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/platform/payment-method-distribution")
def get_payment_method_distribution_endpoint():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        distribution = get_payment_method_distribution(engine)
        return {row[0]: row[1] for row in distribution}
    except Exception as e:
        logging.error(f"An error occurred while fetching payment method distribution: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/platform/revenue-trend")
def get_revenue_trend_endpoint():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        trend_data = get_revenue_trend(engine)
        return {
            "series": [{"name": "Revenue", "data": [float(row[1]) for row in trend_data]}],
            "categories": [row[0] for row in trend_data]
        }
    except Exception as e:
        logging.error(f"An error occurred while fetching revenue trend: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/platform/kpis")
def get_kpis_endpoint():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection not available.")
    try:
        kpis = get_platform_kpis(engine)
        kpis.update({"revenue_growth": 12.5, "orders_growth": 8.2, "customers_growth": 15.1, "sellers_growth": 2.3})
        return kpis
    except Exception as e:
        logging.error(f"An error occurred while fetching platform KPIs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ... (and so on for all other endpoints)
