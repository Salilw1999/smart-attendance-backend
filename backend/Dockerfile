FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install build dependencies and curl for health checks
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./src ./src

# Set Python path to include src directory
ENV PYTHONPATH=/app/src

# Expose the port the app runs on
EXPOSE 8000

# Add wait-for-it script to wait for dependencies
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]