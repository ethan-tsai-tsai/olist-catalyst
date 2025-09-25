# Olist Catalyst

Olist Catalyst is an advanced analytical dashboard designed for sellers on the Olist e-commerce platform. It empowers sellers by transforming raw sales data into actionable insights, enabling them to understand market trends, optimize operations, and make data-driven predictions to boost their business performance.

## Core Features

- **Interactive Dashboard**: A user-friendly interface to visualize key performance indicators (KPIs) such as revenue, orders, and customer activity.
- **Business Insights**: In-depth analysis of sales, customers, and products, allowing sellers to identify top-performing items and understand purchasing patterns.
- **Predictive Analysis**: Features sales forecasting to help sellers manage inventory and plan marketing campaigns more effectively.
- **RFM Analysis**: Customer segmentation based on Recency, Frequency, and Monetary value to enable targeted marketing and improve customer retention.
- **Market Basket Analysis**: Uncovers associations between products frequently bought together, providing a basis for recommendation systems and product bundling strategies.

## Tech Stack

- **Backend**: Python, FastAPI, Pandas, NumPy, scikit-learn, Prophet
- **Frontend**: React, Next.js, Chart.js, Tailwind CSS
- **Database**: PostgreSQL
- **Environment**: `uv` for Python package and environment management

## Data Source

This project utilizes the publicly available **Olist E-commerce Dataset** from Kaggle. This comprehensive dataset contains real, anonymized e-commerce data from 2016 to 2018, covering orders, products, customers, and reviews.

You can find the dataset here: [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)

## Frontend Template

The user interface and component library for the frontend were built upon the excellent **TailAdmin** Next.js template.

For more information, visit: [https://tailadmin.com](https://tailadmin.com)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Ensure you have the following installed:
- Node.js and npm
- Python 3.8+
- `uv` (Python package installer and virtual environment manager)

```bash
# Install uv if you haven't already
pip install uv
```

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/olist-catalyst.git
    cd olist-catalyst
    ```

2.  **Create and activate the virtual environment:**
    ```bash
    uv venv
    source .venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    uv pip install -r requirements.txt 
    # Or if pyproject.toml is fully populated:
    # uv sync
    ```

4.  **Set up the database:**
    *Ensure PostgreSQL is running and a database has been created.*
    *Modify connection details in `backend/platform_api.py` if necessary.*

5.  **Populate the database:**
    *(This step requires the Olist dataset CSV files to be placed in the `data/` directory)*
    ```bash
    uv run python backend/populate_db.py
    ```

6.  **Run the backend server:**
    ```bash
    uv run uvicorn backend.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install npm dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.