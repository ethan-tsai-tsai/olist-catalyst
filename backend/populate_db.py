import os
import psycopg2
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# --- Database Connection ---
DB_URL = f"postgres://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DATABASE')}"

# --- CSV File Paths ---
# Assumes the CSV files are in a 'data' directory in the same directory as the script.
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')

CSV_FILES = {
    'customers': 'olist_customers_dataset.csv',
    'products': 'olist_products_dataset.csv',
    'product_category_name_translation': 'product_category_name_translation.csv',
    'orders': 'olist_orders_dataset.csv',
    'order_items': 'olist_order_items_dataset.csv',
    'order_reviews': 'olist_order_reviews_dataset.csv',
    'geolocation': 'olist_geolocation_dataset.csv'
}

# --- Main Script ---

conn = None
try:
    print("Connecting to the database...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # --- 1. Create Tables ---
    print("Creating tables from schema.sql...")
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        cur.execute(f.read())
    print("Tables created successfully.")

    # --- 2. Populate Tables from CSV ---
    print("Populating tables from CSV files...")
    for table_name, csv_file in CSV_FILES.items():
        csv_path = os.path.join(DATA_DIR, csv_file)
        if not os.path.exists(csv_path):
            print(f"WARNING: CSV file not found, skipping table {table_name}: {csv_path}", file=sys.stderr)
            continue

        print(f"Loading data into '{table_name}' from '{csv_file}'...")
        with open(csv_path, 'r') as f:
            # Skip header row
            next(f)
            # Use copy_expert for efficient bulk loading
            cur.copy_expert(f"COPY {table_name} FROM STDIN WITH CSV", f)

    print("Committing transaction...")
    conn.commit()
    cur.close()
    print("\nSUCCESS: Database has been populated with Olist data.")

except Exception as e:
    print(f"\nERROR: An error occurred: {e}", file=sys.stderr)
    if conn:
        conn.rollback()
    sys.exit(1)

finally:
    if conn:
        conn.close()
        print("Database connection closed.")