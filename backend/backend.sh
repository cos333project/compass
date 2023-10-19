#!/bin/bash
# Enable permission: `chmod +x backend.sh`
# Run: `source backend.sh`
if [ ! -d "env" ]; then
  echo "Entering environment..."
  python3 -m venv env
fi
source env/bin/activate
echo "Installing requirements..."
pip install -r requirements.txt
