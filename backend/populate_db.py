import os
import psycopg2
from dotenv import load_dotenv
import sys
import kagglehub
import shutil

# --- Dataset Download Logic ---
def download_dataset_if_needed():
    """
    Checks if the dataset exists in the target directory. If not, downloads it from Kaggle.
    """
    target_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
    
    # Check if all necessary CSV files already exist
    required_files = [
        'olist_customers_dataset.csv', 'olist_sellers_dataset.csv',
        'product_category_name_translation.csv', 'olist_products_dataset.csv',
        'olist_orders_dataset.csv', 'olist_order_items_dataset.csv',
        'olist_order_payments_dataset.csv', 'olist_order_reviews_dataset.csv'
    ]
    
    files_exist = all(os.path.exists(os.path.join(target_dir, f)) for f in required_files)

    if files_exist:
        print("Dataset files already exist. Skipping download.")
        return
    
    print("Dataset not found locally. Downloading from Kaggle...")
    print("Please ensure your Kaggle API credentials (kaggle.json) are set up correctly.")

    try:
        # Download dataset (kagglehub defaults to a cache path)
        dataset_path = kagglehub.dataset_download("olistbr/brazilian-ecommerce")
        
        # Create target directory if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)

        # Copy all files to the target data directory
        for file in os.listdir(dataset_path):
            src = os.path.join(dataset_path, file)
            dst = os.path.join(target_dir, file)
            if os.path.isfile(src):
                shutil.copy(src, dst)
        
        print(f"Successfully downloaded and moved dataset to {target_dir}")

    except Exception as e:
        print(f"ERROR: Failed to download dataset from Kaggle: {e}", file=sys.stderr)
        print("Please visit https://www.kaggle.com/docs/api to configure your API token.", file=sys.stderr)
        sys.exit(1)


# --- Main Script ---

# Load environment variables
load_dotenv()

# --- Database Connection ---
DB_URL = os.getenv("DATABASE_URL")
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

if not DB_URL:
    print("ERROR: DATABASE_URL environment variable is not set.", file=sys.stderr)
    sys.exit(1)

# --- CSV File Paths ---
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
CSV_FILES = {
    'customers': 'olist_customers_dataset.csv',
    'sellers': 'olist_sellers_dataset.csv',
    'product_category_name_translation': 'product_category_name_translation.csv',
    'products': 'olist_products_dataset.csv',
    'orders': 'olist_orders_dataset.csv',
    'order_items': 'olist_order_items_dataset.csv',
    'order_payments': 'olist_order_payments_dataset.csv',
    'order_reviews': 'olist_order_reviews_dataset.csv'
}

# 1. Download data if it doesn't exist
download_dataset_if_needed()

# 2. Connect to DB and populate
conn = None
try:
    print("Connecting to the database...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # --- Create Tables ---
    print("Creating tables from schema.sql...")
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        cur.execute(f.read())
    print("Tables created successfully.")

    # --- Populate Tables from CSV ---
    print("Populating tables from CSV files...")
    for table_name, csv_file in CSV_FILES.items():
        csv_path = os.path.join(DATA_DIR, csv_file)
        if not os.path.exists(csv_path):
            # This check is now redundant if download works, but good as a fallback
            print(f"WARNING: CSV file not found, skipping table {table_name}: {csv_path}", file=sys.stderr)
            continue

        print(f"Loading data into '{table_name}' from '{csv_file}'...")
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Skip header row
            next(f)
            # Use copy_expert for efficient bulk loading
            cur.copy_expert(f"COPY {table_name} FROM STDIN WITH CSV", f)

    print("Committing transaction...")
    conn.commit()
    cur.close()
    print("\nSUCCESS: Database has been populated with Olist data.")

except Exception as e:
    print(f"\nERROR: An error occurred during database population: {e}", file=sys.stderr)
    if conn:
        conn.rollback()
    sys.exit(1)

finally:
    if conn:
        conn.close()
        print("Database connection closed.")
