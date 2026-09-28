#!/bin/bash
# Startup script for Render.com deployment

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
