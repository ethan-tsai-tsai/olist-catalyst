import os
import psycopg2
import json
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# --- 1. Sample Data Generation ---

sales_trend_data = {
    "series": [
        {
            "name": "Sales",
            "data": [28, 29, 33, 36, 32, 32, 33, 40, 38, 35, 36, 34],
        },
    ],
    "options": {
        "xaxis": {
            "categories": [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
        }
    }
}

product_potential_data = {
    "series": [
        {
            "name": 'Star Products',
            "data": [[4.5, 8500, 25], [4.7, 9200, 30]]
        },
        {
            "name": 'Potential Gems',
            "data": [[4.8, 3500, 28], [4.6, 4100, 22]]
        },
        {
            "name": 'Needs Improvement',
            "data": [[3.5, 6500, 15], [3.8, 7100, 12]]
        },
        {
            "name": 'Niche Products',
            "data": [[4.2, 2100, 40], [4.9, 1500, 35]]
        }
    ]
}

sankey_data = {
  "nodes": [
    { "name": "Visit" },
    { "name": "Add to Cart" },
    { "name": "Checkout" },
    { "name": "Purchase" },
    { "name": "Repeat Purchase" },
    { "name": "Drop Off" },
  ],
  "links": [
    { "source": 0, "target": 1, "value": 100 },
    { "source": 0, "target": 5, "value": 20 },
    { "source": 1, "target": 2, "value": 80 },
    { "source": 1, "target": 5, "value": 20 },
    { "source": 2, "target": 3, "value": 70 },
    { "source": 2, "target": 5, "value": 10 },
    { "source": 3, "target": 4, "value": 30 },
  ],
}

sentiment_data = {
    "series": [
      {
        "name": "Positive Sentiment",
        "data": [44, 55, 57, 56, 61, 58, 63, 60, 66],
      },
      {
        "name": "Negative Sentiment",
        "data": [15, 23, 20, 22, 18, 21, 25, 24, 22],
      },
    ],
    "options": {
        "xaxis": {
            "categories": [
                'Electronics', 'Books', 'Clothing', 'Home Goods', 'Toys', 'Sports', 'Beauty', 'Garden', 'Health'
            ]
        }
    }
}

geo_map_data = {
    "values": {
        "US": 250,
        "BR": 450,
        "AU": 150,
        "DE": 200,
        "CN": 300,
        "FR": 180,
        "GB": 220
    }
}

# --- 2. Database Insertion Logic ---

metrics_to_insert = {
    "sales_trend": sales_trend_data,
    "product_potential_matrix": product_potential_data,
    "customer_journey_sankey": sankey_data,
    "sentiment_by_category": sentiment_data,
    "customer_geo_map": geo_map_data
}

DB_URL = f"postgres://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DATABASE')}"

conn = None
try:
    print("Connecting to the database...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for metric_name, data_payload in metrics_to_insert.items():
        print(f"Inserting/Updating metric: {metric_name}...")
        
        # Convert dict to JSON string for insertion
        json_payload = json.dumps(data_payload)
        
        # Use ON CONFLICT to either INSERT or UPDATE
        insert_query = """
        INSERT INTO platform_overview (metric_name, data_payload, last_updated)
        VALUES (%s, %s, NOW())
        ON CONFLICT (metric_name)
        DO UPDATE SET
            data_payload = EXCLUDED.data_payload,
            last_updated = NOW();
        """
        
        cur.execute(insert_query, (metric_name, json_payload))

    print("Committing transaction...")
    conn.commit()
    cur.close()
    print("\nSUCCESS: Database has been populated with sample data.")

except Exception as e:
    print(f"\nERROR: An error occurred: {e}", file=sys.stderr)
    if conn:
        conn.rollback()
    sys.exit(1)

finally:
    if conn:
        conn.close()
        print("Database connection closed.")
