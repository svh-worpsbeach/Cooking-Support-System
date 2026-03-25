# Cooking Management System - Backend

Python FastAPI backend for the Cookies Support System.

## Setup

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Or use the provided script:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy database models
│   ├── schemas/         # Pydantic validation schemas
│   ├── routers/         # API endpoint routers
│   ├── services/        # Business logic services
│   ├── database.py      # Database configuration
│   └── main.py          # FastAPI application
├── uploads/             # Uploaded images
│   ├── recipes/
│   └── tools/
├── tests/               # Backend tests
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Database

The application uses SQLite with the database file `cooking_system.db` created in the backend directory.

## Development

### Running Tests
```bash
pytest tests/ -v
```

### Code Formatting
```bash
black app/
```

### Type Checking
```bash
mypy app/