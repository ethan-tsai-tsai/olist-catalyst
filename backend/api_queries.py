import logging
import pandas as pd
from sqlalchemy import text

def get_sellers(engine, sort_by='total_revenue', order='DESC', limit=10, page=1):
    """Queries for a paginated list of sellers using SQLAlchemy engine."""
    if sort_by not in ['total_revenue', 'unique_order_count', 'seller_id', 'seller_city', 'seller_state']:
        sort_by = 'total_revenue'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'

    offset = (page - 1) * limit

    query = text(f"""
        WITH seller_metrics AS (
            SELECT
                s.seller_id, s.seller_city, s.seller_state,
                COALESCE(SUM(oi.price), 0) AS total_revenue,
                COALESCE(COUNT(DISTINCT oi.order_id), 0) AS unique_order_count
            FROM sellers s
            LEFT JOIN order_items oi ON s.seller_id = oi.seller_id
            GROUP BY s.seller_id, s.seller_city, s.seller_state
        )
        SELECT seller_id, seller_city, seller_state, total_revenue, unique_order_count
        FROM seller_metrics
        ORDER BY {sort_by} {order}
        LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit, 'offset': offset})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching sellers: {e}")
        return []

def get_sellers_count(engine):
    """Returns the total number of sellers using SQLAlchemy engine."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) FROM sellers;"))
            return result.scalar_one()
    except Exception as e:
        logging.error(f"Error fetching sellers count: {e}")
        return 0

def get_top_sellers_by_revenue(engine, limit=10):
    """Queries top sellers by revenue using SQLAlchemy engine."""
    query = text("""
        SELECT s.seller_id, SUM(oi.price) AS total_revenue, s.seller_city, s.seller_state
        FROM order_items oi
        JOIN sellers s ON oi.seller_id = s.seller_id
        GROUP BY s.seller_id, s.seller_city, s.seller_state
        ORDER BY total_revenue DESC
        LIMIT :limit;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching top sellers by revenue: {e}")
        return []

def get_top_sellers_by_volume(engine, limit=10):
    """Queries top sellers by volume using SQLAlchemy engine."""
    query = text("""
        SELECT s.seller_id, COUNT(DISTINCT oi.order_id) AS unique_order_count, s.seller_city, s.seller_state
        FROM order_items oi
        JOIN sellers s ON oi.seller_id = s.seller_id
        GROUP BY s.seller_id, s.seller_city, s.seller_state
        ORDER BY unique_order_count DESC
        LIMIT :limit;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching top sellers by volume: {e}")
        return []

def get_products(engine, sort_by='sales_count', order='DESC', limit=10, page=1):
    """Queries for a paginated list of products using SQLAlchemy engine."""
    if sort_by not in ['sales_count']:
        sort_by = 'sales_count'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'
    
    offset = (page - 1) * limit

    query = text(f"""
        SELECT
            p.product_id,
            COALESCE(t.product_category_name_english, p.product_category_name) as product_category,
            COUNT(oi.product_id) AS sales_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        GROUP BY p.product_id, product_category
        ORDER BY {sort_by} {order}
        LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit, 'offset': offset})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching products: {e}")
        return []

def get_products_count(engine):
    """Returns the total number of products with sales using SQLAlchemy engine."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(DISTINCT product_id) FROM order_items;"))
            return result.scalar_one()
    except Exception as e:
        logging.error(f"Error fetching products count: {e}")
        return 0

def get_orders_log(engine, sort_by='order_purchase_timestamp', order='DESC', limit=10, page=1):
    """Queries for a paginated log of recent orders using SQLAlchemy engine."""
    if sort_by not in ['order_purchase_timestamp', 'order_id', 'customer_unique_id', 'order_status', 'total_value']:
        sort_by = 'order_purchase_timestamp'
    if order.upper() not in ['ASC', 'DESC']:
        order = 'DESC'
    
    offset = (page - 1) * limit

    query = text(f"""
        SELECT o.order_id, c.customer_unique_id, o.order_status, o.order_purchase_timestamp, SUM(op.payment_value) as total_value
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_payments op ON o.order_id = op.order_id
        GROUP BY o.order_id, c.customer_unique_id
        ORDER BY {sort_by} {order}
        LIMIT :limit OFFSET :offset;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit, 'offset': offset})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching orders log: {e}")
        return []

def get_orders_count(engine):
    """Returns the total number of orders using SQLAlchemy engine."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) FROM orders;"))
            return result.scalar_one()
    except Exception as e:
        logging.error(f"Error fetching orders count: {e}")
        return 0

def get_top_products(engine, limit=5):
    """Queries for the top N best-selling products using SQLAlchemy engine."""
    query = text("""
        SELECT
            p.product_id,
            COALESCE(t.product_category_name_english, p.product_category_name) as product_category,
            COUNT(oi.product_id) AS sales_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        GROUP BY p.product_id, product_category
        ORDER BY sales_count DESC
        LIMIT :limit;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching top products: {e}")
        return []

def get_sales_by_region(engine):
    """Queries for total sales revenue per state using SQLAlchemy engine."""
    query = text("""
        SELECT c.customer_state, SUM(op.payment_value) as total_revenue
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_payments op ON o.order_id = op.order_id
        WHERE o.order_status != 'canceled'
        GROUP BY c.customer_state
        ORDER BY total_revenue DESC;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching sales by region: {e}")
        return []

def get_order_status_distribution(engine):
    """Queries for the distribution of order statuses using SQLAlchemy engine."""
    query = text("SELECT order_status, COUNT(*) FROM orders GROUP BY order_status;")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching order status distribution: {e}")
        return []

def get_payment_method_distribution(engine):
    """Queries for the distribution of payment methods using SQLAlchemy engine."""
    query = text("SELECT payment_type, COUNT(*) FROM order_payments GROUP BY payment_type;")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching payment method distribution: {e}")
        return []

def get_revenue_trend(engine):
    """Queries for the total revenue trend aggregated by month using SQLAlchemy engine."""
    query = text("""
        SELECT
            TO_CHAR(o.order_purchase_timestamp, 'YYYY-MM') as month,
            SUM(op.payment_value) as total_revenue
        FROM orders o
        JOIN order_payments op ON o.order_id = op.order_id
        WHERE o.order_status != 'canceled' AND TO_CHAR(o.order_purchase_timestamp, 'YYYY-MM') != '2018-09'
        GROUP BY month
        ORDER BY month;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error fetching revenue trend: {e}")
        return []

def get_platform_kpis(engine):
    """Queries for key platform-wide performance indicators using SQLAlchemy engine."""
    queries = {
        "total_revenue": text("SELECT SUM(payment_value) FROM order_payments;"),
        "total_orders": text("SELECT COUNT(*) FROM orders;"),
        "total_customers": text("SELECT COUNT(DISTINCT customer_unique_id) FROM customers;"),
        "total_sellers": text("SELECT COUNT(*) FROM sellers;")
    }
    
    kpis = {}
    try:
        with engine.connect() as connection:
            for key, query in queries.items():
                result = connection.execute(query)
                kpis[key] = result.scalar_one()
        return kpis
    except Exception as e:
        logging.error(f"Error fetching platform KPIs: {e}")
        return {}


# --- Functions for Predictive Analysis ---

def get_data_for_predictions(engine):
    """Fetches all necessary data for predictive modeling using SQLAlchemy engine."""
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
            dataframes[df_key] = pd.read_sql_query(query, engine)
        
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

# --- Functions for New Sentiment Dashboard ---

def get_average_review_score(engine):
    """Calculates the average review score across all reviews."""
    query = text("SELECT AVG(review_score) FROM order_reviews;")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.scalar_one_or_none()
    except Exception as e:
        logging.error(f"Error in get_average_review_score: {e}")
        return None

def get_overall_sentiment_distribution(engine):
    """Queries for the overall distribution of sentiment labels."""
    query = text("""
        SELECT 
            CASE 
                WHEN review_score >= 4 THEN 'positive'
                WHEN review_score = 3 THEN 'neutral'
                ELSE 'negative'
            END as sentiment_label, 
            COUNT(*)
        FROM order_reviews 
        GROUP BY sentiment_label;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error in get_overall_sentiment_distribution: {e}")
        return []

def get_top_negative_categories(engine, limit=5):
    """Queries for the top product categories with the most negative reviews."""
    query = text("""
        SELECT
            COALESCE(t.product_category_name_english, p.product_category_name) as category,
            SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) as negative_count
        FROM order_items oi
        JOIN order_reviews r ON oi.order_id = r.order_id
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
        WHERE p.product_category_name IS NOT NULL AND r.review_score <= 2
        GROUP BY category
        ORDER BY negative_count DESC
        LIMIT :limit;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query, {'limit': limit})
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error in get_top_negative_categories: {e}")
        return []

def get_sentiment_trend_data(engine):
    """Queries for sentiment counts aggregated by month using SQLAlchemy engine."""
    query = text("""
        SELECT 
            TO_CHAR(review_creation_date, 'YYYY-MM') as month,
            SUM(CASE WHEN review_score >= 4 THEN 1 ELSE 0 END) as positive,
            SUM(CASE WHEN review_score = 3 THEN 1 ELSE 0 END) as neutral,
            SUM(CASE WHEN review_score <= 2 THEN 1 ELSE 0 END) as negative
        FROM order_reviews
        WHERE review_comment_message IS NOT NULL AND TRIM(review_comment_message) <> ''
        GROUP BY month
        ORDER BY month;
    """)
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            return result.fetchall()
    except Exception as e:
        logging.error(f"Error in get_sentiment_trend_data: {e}")
        return []