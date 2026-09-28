#!/bin/bash
# Startup script for Render.com deployment

# Set Python path to project root
export PYTHONPATH=/opt/render/project/src:$PYTHONPATH

# Install dependencies
pip install -r requirements.txt

# Start the server using Python module syntax
python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
