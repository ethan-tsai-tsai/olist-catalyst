
import logging

def get_sellers(conn, sort_by='total_revenue', order='DESC', limit=10, page=1):
    """
    Queries the database for a paginated list of sellers with their performance metrics,
    supporting dynamic sorting.
    """
    if sort_by not in ['total_revenue', 'unique_order_count', 'seller_id', 'seller_city', 'seller_state']:
        sort_by = 'total_revenue'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'

    offset = (page - 1) * limit

    query = f"""
        WITH seller_metrics AS (
            SELECT
                s.seller_id,
                s.seller_city,
                s.seller_state,
                COALESCE(SUM(oi.price), 0) AS total_revenue,
                COALESCE(COUNT(DISTINCT oi.order_id), 0) AS unique_order_count
            FROM sellers s
            LEFT JOIN order_items oi ON s.seller_id = oi.seller_id
            GROUP BY s.seller_id, s.seller_city, s.seller_state
        )
        SELECT
            seller_id,
            seller_city,
            seller_state,
            total_revenue,
            unique_order_count
        FROM seller_metrics
        ORDER BY {sort_by} {order}
        LIMIT %s
        OFFSET %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching sellers: {e}")
        return []

def get_sellers_count(conn):
    """Returns the total number of sellers."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM sellers;")
            count = cur.fetchone()[0]
        return count
    except Exception as e:
        logging.error(f"Error fetching sellers count: {e}")
        return 0


def get_top_sellers_by_revenue(conn, limit=10):
    """
    Queries the database to get the top N sellers by total revenue.

    Args:
        conn: A psycopg2 database connection object.
        limit (int): The number of top sellers to return.

    Returns:
        list: A list of tuples, where each tuple contains:
              (seller_id, total_revenue, seller_city, seller_state).
              Returns an empty list if an error occurs.
    """
    query = """
        SELECT
            s.seller_id,
            SUM(oi.price) AS total_revenue,
            s.seller_city,
            s.seller_state
        FROM order_items oi
        JOIN sellers s ON oi.seller_id = s.seller_id
        GROUP BY s.seller_id, s.seller_city, s.seller_state
        ORDER BY total_revenue DESC
        LIMIT %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit,))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching top sellers by revenue: {e}")
        return []

def get_top_sellers_by_volume(conn, limit=10):
    """
    Queries the database to get the top N sellers by the number of unique orders.

    Args:
        conn: A psycopg2 database connection object.
        limit (int): The number of top sellers to return.

    Returns:
        list: A list of tuples, where each tuple contains:
              (seller_id, unique_order_count, seller_city, seller_state).
              Returns an empty list if an error occurs.
    """
    query = """
        SELECT
            s.seller_id,
            COUNT(DISTINCT oi.order_id) AS unique_order_count,
            s.seller_city,
            s.seller_state
        FROM order_items oi
        JOIN sellers s ON oi.seller_id = s.seller_id
        GROUP BY s.seller_id, s.seller_city, s.seller_state
        ORDER BY unique_order_count DESC
        LIMIT %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit,))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching top sellers by volume: {e}")
        return []

def get_products(conn, sort_by='sales_count', order='DESC', limit=10, page=1):
    """
    Queries the database for a paginated list of products, supporting dynamic sorting.
    """
    if sort_by not in ['sales_count']:
        sort_by = 'sales_count'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'
    
    offset = (page - 1) * limit

    query = f"""
        SELECT
            p.product_id,
            COALESCE(t.product_category_name_english, p.product_category_name) as product_category,
            COUNT(oi.product_id) AS sales_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        GROUP BY p.product_id, product_category
        ORDER BY {sort_by} {order}
        LIMIT %s
        OFFSET %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching products: {e}")
        return []

def get_products_count(conn):
    """Returns the total number of products with sales."""
    try:
        with conn.cursor() as cur:
            # This counts products that have at least one sale
            cur.execute("SELECT COUNT(DISTINCT product_id) FROM order_items;")
            count = cur.fetchone()[0]
        return count
    except Exception as e:
        logging.error(f"Error fetching products count: {e}")
        return 0

def get_orders_log(conn, sort_by='order_purchase_timestamp', order='DESC', limit=10, page=1):
    """
    Queries the database for a paginated log of recent orders, with sorting.
    """
    if sort_by not in ['order_purchase_timestamp', 'order_id', 'customer_unique_id', 'order_status', 'total_value']:
        sort_by = 'order_purchase_timestamp'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'
    
    offset = (page - 1) * limit

    query = f"""
        SELECT 
            o.order_id, 
            c.customer_unique_id, 
            o.order_status, 
            o.order_purchase_timestamp,
            SUM(op.payment_value) as total_value
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_payments op ON o.order_id = op.order_id
        GROUP BY o.order_id, c.customer_unique_id
        ORDER BY {sort_by} {order}
        LIMIT %s
        OFFSET %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching orders log: {e}")
        return []

def get_orders_count(conn):
    """Returns the total number of orders."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM orders;")
            count = cur.fetchone()[0]
        return count
    except Exception as e:
        logging.error(f"Error fetching orders count: {e}")
        return 0

def get_top_products(conn, limit=5):
    """
    Queries the database for the top N best-selling products.

    Args:
        conn: A psycopg2 database connection object.
        limit (int): The number of top products to return.

    Returns:
        list: A list of tuples, where each tuple contains:
              (product_id, product_category_name_english, sales_count).
    """
    query = """
        SELECT
            p.product_id,
            COALESCE(t.product_category_name_english, p.product_category_name) as product_category,
            COUNT(oi.product_id) AS sales_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        GROUP BY p.product_id, product_category
        ORDER BY sales_count DESC
        LIMIT %s;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit,))
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching top products: {e}")
        return []

def get_sales_by_region(conn):
    """
    Queries the database for the total sales revenue per state.

    Args:
        conn: A psycopg2 database connection object.

    Returns:
        list: A list of tuples, where each tuple contains: (customer_state, total_revenue).
    """
    query = """
        SELECT
            c.customer_state,
            SUM(op.payment_value) as total_revenue
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_payments op ON o.order_id = op.order_id
        WHERE o.order_status != 'canceled'
        GROUP BY c.customer_state
        ORDER BY total_revenue DESC;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching sales by region: {e}")
        return []

def get_order_status_distribution(conn):
    """
    Queries the database for the distribution of order statuses.
    """
    query = "SELECT order_status, COUNT(*) FROM orders GROUP BY order_status;"
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching order status distribution: {e}")
        return []

def get_payment_method_distribution(conn):
    """
    Queries the database for the distribution of payment methods.
    """
    query = "SELECT payment_type, COUNT(*) FROM order_payments GROUP BY payment_type;"
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching payment method distribution: {e}")
        return []

def get_revenue_trend(conn):
    """
    Queries the database for the total revenue trend aggregated by month.
    """
    query = """
        SELECT
            TO_CHAR(o.order_purchase_timestamp, 'YYYY-MM') as month,
            SUM(op.payment_value) as total_revenue
        FROM orders o
        JOIN order_payments op ON o.order_id = op.order_id
        WHERE o.order_status != 'canceled' AND TO_CHAR(o.order_purchase_timestamp, 'YYYY-MM') != '2018-09'
        GROUP BY month
        ORDER BY month;
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
        return results
    except Exception as e:
        logging.error(f"Error fetching revenue trend: {e}")
        return []

def get_platform_kpis(conn):
    """
    Queries the database for key platform-wide performance indicators.
    """
    queries = {
        "total_revenue": "SELECT SUM(payment_value) FROM order_payments;",
        "total_orders": "SELECT COUNT(*) FROM orders;",
        "total_customers": "SELECT COUNT(DISTINCT customer_unique_id) FROM customers;",
        "total_sellers": "SELECT COUNT(*) FROM sellers;"
    }
    
    kpis = {}
    try:
        with conn.cursor() as cur:
            for key, query in queries.items():
                cur.execute(query)
                kpis[key] = cur.fetchone()[0]
        return kpis
    except Exception as e:
        logging.error(f"Error fetching platform KPIs: {e}")
        return {}


# --- Functions for Predictive Analysis ---

import pandas as pd

def get_data_for_predictions(conn):
    """
    Fetches all necessary data from the database for predictive modeling
    and returns a dictionary of pandas DataFrames.
    """
    # Corrected table names based on database schema query
    table_names = {
        "orders": "orders",
        "payments": "order_payments",
        "customers": "customers",
        "items": "order_items",
        "products": "products",
        "translations": "product_category_name_translation"
    }
    
    dataframes = {}
    try:
        for df_key, table_name in table_names.items():
            logging.info(f"Fetching table: {table_name}...")
            query = f'SELECT * FROM "{table_name}";'
            dataframes[df_key] = pd.read_sql_query(query, conn)
        
        # Recreate processed_df by joining tables
        logging.info("Joining tables to create processed_data...")
        df = pd.merge(dataframes['orders'], dataframes['items'], on='order_id')
        df = pd.merge(df, dataframes['products'], on='product_id')
        df = pd.merge(df, dataframes['customers'], on='customer_id')
        df = pd.merge(df, dataframes['translations'], on='product_category_name')
        dataframes['processed_data'] = df
        logging.info("Successfully created 'processed_data' DataFrame.")

        return dataframes

    except Exception as e:
        logging.error(f"Error fetching data for predictions: {e}")
        return None
