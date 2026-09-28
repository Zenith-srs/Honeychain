# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend ./backend
COPY .env .env

# Set environment variables
ENV HONEYCHAIN_ENV=production
ENV HONEYCHAIN_DEMO_MODE=true
ENV ADMIN_PASSWORD=KvicAdmin@2024
ENV OFFICER_PASSWORD=KvicOfficer@2024
ENV LAB_PASSWORD=LabInspector@2024
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
