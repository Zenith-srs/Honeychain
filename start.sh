#!/bin/bash
# Startup script for Render.com deployment

# Upgrade pip to latest version
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Start the server using root-level main.py
python main.py
