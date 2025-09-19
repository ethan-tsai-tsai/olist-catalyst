# -*- coding: utf-8 -*-
"""
Olist Seller Success - Stage 3: Predictive Intelligence (v3 - Advanced)

This script implements advanced predictive analytics models:
1.  Customer Churn Prediction with advanced features, hyperparameter tuning,
    and feature importance analysis.
2.  Sales Forecasting with holiday effects as external regressors.

Patch Notes (v3):
- Churn Model: Added 'Purchase_Diversity' feature. Implemented GridSearchCV for
  hyperparameter tuning. Added feature importance analysis.
- Sales Forecast: Added Brazilian holidays as an external regressor to Prophet.
"""

# --- 1. Setup and Configuration ---
import logging
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ML & Forecasting Imports
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler
from prophet import Prophet

# --- Paths & Parameters ---
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"

# Input files
ORDERS_PATH = DATA_DIR / "olist_orders_dataset.csv"
PAYMENTS_PATH = DATA_DIR / "olist_order_payments_dataset.csv"
CUSTOMERS_PATH = DATA_DIR / "olist_customers_dataset.csv"
PROCESSED_DATA_PATH = DATA_DIR / "olist_processed_dataset.csv"

CHURN_DAYS_THRESHOLD = 180
FORECAST_PERIOD_DAYS = 30
TOP_N_CATEGORIES_FOR_FORECAST = 3 # Reduced for faster execution in demo

# --- Logging Setup ---
def setup_logging():
    """Configures logging for the script."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(OUTPUT_DIR / 'predictive_analysis_advanced.log', mode='w')
        ]
    )

def load_data(file_path: Path) -> pd.DataFrame | None:
    """Loads a CSV file from the given path with error handling."""
    try:
        df = pd.read_csv(file_path)
        logging.info(f"Successfully loaded data from {file_path}")
        return df
    except FileNotFoundError:
        logging.error(f"File not found: {file_path}")
        return None

# --- 2. Predictive Functions ---

def run_churn_prediction_v2(orders_df, payments_df, customers_df, processed_df):
    """Builds an advanced churn prediction model with tuning and feature importance."""
    logging.info("--- Starting Advanced Customer Churn Prediction (v2) ---")

    # 1. RFM Feature Engineering
    df_rfm = pd.merge(orders_df, payments_df, on='order_id')
    df_rfm = pd.merge(df_rfm, customers_df, on='customer_id')
    df_rfm['order_purchase_timestamp'] = pd.to_datetime(df_rfm['order_purchase_timestamp'])
    snapshot_date = df_rfm['order_purchase_timestamp'].max() + pd.Timedelta(days=1)

    rfm = df_rfm.groupby('customer_unique_id').agg({
        'order_purchase_timestamp': lambda date: (snapshot_date - date.max()).days,
        'order_id': 'nunique',
        'payment_value': 'sum'
    })
    rfm.rename(columns={
        'order_purchase_timestamp': 'Recency',
        'order_id': 'Frequency',
        'payment_value': 'Monetary'
    }, inplace=True)

    # 2. Advanced Feature: Purchase Diversity
    diversity = processed_df.groupby('customer_unique_id')['product_category_name_english'].nunique().reset_index()
    diversity.rename(columns={'product_category_name_english': 'Purchase_Diversity'}, inplace=True)
    
    features_df = pd.merge(rfm, diversity, on='customer_unique_id', how='left').fillna(0)

    # 3. Label Definition
    features_df['is_churn'] = (features_df['Recency'] > CHURN_DAYS_THRESHOLD).astype(int)

    # 4. Model Training with Hyperparameter Tuning
    X = features_df[['Recency', 'Frequency', 'Monetary', 'Purchase_Diversity']]
    y = features_df['is_churn']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

    logging.info("Starting GridSearchCV for RandomForestClassifier... (This may take a while)")
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_leaf': [1, 5, 10]
    }
    
    # Using a smaller subset for faster grid search in a demo context
    # In a real scenario, you'd use the full dataset.
    # X_train_sample, _, y_train_sample, _ = train_test_split(X_train, y_train, train_size=0.1, random_state=42, stratify=y_train)

    grid_search = GridSearchCV(estimator=RandomForestClassifier(random_state=42, class_weight='balanced'), 
                               param_grid=param_grid, cv=3, n_jobs=-1, verbose=2, scoring='f1_weighted')
    grid_search.fit(X_train, y_train)

    logging.info(f"Best parameters found by GridSearchCV: {grid_search.best_params_}")
    best_model = grid_search.best_estimator_

    # 5. Evaluation
    y_pred = best_model.predict(X_test)
    report = classification_report(y_test, y_pred)
    logging.info(f"Tuned Churn Prediction Model Classification Report:\n{report}")

    # 6. Feature Importance Analysis
    importance_df = pd.DataFrame({
        'Feature': X.columns,
        'Importance': best_model.feature_importances_
    }).sort_values(by='Importance', ascending=False)
    logging.info(f"Feature Importances:\n{importance_df}")

    # 7. Output High-Risk Customers
    features_df['churn_probability'] = best_model.predict_proba(X_scaled)[:, 1]
    high_risk_customers = features_df[(features_df['is_churn'] == 0) & (features_df['churn_probability'] > 0.5)]
    output_path = OUTPUT_DIR / "churn_candidates_v2.csv"
    high_risk_customers.to_csv(output_path)
    logging.info(f"Found {len(high_risk_customers)} high-risk customers with tuned model. List saved to {output_path}")

def run_sales_forecasting_v2(processed_df: pd.DataFrame):
    """Runs sales forecasting with holiday effects."""
    logging.info("--- Starting Advanced Sales Forecasting (v2) ---")

    df = processed_df.copy()
    df['order_purchase_timestamp'] = pd.to_datetime(df['order_purchase_timestamp'])
    
    top_categories = df.groupby('product_category_name_english')['price'].sum().nlargest(TOP_N_CATEGORIES_FOR_FORECAST).index
    logging.info(f"Forecasting for top {TOP_N_CATEGORIES_FOR_FORECAST} categories: {top_categories.tolist()}")

    for category in top_categories:
        logging.info(f"--- Forecasting for category: {category} ---")
        category_sales = df[df['product_category_name_english'] == category].copy()
        daily_sales = category_sales.set_index('order_purchase_timestamp').resample('D')['price'].sum().reset_index()
        daily_sales.rename(columns={'order_purchase_timestamp': 'ds', 'price': 'y'}, inplace=True)

        # Initialize model and add Brazilian holidays
        model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        model.add_country_holidays(country_name='BR')
        model.fit(daily_sales)

        future = model.make_future_dataframe(periods=FORECAST_PERIOD_DAYS)
        forecast = model.predict(future)

        fig = model.plot(forecast)
        plt.title(f"Sales Forecast for '{category}' with Holiday Effects")
        sanitized_category_name = category.replace('_', '-')
        output_path = OUTPUT_DIR / f"forecast_v2_{sanitized_category_name}.png"
        plt.savefig(output_path, bbox_inches='tight')
        plt.close()
        logging.info(f"Advanced forecast plot for '{category}' saved to {output_path}")

# --- 3. Main Execution ---

def main():
    """Main function to orchestrate the predictive analysis pipeline."""
    setup_logging()
    logging.info("====== Starting Olist Predictive Analysis Pipeline (Advanced) ======")
    
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Load all necessary data once
    orders = load_data(ORDERS_PATH)
    payments = load_data(PAYMENTS_PATH)
    customers = load_data(CUSTOMERS_PATH)
    processed_data = load_data(PROCESSED_DATA_PATH)

    if all(df is not None for df in [orders, payments, customers, processed_data]):
        run_churn_prediction_v2(orders, payments, customers, processed_data)
        run_sales_forecasting_v2(processed_data)
    else:
        logging.error("Skipping predictive analysis due to missing data.")

    logging.info("====== Predictive Analysis Pipeline Finished Successfully ======")

if __name__ == "__main__":
    main()
