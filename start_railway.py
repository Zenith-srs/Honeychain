#!/usr/bin/env python3
"""
Startup script for Railway deployment.
Reads PORT from environment and starts uvicorn.
"""
import os
import sys

# Add project root to Python path
sys.path.insert(0, '/app')

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment, default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Starting uvicorn on port {port}")
    
    # Import the app
    from backend.main import app
    
    # Run uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)
