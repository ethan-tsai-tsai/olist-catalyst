# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install uv
RUN pip install uv

# Copy the dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv
RUN uv sync

# Copy the rest of the backend application code
COPY backend/ ./

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
