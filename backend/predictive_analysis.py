# -*- coding: utf-8 -*-
"""
Olist Seller Success - Stage 3: Predictive Intelligence (v5 - Pure Logic)

This script contains only the pure Python logic for running predictive models.
Data fetching is handled separately.

Patch Notes (v5):
- Removed all data loading and Supabase-specific logic.
- The script now only contains pure functions for predictive analysis.
"""

# --- 1. Setup and Configuration ---
import logging
import pandas as pd

# ML & Forecasting Imports
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from prophet import Prophet

# --- Parameters ---
CHURN_DAYS_THRESHOLD = 180
FORECAST_PERIOD_DAYS = 30
TOP_N_CATEGORIES_FOR_FORECAST = 3

# --- 2. Predictive Functions ---

def run_churn_prediction_v2(orders_df, payments_df, customers_df, processed_df):
    """Builds an advanced churn prediction model with tuning and feature importance."""
    logging.info("--- Starting Advanced Customer Churn Prediction (v2) ---")

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

    diversity = processed_df.groupby('customer_unique_id')['product_category_name_english'].nunique().reset_index()
    diversity.rename(columns={'product_category_name_english': 'Purchase_Diversity'}, inplace=True)
    
    features_df = pd.merge(rfm, diversity, on='customer_unique_id', how='left').fillna(0)
    features_df['is_churn'] = (features_df['Recency'] > CHURN_DAYS_THRESHOLD).astype(int)

    X = features_df[['Recency', 'Frequency', 'Monetary', 'Purchase_Diversity']]
    y = features_df['is_churn']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

    # Using a wider param_grid to encourage smoother probabilities
    param_grid = {'n_estimators': [100], 'max_depth': [5, 10], 'min_samples_leaf': [20, 50]}
    grid_search = GridSearchCV(estimator=RandomForestClassifier(random_state=42, class_weight='balanced'), 
                               param_grid=param_grid, cv=3, n_jobs=-1, verbose=1, scoring='f1_weighted')
    grid_search.fit(X_train, y_train)
    best_model = grid_search.best_estimator_

    importance_df = pd.DataFrame({
        'Feature': X.columns,
        'Importance': best_model.feature_importances_
    }).sort_values(by='Importance', ascending=False)
    
    features_df['churn_probability'] = best_model.predict_proba(X_scaled)[:, 1]
    logging.info("Churn prediction probabilities calculated.")
    
    return {
        "predictions": features_df,
        "feature_importance": importance_df
    }

def run_sales_forecasting_v2(processed_df: pd.DataFrame):
    """Runs sales forecasting with holiday effects."""
    logging.info("--- Starting Advanced Sales Forecasting (v2) ---")

    df = processed_df.copy()
    df['order_purchase_timestamp'] = pd.to_datetime(df['order_purchase_timestamp'])
    
    top_categories = df.groupby('product_category_name_english')['price'].sum().nlargest(TOP_N_CATEGORIES_FOR_FORECAST).index
    logging.info(f"Forecasting for top {TOP_N_CATEGORIES_FOR_FORECAST} categories: {top_categories.tolist()}")

    all_forecasts = {}
    for category in top_categories:
        logging.info(f"--- Forecasting for category: {category} ---")
        category_sales = df[df['product_category_name_english'] == category].copy()
        daily_sales = category_sales.set_index('order_purchase_timestamp').resample('D')['price'].sum().reset_index()
        daily_sales.rename(columns={'order_purchase_timestamp': 'ds', 'price': 'y'}, inplace=True)

        model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        model.add_country_holidays(country_name='BR')
        model.fit(daily_sales)

        future = model.make_future_dataframe(periods=FORECAST_PERIOD_DAYS)
        forecast = model.predict(future)

        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].copy()
        all_forecasts[category] = forecast_data
        logging.info(f"Advanced forecast for '{category}' generated.")

    return all_forecasts
