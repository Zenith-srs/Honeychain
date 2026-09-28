"""
Entry point for Render.com deployment.
This file sits at the project root to avoid module path issues.
"""
import sys
import os
from pathlib import Path

# Change working directory to project root
project_root = Path(__file__).parent.resolve()
os.chdir(project_root)

# Add project root to Python path FIRST
sys.path.insert(0, str(project_root))

# Set PYTHONPATH environment variable too
os.environ['PYTHONPATH'] = str(project_root)

# Debug: Print what we're adding to path
print(f"Working directory: {os.getcwd()}")
print(f"Project root: {project_root}")
print(f"Backend directory exists: {(project_root / 'backend').exists()}")
print(f"Backend main.py exists: {(project_root / 'backend' / 'main.py').exists()}")
print(f"sys.path[0]: {sys.path[0]}")

# Now try to import
try:
    from backend.main import app
    print("✅ Successfully imported backend.main.app")
except ImportError as e:
    print(f"❌ Failed to import backend.main: {e}")
    print(f"sys.path: {sys.path}")
    # List directory contents
    print(f"Files in project root: {list(project_root.iterdir())}")
    if (project_root / 'backend').exists():
        print(f"Files in backend: {list((project_root / 'backend').iterdir())[:10]}")
    raise

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting uvicorn on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
