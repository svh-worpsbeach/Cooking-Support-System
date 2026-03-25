# 🍪 Cookies Support System

A comprehensive cooking management system designed to help organize recipes, plan events, manage cooking tools, and track kitchen supplies across multiple locations.

## 📋 Overview

The Cookies Support System is a modern web application that provides four integrated components:

- **Recipe Manager** - Store and organize recipes with ingredients, steps, and images
- **Event Manager** - Plan cooking events with courses and automatic shopping lists
- **Cooking Tools Manager** - Track cooking equipment and maintain a wishlist
- **Base Storage Manager** - Manage herbs, spices, and supplies across locations

## ✨ Key Features

### Recipe Management
- Create recipes with detailed ingredients and step-by-step instructions
- Upload unlimited images for finished products and cooking process
- Organize recipes by categories
- Reference ingredients and storage items directly in recipe steps
- Automatic shopping list generation for missing ingredients

### Event Planning
- Plan cooking events with multiple courses
- Assign recipes to each course
- Track participants and dietary restrictions
- Generate comprehensive shopping lists from event recipes
- Theme-based event organization

### Tool Management
- Catalog cooking tools by location
- Track storage locations for easy finding
- Maintain a wishlist for future purchases
- Add images and descriptions for each tool

### Storage Management
- Track herbs, spices, and cooking supplies
- Organize by location (kitchen, pantry, etc.)
- Monitor stock levels and expiry dates
- Quick availability checks for recipe ingredients

### Multi-language Support
- Full interface in English and German
- Easy language switching
- Persistent language preference

### Safari Optimized
- Designed specifically for Safari on iOS, iPadOS, and macOS
- Touch-friendly interface for mobile devices
- Responsive design for all screen sizes
- PWA support for home screen installation

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Python 3.11+
- FastAPI (async web framework)
- SQLAlchemy (ORM)
- IBM DB2 (database)
- ibm-db / ibm-db-sa (DB2 drivers)
- Pydantic (data validation)

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS (styling)
- React Router (navigation)
- React Query (data fetching)
- react-i18next (internationalization)
- Axios (HTTP client)

### Project Structure

```
cooking-management-system/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── routers/        # API endpoint routers
│   │   ├── services/       # Business logic services
│   │   ├── database.py     # Database configuration
│   │   └── main.py         # FastAPI application
│   ├── uploads/            # Uploaded images
│   ├── tests/              # Backend tests
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── locales/        # Translation files
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main application
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── docs/                   # Documentation
├── ARCHITECTURE.md         # Detailed architecture
├── IMPLEMENTATION_GUIDE.md # Step-by-step guide
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cooking-management-system
   ```

2. **Set up the backend**
   ```bash
   cd backend
   
   # Install Poetry (if not already installed)
   curl -sSL https://install.python-poetry.org | python3 -
   
   # Install dependencies
   poetry install
   
   # Create uploads directory
   mkdir -p uploads/recipes uploads/tools
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   The API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

3. **Open in Safari**
   - Navigate to `http://localhost:5173` in Safari
   - For iOS/iPadOS testing, use Safari's responsive design mode or test on actual devices

## 📖 Documentation

- **[Architecture Documentation](ARCHITECTURE.md)** - Detailed system architecture, database schema, and design decisions
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation instructions
- **API Documentation** - Available at `http://localhost:8000/docs` when backend is running

## 🧪 Testing

### Backend Tests
```bash
cd backend
poetry run pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

## 🌍 Internationalization

The application supports English and German languages. Translation files are located in:
- `frontend/src/locales/en.json` (English)
- `frontend/src/locales/de.json` (German)

To add a new language:
1. Create a new translation file in `frontend/src/locales/`
2. Add the language to `frontend/src/i18n.ts`
3. Update the language switcher component

## 📱 Safari Optimization

The application is specifically optimized for Safari on:
- iOS (iPhone)
- iPadOS (iPad)
- macOS

Key optimizations include:
- Touch-friendly UI elements (44x44px minimum)
- iOS safe area support
- Native form controls
- Optimized gestures and interactions
- PWA manifest for home screen installation

## 🔒 Security

- Input validation with Pydantic schemas
- File upload validation (type and size)
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration for API access
- Error handling without exposing internal details

## 🚢 Deployment

### Docker Deployment (Empfohlen)

Das Projekt ist vollständig containerisiert und kann als Microservices bereitgestellt werden.

**Schnellstart mit Docker Compose:**
```bash
# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

Die Anwendung ist dann verfügbar unter:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Dokumentation: http://localhost:8000/docs

**Detaillierte Deployment-Anleitung:**
Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für:
- Produktions-Deployment
- Umgebungsvariablen-Konfiguration
- HTTPS/SSL-Setup
- PostgreSQL-Integration
- Monitoring und Logging
- Backup und Wiederherstellung
- Skalierung und Performance-Optimierung

### Manuelle Deployment-Optionen

**Backend (ohne Docker):**
```bash
cd backend
poetry install --no-dev
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend (ohne Docker):**
```bash
cd frontend
npm run build
# Deploy the 'dist' directory to your hosting service
```

Empfohlene Hosting-Services:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Workflow

### Backend Development
```bash
# Format code
poetry run black app/

# Type checking
poetry run mypy app/

# Run linter
poetry run flake8 app/

# Run tests
poetry run pytest
```

### Frontend Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Check CORS configuration in `backend/app/main.py`
- Ensure frontend URL is in allowed origins

**Database Locked:**
- SQLite allows only one write at a time
- Ensure no other processes are accessing the database

**Image Upload Fails:**
- Check file permissions on `backend/uploads/` directory
- Verify file size limits in backend configuration

**Language Not Switching:**
- Clear browser cache and localStorage
- Verify translation files are loaded correctly

**Safari-Specific Issues:**
- Use Safari Web Inspector for debugging
- Check console for errors
- Test on actual devices when possible

## 📊 Database Schema

The application uses IBM DB2 with the following main tables:
- `recipes` - Recipe information
- `recipe_ingredients` - Recipe ingredients
- `recipe_steps` - Recipe cooking steps
- `recipe_images` - Recipe images
- `events` - Cooking events
- `event_courses` - Event courses
- `shopping_lists` - Shopping lists
- `cooking_tools` - Cooking tools
- `storage_items` - Storage inventory
- `locations` - Physical locations

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed schema diagrams.

## 🎯 Roadmap

### Planned Features
- [ ] User authentication and authorization
- [ ] Recipe sharing and import/export
- [ ] Meal planning calendar
- [ ] Nutrition information tracking
- [ ] Recipe scaling (adjust serving sizes)
- [ ] Print-friendly recipe cards
- [ ] Voice-guided cooking mode
- [ ] Barcode scanning for inventory
- [ ] Cloud sync across devices
- [ ] Recipe recommendations based on available ingredients

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Initial planning and architecture by Bob (AI Assistant)

## 🙏 Acknowledgments

- FastAPI for the excellent async web framework
- React team for the powerful UI library
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check the documentation in the `docs/` directory
- Review the [Implementation Guide](IMPLEMENTATION_GUIDE.md)

---

**Happy Cooking! 🍳👨‍🍳👩‍🍳**