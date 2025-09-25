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

## Getting Started with Docker (Recommended)

This project is fully containerized using Docker, which is the recommended way to get started. This method simplifies the setup process to just a few commands.

### Prerequisites

1.  **Docker Desktop**: Install it from the [official Docker website](https://www.docker.com/products/docker-desktop/).
2.  **Kaggle API Token**: The application automatically downloads the required dataset from Kaggle. You need an API token for this.
    - Go to your Kaggle account settings (`https://www.kaggle.com/account`).
    - Click on `Create New API Token`. This will download a `kaggle.json` file.
    - Place this file in your home directory under a `.kaggle` folder (e.g., `~/.kaggle/kaggle.json` on macOS/Linux or `C:\Users\<Your-Username>\.kaggle\kaggle.json` on Windows).

### 1. Launch the Application

Clone the repository, navigate into the project directory, and run the following command:

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for the frontend and backend.
- Start containers for the frontend, backend, and a PostgreSQL database.
- The frontend will be available at `http://localhost:3000`.
- The backend API will be available at `http://localhost:8000`.

### 2. Populate the Database

After the containers are up and running, open a **new terminal window** and run the following command to download the dataset and populate the database:

```bash
docker-compose exec backend uv run python backend/populate_db.py
```

This script will:
- Automatically download the Olist dataset from Kaggle into the `data` directory.
- Create the necessary table schema.
- Fill the tables with the data from the CSV files.

Once the script finishes, your application will be fully functional with all the necessary data.

--- 

*For manual setup without Docker, please refer to older commits of this README.*

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.