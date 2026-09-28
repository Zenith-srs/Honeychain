# HoneyChain Backend - Docker Image
# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (exclude ML and simulator files)
COPY backend ./backend

# Remove ML service files to prevent import errors
RUN rm -f ./backend/services/ml_service.py \
    ./backend/routers/ml.py \
    ./backend/routers/assistant.py \
    ./backend/routers/demo.py || true

COPY start_railway.py .

# Set environment variables (Railway will inject these from environment)
ENV PYTHONPATH=/app
ENV ENVIRONMENT=production
ENV HONEYCHAIN_DEMO_MODE=true

# Expose port
EXPOSE 8000

# Run the application using Python startup script
CMD ["python", "start_railway.py"]
