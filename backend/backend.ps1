# backend.ps1

# Navigate to backend directory if not already there
Set-Location -Path .\backend

# Check if 'env' directory exists
if (-Not (Test-Path .\env)) {
    python -m venv .\env
}

# Activate the virtual environment
. .\env\Scripts\Activate

# Install dependencies
pip install -r .\requirements.txt
