
import logging

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
