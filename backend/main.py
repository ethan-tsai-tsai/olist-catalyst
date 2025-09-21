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
    """Fetch a specific metric for the platform overview."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        if metric_name == "product_potential_matrix":
            query = """
            SELECT
                t.product_category_name_english,
                AVG(r.review_score) as avg_review_score,
                COUNT(oi.product_id) as sales_volume,
                SUM(oi.price) as total_revenue
            FROM
                order_items oi
            JOIN
                products p ON oi.product_id = p.product_id
            JOIN
                order_reviews r ON oi.order_id = r.order_id
            JOIN
                product_category_name_translation t ON p.product_category_name = t.product_category_name
            GROUP BY
                t.product_category_name_english
            HAVING
                COUNT(oi.product_id) > 10; -- Filter for categories with more than 10 sales
            """
            cur.execute(query)
            results = cur.fetchall()
            
            series_data = []
            for row in results:
                # The frontend expects the data in a specific format for bubble charts
                series_data.append({
                    "name": row[0],
                    "data": [[float(row[1]), int(row[2]), float(row[3])]]
                })
            
            return {"series": series_data}

        elif metric_name == "customer_journey_sankey":
            query_created = "SELECT COUNT(*) FROM orders WHERE order_status = 'created';"
            cur.execute(query_created)
            created_count = cur.fetchone()[0]

            query_shipped = "SELECT COUNT(*) FROM orders WHERE order_status = 'shipped';"
            cur.execute(query_shipped)
            shipped_count = cur.fetchone()[0]

            query_delivered = "SELECT COUNT(*) FROM orders WHERE order_status = 'delivered';"
            cur.execute(query_delivered)
            delivered_count = cur.fetchone()[0]

            nodes = [{"name": "Created"}, {"name": "Shipped"}, {"name": "Delivered"}]
            links = [
                {"source": 0, "target": 1, "value": shipped_count},
                {"source": 1, "target": 2, "value": delivered_count}
            ]

            return {"nodes": nodes, "links": links}

        elif metric_name == "sentiment_by_category":
            query = """
            SELECT
                t.product_category_name_english,
                SUM(CASE WHEN r.review_score >= 4 THEN 1 ELSE 0 END) as positive_reviews,
                SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) as negative_reviews
            FROM
                order_items oi
            JOIN
                products p ON oi.product_id = p.product_id
            JOIN
                order_reviews r ON oi.order_id = r.order_id
            JOIN
                product_category_name_translation t ON p.product_category_name = t.product_category_name
            GROUP BY
                t.product_category_name_english
            ORDER BY
                SUM(CASE WHEN r.review_score >= 4 THEN 1 ELSE 0 END) + SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) DESC
            LIMIT 10;
            """
            cur.execute(query)
            results = cur.fetchall()

            categories = [row[0] for row in results]
            positive_data = [row[1] for row in results]
            negative_data = [row[2] for row in results]

            series = [
                {"name": "Positive Sentiment", "data": positive_data},
                {"name": "Negative Sentiment", "data": negative_data}
            ]
            options = {"xaxis": {"categories": categories}}

            return {"series": series, "options": options}

        elif metric_name == "sales_trend":
            query = """
            SELECT
                TO_CHAR(order_purchase_timestamp, 'YYYY-MM') as month,
                SUM(oi.price) as total_sales
            FROM
                orders o
            JOIN
                order_items oi ON o.order_id = oi.order_id
            WHERE
                o.order_status != 'canceled'
            GROUP BY
                month
            ORDER BY
                month;
            """
            cur.execute(query)
            results = cur.fetchall()

            months = [row[0] for row in results]
            sales_data = [float(row[1]) for row in results]

            series = [{"name": "Sales", "data": sales_data}]
            options = {"xaxis": {"categories": months}}

            return {"series": series, "options": options}

        elif metric_name == "customer_geo_map":
            query = """
            SELECT
                c.customer_state,
                COUNT(DISTINCT c.customer_unique_id) as customer_count
            FROM
                customers c
            GROUP BY
                c.customer_state
            ORDER BY
                customer_count DESC;
            """
            cur.execute(query)
            results = cur.fetchall()

            values = {row[0].lower(): row[1] for row in results}

            return {"values": values}
        
        else:
            # Fallback to old logic for any other metric
            cur.execute(
                "SELECT data_payload FROM platform_overview WHERE metric_name = %s", 
                (metric_name,)
            )
            
            result = cur.fetchone()
            
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


@app.get("/api/sellers")
def get_sellers():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = "SELECT DISTINCT seller_id FROM order_items;"
        cur.execute(query)
        results = cur.fetchall()
        
        sellers = [row[0] for row in results]
        
        return sellers
    except Exception as e:
        print(f"An error occurred while fetching sellers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()


@app.get("/api/ecommerce-metrics")
def get_ecommerce_metrics():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Total Customers
        cur.execute("SELECT COUNT(DISTINCT customer_unique_id) FROM customers;")
        total_customers = cur.fetchone()[0]

        # Total Orders
        cur.execute("SELECT COUNT(order_id) FROM orders;")
        total_orders = cur.fetchone()[0]

        # Placeholder for growth percentages
        customer_growth = 11.01
        order_growth = -9.05

        return {
            "customers": {
                "total": total_customers,
                "growth": customer_growth
            },
            "orders": {
                "total": total_orders,
                "growth": order_growth
            }
        }

    except Exception as e:
        print(f"An error occurred while fetching ecommerce metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()


@app.get("/api/sellers/{seller_id}/{metric_name}")
def get_seller_metric(seller_id: str, metric_name: str):
    """Fetch a specific metric for a given seller."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        if metric_name == "ecommerce-metrics":
            # Total Customers for this seller
            query_customers = """
            SELECT COUNT(DISTINCT o.customer_id) 
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE oi.seller_id = %s;
            """
            cur.execute(query_customers, (seller_id,))
            total_customers = cur.fetchone()[0]

            # Total Orders for this seller
            query_orders = "SELECT COUNT(order_id) FROM order_items WHERE seller_id = %s;"
            cur.execute(query_orders, (seller_id,))
            total_orders = cur.fetchone()[0]

            # Placeholder for growth percentages
            customer_growth = 5.5 # Placeholder
            order_growth = -2.1 # Placeholder

            return {
                "customers": {
                    "total": total_customers,
                    "growth": customer_growth
                },
                "orders": {
                    "total": total_orders,
                    "growth": order_growth
                }
            }

        elif metric_name == "sales_trend":
            query = """
            SELECT
                TO_CHAR(o.order_purchase_timestamp, 'YYYY-MM') as month,
                SUM(oi.price) as total_sales
            FROM
                orders o
            JOIN
                order_items oi ON o.order_id = oi.order_id
            WHERE
                o.order_status != 'canceled' AND oi.seller_id = %s
            GROUP BY
                month
            ORDER BY
                month;
            """
            cur.execute(query, (seller_id,))
            results = cur.fetchall()

            months = [row[0] for row in results]
            sales_data = [float(row[1]) for row in results]

            series = [{"name": "Sales", "data": sales_data}]
            options = {"xaxis": {"categories": months}}

            return {"series": series, "options": options}

        elif metric_name == "customer_geo_map":
            query = """
            SELECT
                c.customer_state,
                COUNT(DISTINCT c.customer_unique_id) as customer_count
            FROM
                customers c
            JOIN
                orders o ON c.customer_id = o.customer_id
            JOIN
                order_items oi ON o.order_id = oi.order_id
            WHERE
                oi.seller_id = %s
            GROUP BY
                c.customer_state
            ORDER BY
                customer_count DESC;
            """
            cur.execute(query, (seller_id,))
            results = cur.fetchall()

            if not results:
                # If the seller has no customers, fall back to overall customer distribution
                fallback_query = """
                SELECT
                    c.customer_state,
                    COUNT(DISTINCT c.customer_unique_id) as customer_count
                FROM
                    customers c
                GROUP BY
                    c.customer_state
                ORDER BY
                    customer_count DESC;
                """
                cur.execute(fallback_query)
                results = cur.fetchall()
            values = {row[0].lower(): row[1] for row in results}
            return {"values": values}

        else:
            raise HTTPException(status_code=404, detail=f"Metric '{metric_name}' for seller '{seller_id}' not found")

    except Exception as e:
        print(f"An error occurred while fetching seller metric: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()

@app.get("/api/orders")
def get_orders():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
        SELECT 
            o.order_id, 
            c.customer_unique_id, 
            o.order_status, 
            o.order_purchase_timestamp
        FROM 
            orders o
        JOIN
            customers c ON o.customer_id = c.customer_id
        ORDER BY
            o.order_purchase_timestamp DESC
        LIMIT 100;
        """
        cur.execute(query)
        results = cur.fetchall()
        
        orders = []
        for row in results:
            orders.append({
                "order_id": row[0],
                "customer_unique_id": row[1],
                "order_status": row[2],
                "order_purchase_timestamp": row[3]
            })
        
        return orders
    except Exception as e:
        print(f"An error occurred while fetching orders: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            conn.close()


@app.get("/api/products")
def get_products():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = "SELECT product_id, product_category_name, product_name_lenght, product_description_lenght, product_photos_qty FROM products LIMIT 100;"
        cur.execute(query)
        results = cur.fetchall()
        
        products = []
        for row in results:
            products.append({
                "product_id": row[0],
                "product_category_name": row[1],
                "product_name_length": row[2],
                "product_description_length": row[3],
                "product_photos_qty": row[4]
            })
        
        return products
    except Exception as e:
        print(f"An error occurred while fetching products: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
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