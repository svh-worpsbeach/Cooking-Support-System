#!/bin/bash
# Load seed data into DB2 database

set -e

echo "Waiting for DB2 and backend to be ready..."
sleep 45

echo "Loading seed data via API..."

# Wait for backend API to be available
until curl -f http://backend:8000/api/recipes > /dev/null 2>&1; do
    echo "Waiting for backend API..."
    sleep 5
done

echo "Backend API is ready. Loading seed data..."

# Run the Python seed data script
cd /app
python seed_data.py

echo "Seed data loaded successfully!"

# Made with Bob
