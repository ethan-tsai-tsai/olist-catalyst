# Olist Catalyst

An advanced analytics dashboard for Olist platform operators to monitor market trends, optimize operations, and forecast future sales.

---

## Tech Stack

- **Backend**: Python, FastAPI, psycopg2
- **Frontend**: Next.js, React, TypeScript, Chart.js, Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Predictive Modeling**: scikit-learn, Prophet

## Getting Started

### Backend

1.  Navigate to the root directory.
2.  Install dependencies: `uv add -r requirements.txt` (assuming a requirements file exists).
3.  Run the server: `uv run uvicorn backend.main:app --reload`

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`
