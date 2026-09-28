#!/bin/bash
set -e

echo "==> Starting HoneyChain Backend"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Script directory: $SCRIPT_DIR"
echo "Current directory: $(pwd)"

# Change to the script directory (project root)
cd "$SCRIPT_DIR"

echo "Changed to: $(pwd)"

# Set PYTHONPATH to project root
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

echo "PYTHONPATH: $PYTHONPATH"

# Verify backend directory exists
if [ -d "backend" ]; then
    echo "✅ backend directory found"
    ls -la backend/ | head -10
else
    echo "❌ backend directory NOT found"
    echo "Contents of current directory:"
    ls -la
    exit 1
fi

# Start uvicorn directly with the module path
echo "==> Starting uvicorn..."
exec python -m uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
