# -*- coding: utf-8 -*-
"""
Olist Seller Success - Core Business Insights Analysis (Refactored)

This script performs the second stage of the analysis, focusing on:
1. Geographic Analysis
2. Purchase Behavior Analysis (Repurchase & Market Basket)
3. Sentiment Analysis (Advanced NLP Methods)

Refactoring improvements:
- Modularized into functions for clarity and reusability.
- Centralized configuration for paths and parameters.
- Implemented logging for structured output.
- Plots are saved to an /output directory instead of displayed.
- Upgraded sentiment analysis from proxy to ML/DL models.
"""

# --- 1. Setup and Configuration ---
import logging
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# NLP & ML Imports
import re
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import lightgbm as lgb
from transformers import pipeline

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"

# Input files
PROCESSED_DATA_PATH = DATA_DIR / "olist_processed_dataset.csv"
ORDERS_PATH = DATA_DIR / "olist_orders_dataset.csv"
ORDER_REVIEWS_PATH = DATA_DIR / "olist_order_reviews_dataset.csv"

# --- Parameters ---
GEO_ANALYSIS_KEY_STATES = ['SP', 'RJ', 'MG']
APRIORI_MIN_SUPPORT = 0.01
ASSOC_RULES_MIN_LIFT = 1.0
TRANSFORMER_SAMPLE_SIZE = 500 # Use a sample for the computationally expensive transformer model

# --- Logging Setup ---
def setup_logging():
    """Configures logging for the script."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(OUTPUT_DIR / 'analysis.log', mode='w')
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

# --- 2. Analysis Functions ---

def perform_geo_analysis(df: pd.DataFrame):
    """
    Analyzes customer distribution and AOV by state, saving a visualization.
    """
    logging.info("--- Starting Geographic Analysis ---")
    payment_cols = ['boleto', 'credit_card', 'debit_card', 'voucher']
    existing_payment_cols = [col for col in payment_cols if col in df.columns]
    df['total_payment'] = df[existing_payment_cols].sum(axis=1)
    geo_analysis = df.groupby('customer_state').agg(
        customer_count=('customer_unique_id', 'nunique'),
        order_count=('order_id', 'nunique'),
        total_revenue=('total_payment', 'sum')
    ).reset_index()
    geo_analysis['aov'] = geo_analysis['total_revenue'] / geo_analysis['order_count']
    plt.figure(figsize=(18, 10))
    sns.set_style('whitegrid')
    sns.scatterplot(data=geo_analysis, x='customer_count', y='aov', hue='customer_state', size='total_revenue', sizes=(50, 1500), alpha=0.7)
    for i, row in geo_analysis.iterrows():
        if row['customer_state'] in GEO_ANALYSIS_KEY_STATES or row['aov'] > 250 or row['customer_count'] > 10000:
            plt.text(row['customer_count'], row['aov'], row['customer_state'], fontsize=9)
    plt.xscale('log')
    plt.title('Market Analysis: Customer Count vs. Average Order Value (AOV)', fontsize=16)
    plt.xlabel('Number of Customers (Log Scale)')
    plt.ylabel('Average Order Value (AOV)')
    plt.legend(title='State', bbox_to_anchor=(1.05, 1), loc='upper left')
    output_path = OUTPUT_DIR / "geographic_analysis.png"
    plt.savefig(output_path, bbox_inches='tight')
    plt.close()
    logging.info(f"Geographic analysis plot saved to {output_path}")

def perform_purchase_behavior_analysis(main_df: pd.DataFrame, orders_df: pd.DataFrame):
    """
    Analyzes repurchase cycles and performs market basket analysis.
    """
    logging.info("--- Starting Purchase Behavior Analysis ---")
    logging.info("Calculating repurchase cycle...")
    repurchase_df = pd.merge(orders_df, main_df[['order_id', 'customer_unique_id']].drop_duplicates(), on='order_id')
    repurchase_df['order_purchase_timestamp'] = pd.to_datetime(repurchase_df['order_purchase_timestamp'])
    repurchase_df = repurchase_df.sort_values(['customer_unique_id', 'order_purchase_timestamp'])
    repurchase_df['repurchase_days'] = repurchase_df.groupby('customer_unique_id')['order_purchase_timestamp'].diff().dt.days
    avg_repurchase_cycle = repurchase_df['repurchase_days'].mean()
    logging.info(f"Average repurchase cycle for returning customers: {avg_repurchase_cycle:.2f} days")

    logging.info("Executing Market Basket Analysis...")
    basket_df = main_df[main_df['product_category_name_english'].notna()].copy()
    multi_item_orders = basket_df.groupby('order_id')['product_id'].nunique()
    multi_item_orders = multi_item_orders[multi_item_orders > 1].index
    basket_df = basket_df[basket_df['order_id'].isin(multi_item_orders)]
    if not basket_df.empty:
        transactions = basket_df.groupby('order_id')['product_category_name_english'].apply(list).values.tolist()
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        basket_onehot = pd.DataFrame(te_ary, columns=te.columns_)
        frequent_itemsets = apriori(basket_onehot, min_support=APRIORI_MIN_SUPPORT, use_colnames=True)
        rules = association_rules(frequent_itemsets, metric='lift', min_threshold=ASSOC_RULES_MIN_LIFT)
        top_10_rules = rules.sort_values(by='lift', ascending=False).head(10)
        logging.info("Top 10 association rules (potential for bundles/cross-sells):\n" + top_10_rules.to_string())
    else:
        logging.warning("No multi-item orders found for market basket analysis.")

def map_sentiment(score: int) -> str:
    """Maps a 1-5 review score to a sentiment label."""
    if score >= 4:
        return 'positive'
    elif score == 3:
        return 'neutral'
    else:
        return 'negative'

def clean_text(text: str) -> str:
    """Basic text cleaning: lowercase, remove punctuation and numbers."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[\d\W_]+', ' ', text)
    return text

def perform_sentiment_analysis_lgbm(reviews_df: pd.DataFrame, main_df: pd.DataFrame):
    """
    Performs sentiment analysis using TF-IDF and LightGBM.
    """
    logging.info("--- Starting Sentiment Analysis (TF-IDF + LightGBM) ---")
    
    # Prepare data
    reviews_with_comments = reviews_df[reviews_df['review_comment_message'].notna()].copy()
    reviews_with_comments['sentiment'] = reviews_with_comments['review_score'].apply(map_sentiment)
    
    portuguese_stopwords = stopwords.words('portuguese')
    reviews_with_comments['cleaned_comment'] = reviews_with_comments['review_comment_message'].apply(clean_text)

    # Feature Engineering & Model Training
    vectorizer = TfidfVectorizer(max_features=3000, stop_words=portuguese_stopwords)
    X = vectorizer.fit_transform(reviews_with_comments['cleaned_comment'])
    y = reviews_with_comments['sentiment']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    logging.info("Training LightGBM model...")
    lgbm = lgb.LGBMClassifier(random_state=42)
    lgbm.fit(X_train, y_train)
    
    # Evaluate
    y_pred = lgbm.predict(X_test)
    report = classification_report(y_test, y_pred)
    logging.info(f"LightGBM Classification Report:\n{report}")
    
    # Link back to business insights
    logging.info("Analyzing sentiment distribution by product category...")
    reviews_with_comments['predicted_sentiment'] = lgbm.predict(X)
    
    merged_df = pd.merge(reviews_with_comments[['order_id', 'predicted_sentiment']], main_df, on='order_id')
    
    sentiment_dist = merged_df.groupby('product_category_name_english')['predicted_sentiment'].value_counts(normalize=True).unstack(fill_value=0)
    if 'negative' in sentiment_dist.columns:
        worst_categories = sentiment_dist.sort_values(by='negative', ascending=False).head(10)
        logging.info(f"Top 10 categories with highest proportion of NEGATIVE sentiment:\n{worst_categories}")

def perform_sentiment_analysis_transformer(reviews_df: pd.DataFrame):
    """
    Performs sentiment analysis on a sample using a Hugging Face Transformer model.
    """
    logging.info("--- Starting Sentiment Analysis (Transformer Model) ---")
    logging.warning(f"This is a demonstration on a sample of {TRANSFORMER_SAMPLE_SIZE} reviews due to high computational cost.")

    reviews_sample = reviews_df[reviews_df['review_comment_message'].notna()].sample(n=TRANSFORMER_SAMPLE_SIZE, random_state=42)
    
    # Using a robust multilingual model trained for 1-5 star reviews
    model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
    logging.info(f"Loading Transformer model: {model_name}")
    
    try:
        sentiment_pipeline = pipeline("sentiment-analysis", model=model_name)
    except Exception as e:
        logging.error(f"Failed to load transformer model: {e}")
        logging.error("Please ensure you have an active internet connection.")
        return

    logging.info("Running sentiment pipeline on sample data...")
    
    # The pipeline expects a list of strings
    # Truncate long reviews to 512 tokens, which is a common limit for BERT models
    comments = [comment[:512] for comment in reviews_sample['review_comment_message'].tolist()]
    results = sentiment_pipeline(comments)
    
    # Map results back to our sentiment labels
    def map_transformer_result(result):
        score = int(result['label'].split(' ')[0])
        return map_sentiment(score)

    sentiments = [map_transformer_result(res) for res in results]
    
    logging.info("Example predictions from Transformer model:")
    for i, (comment, sentiment) in enumerate(zip(comments[:3], sentiments[:3])):
        logging.info(f"Review: '{comment[:80]}...' -> Predicted Sentiment: {sentiment}")

    logging.info("Transformer analysis demonstrates capability. For full-scale analysis, batch processing and GPU acceleration are recommended.")

# --- 3. Main Execution ---

def main():
    """Main function to orchestrate the analysis pipeline."""
    setup_logging()
    logging.info("====== Starting Olist Seller Success Analysis Pipeline ======")
    
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Load base data
    main_df = load_data(PROCESSED_DATA_PATH)
    if main_df is None:
        logging.critical("Could not load main processed dataset. Aborting.")
        return

    # --- Run Analyses ---
    perform_geo_analysis(main_df.copy())

    orders_df = load_data(ORDERS_PATH)
    if orders_df is not None:
        perform_purchase_behavior_analysis(main_df.copy(), orders_df.copy())
    
    reviews_df = load_data(ORDER_REVIEWS_PATH)
    if reviews_df is not None:
        perform_sentiment_analysis_lgbm(reviews_df.copy(), main_df.copy())
        perform_sentiment_analysis_transformer(reviews_df.copy())

    logging.info("====== Analysis Pipeline Finished Successfully ======")

if __name__ == "__main__":
    main()
