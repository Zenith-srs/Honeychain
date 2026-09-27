"""Vercel serverless function entry point."""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path.parent))

from backend.main import app

# Vercel expects 'app' to be the FastAPI application
