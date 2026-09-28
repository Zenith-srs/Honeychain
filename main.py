"""
Entry point for Render.com deployment.
This file sits at the project root to avoid module path issues.
"""
import sys
import os
from pathlib import Path

# Add project root to Python path FIRST
project_root = Path(__file__).parent.resolve()
sys.path.insert(0, str(project_root))

# Debug: Print what we're adding to path
print(f"Added to sys.path: {project_root}")
print(f"Backend directory exists: {(project_root / 'backend').exists()}")
print(f"Backend main.py exists: {(project_root / 'backend' / 'main.py').exists()}")

# Now try to import
try:
    from backend.main import app
    print("Successfully imported backend.main.app")
except ImportError as e:
    print(f"Failed to import backend.main: {e}")
    print(f"sys.path: {sys.path}")
    raise

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting uvicorn on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
