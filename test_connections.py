#!/usr/bin/env python
"""
HoneyChain Connection Test Script
==================================

Tests backend and frontend connections to identify configuration issues.

Run this script to verify:
1. Backend server is running
2. Database is accessible
3. API endpoints are responding
4. CORS is configured correctly
5. Frontend configuration is valid

Usage:
    python test_connections.py
"""

import os
import sys
from pathlib import Path

# Color codes for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_header(text):
    """Print a section header."""
    print(f"\n{BLUE}{'=' * 60}")
    print(f"{text}")
    print(f"{'=' * 60}{RESET}\n")


def print_success(text):
    """Print success message."""
    print(f"{GREEN}✓ {text}{RESET}")


def print_error(text):
    """Print error message."""
    print(f"{RED}✗ {text}{RESET}")


def print_warning(text):
    """Print warning message."""
    print(f"{YELLOW}⚠ {text}{RESET}")


def test_database():
    """Test database connection and initialization."""
    print_header("Testing Database Connection")
    
    try:
        from backend.database import engine, SessionLocal
        from sqlalchemy import text
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            if result:
                print_success("Database connection successful")
            
            # Check if tables exist
            tables = conn.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )).fetchall()
            
            if tables:
                print_success(f"Found {len(tables)} tables in database")
                print(f"  Tables: {', '.join([t[0] for t in tables[:5]])}" + 
                      (f" ... and {len(tables) - 5} more" if len(tables) > 5 else ""))
            else:
                print_warning("No tables found. Run backend to initialize database.")
        
        return True
    except ImportError as e:
        print_error(f"Cannot import backend modules: {e}")
        print_warning("Make sure you're in the project directory and dependencies are installed")
        return False
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        return False


def test_backend_health():
    """Test backend health endpoint."""
    print_header("Testing Backend Health Endpoint")
    
    try:
        import requests
        
        backend_url = "http://127.0.0.1:8000"
        response = requests.get(f"{backend_url}/health", timeout=5)
        
        if response.status_code == 200:
            print_success(f"Backend is running on {backend_url}")
            print(f"  Response: {response.json()}")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except requests.ConnectionError:
        print_error("Cannot connect to backend at http://127.0.0.1:8000")
        print_warning("Start the backend with: uvicorn backend.main:app --reload")
        return False
    except ImportError:
        print_error("requests module not installed")
        return False
    except Exception as e:
        print_error(f"Backend test failed: {e}")
        return False


def test_cors_configuration():
    """Test CORS configuration."""
    print_header("Testing CORS Configuration")
    
    try:
        from backend.main import _cors_origins
        
        origins = _cors_origins()
        print_success("CORS origins configured:")
        for origin in origins:
            print(f"  • {origin}")
        
        # Check for common required origins
        required = [
            "http://127.0.0.1:5173",
            "http://localhost:5173"
        ]
        
        missing = [o for o in required if o not in origins]
        if missing:
            print_warning(f"Missing recommended origins: {', '.join(missing)}")
        else:
            print_success("All recommended origins are configured")
        
        return True
    except Exception as e:
        print_error(f"CORS configuration test failed: {e}")
        return False


def test_api_endpoints():
    """Test key API endpoints."""
    print_header("Testing API Endpoints")
    
    try:
        import requests
        
        backend_url = "http://127.0.0.1:8000"
        
        endpoints = [
            ("/api/hives", "GET"),
            ("/api/public/stats", "GET"),
            ("/api/packages", "GET"),
        ]
        
        success_count = 0
        for endpoint, method in endpoints:
            try:
                response = requests.request(
                    method, 
                    f"{backend_url}{endpoint}",
                    timeout=5
                )
                if response.status_code in [200, 201, 204]:
                    print_success(f"{method} {endpoint} → {response.status_code}")
                    success_count += 1
                else:
                    print_warning(f"{method} {endpoint} → {response.status_code}")
            except Exception as e:
                print_error(f"{method} {endpoint} → {e}")
        
        print(f"\n  {success_count}/{len(endpoints)} endpoints responding")
        return success_count > 0
    except Exception as e:
        print_error(f"API endpoint test failed: {e}")
        return False


def test_frontend_config():
    """Test frontend configuration files."""
    print_header("Testing Frontend Configuration")
    
    project_root = Path(__file__).parent
    
    # Check web/.env
    web_env = project_root / "web" / ".env"
    if web_env.exists():
        print_success("web/.env file exists")
        with open(web_env, "r") as f:
            content = f.read()
            if "VITE_API_URL" in content:
                print_success("VITE_API_URL is configured")
                # Extract the value
                for line in content.split("\n"):
                    if line.startswith("VITE_API_URL="):
                        value = line.split("=", 1)[1].strip()
                        print(f"  Value: {value}")
            else:
                print_error("VITE_API_URL not found in .env")
    else:
        print_error("web/.env file not found")
        print_warning("Create it from web/.env.example")
    
    # Check root .env.example
    root_env_example = project_root / ".env.example"
    if root_env_example.exists():
        print_success(".env.example exists in project root")
    else:
        print_warning(".env.example not found in project root")
    
    # Check Streamlit config
    streamlit_client = project_root / "frontend" / "api_client.py"
    if streamlit_client.exists():
        with open(streamlit_client, "r") as f:
            content = f.read()
            if "os.environ.get" in content and "HONEYCHAIN_API_URL" in content:
                print_success("Streamlit API URL is configurable via environment variable")
            else:
                print_warning("Streamlit API URL may be hardcoded")
    
    return True


def test_environment_variables():
    """Test environment variables."""
    print_header("Testing Environment Variables")
    
    env_vars = {
        "HONEYCHAIN_DATABASE_URL": os.environ.get("HONEYCHAIN_DATABASE_URL"),
        "HONEYCHAIN_JWT_SECRET": os.environ.get("HONEYCHAIN_JWT_SECRET"),
        "HONEYCHAIN_API_URL": os.environ.get("HONEYCHAIN_API_URL"),
        "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY"),
        "CORS_ORIGINS": os.environ.get("CORS_ORIGINS"),
    }
    
    for var, value in env_vars.items():
        if value:
            # Don't print actual secrets
            if "SECRET" in var or "KEY" in var:
                print_success(f"{var} is set (hidden)")
            else:
                print_success(f"{var} = {value}")
        else:
            print_warning(f"{var} is not set (using defaults)")
    
    return True


def main():
    """Run all connection tests."""
    print(f"\n{GREEN}{'=' * 60}")
    print("HoneyChain Connection Test Suite")
    print(f"{'=' * 60}{RESET}")
    
    tests = [
        ("Environment Variables", test_environment_variables),
        ("Frontend Configuration", test_frontend_config),
        ("Database", test_database),
        ("Backend Health", test_backend_health),
        ("CORS Configuration", test_cors_configuration),
        ("API Endpoints", test_api_endpoints),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Test '{name}' crashed: {e}")
            results.append((name, False))
    
    # Summary
    print_header("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        if result:
            print_success(name)
        else:
            print_error(name)
    
    print(f"\n{GREEN if passed == total else YELLOW}Results: {passed}/{total} tests passed{RESET}\n")
    
    if passed < total:
        print(f"{YELLOW}Some tests failed. Check the output above for details.{RESET}")
        print(f"{YELLOW}Common fixes:{RESET}")
        print(f"  1. Start backend: uvicorn backend.main:app --reload")
        print(f"  2. Install dependencies: pip install -r requirements.txt")
        print(f"  3. Create web/.env from web/.env.example")
        print(f"  4. Initialize database: python -m backend.seed")
        return 1
    else:
        print(f"{GREEN}All tests passed! Your HoneyChain setup is ready.{RESET}\n")
        return 0


if __name__ == "__main__":
    sys.exit(main())
