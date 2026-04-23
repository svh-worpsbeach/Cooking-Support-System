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
- Multiple database support: SQLite, PostgreSQL, DB2, MySQL
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

- **Container Runtime** (wähle eine Option):
  - Docker und Docker Compose (empfohlen für alle Plattformen)
  - Podman und podman-compose (Docker-Alternative, rootless, empfohlen für macOS/Linux)
  - Podman Quadlets (systemd-basiert, **nur für Linux Production**)
- **ODER für manuelle Installation**: Python 3.11+, Node.js 18+, und eine Datenbank (SQLite/PostgreSQL/DB2)
- Git

### Quick Start mit Docker oder Podman

Das Projekt unterstützt sowohl Docker als auch Podman. Das [`switch-database.sh`](switch-database.sh) Skript erkennt automatisch, welches Tool verfügbar ist.

**Empfohlene Methode für macOS/Development:**
```bash
# Verwendet automatisch podman-compose oder docker-compose
./switch-database.sh postgresql
```

**Podman Quadlets (Nur für Linux Production):**
```bash
# ⚠️ Funktioniert NICHT auf macOS (kein systemd auf Host)
# Nur auf Linux mit systemd verwenden

# Quadlets installieren
./quadlet-wrapper.sh install

# Services starten
./quadlet-wrapper.sh start

# Status prüfen
./quadlet-wrapper.sh status

# Logs anzeigen
./quadlet-wrapper.sh logs backend --follow
```

**Wichtig:** Quadlets benötigen systemd und funktionieren nur auf Linux. Auf macOS verwende `podman-compose`. Siehe [QUADLETS_GUIDE.md](QUADLETS_GUIDE.md) für Details.

**Option 1: SQLite (Development)**
```bash
./switch-database.sh sqlite
```

**Option 2: PostgreSQL (Production)**
```bash
./switch-database.sh postgresql
```

**Option 3: DB2 (Enterprise)**
```bash
./switch-database.sh db2
```

**Hinweis für Podman-Benutzer:**
- Das Skript erkennt automatisch `podman-compose` und verwendet es anstelle von Docker
- Siehe [PODMAN_GUIDE.md](PODMAN_GUIDE.md) für detaillierte Podman-spezifische Anweisungen
- Siehe [QUADLETS_GUIDE.md](QUADLETS_GUIDE.md) für systemd-basierte Container-Verwaltung (nur Linux)
- Podman läuft rootless und ist eine sichere Docker-Alternative
- **macOS**: Verwende `podman-compose`, nicht Quadlets (kein systemd auf Host)

The application will be available at:
- Frontend: http://localhost:5500 (PostgreSQL), http://localhost:5501 (DB2), http://localhost:5502 (SQLite)
- Backend API: http://localhost:5580
- API Docs: http://localhost:5580/docs

See [DATABASE_SWITCHING_GUIDE.md](DATABASE_SWITCHING_GUIDE.md) for detailed database configuration.

### Manual Installation (Without Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cooking-management-system
   ```

2. **Configure database**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and set DATABASE_TYPE=sqlite
   ```

3. **Set up the backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create uploads directory
   mkdir -p uploads/recipes uploads/tools
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   ```

5. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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

### Container Deployment (Empfohlen)

Das Projekt ist vollständig containerisiert und kann mit Docker oder Podman als Microservices bereitgestellt werden.

**Schnellstart mit Docker Compose:**
```bash
# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

**Schnellstart mit Podman Compose:**
```bash
# Container starten
podman-compose up -d

# Logs anzeigen
podman-compose logs -f

# Container stoppen
podman-compose down
```

**Automatische Erkennung mit Wrapper-Skript:**
```bash
# Verwendet automatisch docker-compose oder podman-compose
./compose-wrapper.sh up -d
./compose-wrapper.sh logs -f
./compose-wrapper.sh down

# ODER mit Podman Quadlets (nur Linux, systemd-basiert)
export USE_QUADLETS=true
./compose-wrapper.sh up -d
./compose-wrapper.sh logs -f
./compose-wrapper.sh down
```

**Hinweis:** Quadlets funktionieren nur auf Linux mit systemd. Auf macOS verwende die Standard-Methode ohne `USE_QUADLETS`.

Die Anwendung ist dann verfügbar unter:
- Frontend: http://localhost:5500 (PostgreSQL), http://localhost:5501 (DB2), http://localhost:5502 (SQLite)
- Backend API: http://localhost:5580
- API Dokumentation: http://localhost:5580/docs

**Deployment-Anleitungen:**
- **[Allgemeines Deployment](DEPLOYMENT.md)** - Standard Docker/Podman Deployment, Produktions-Setup, Monitoring
- **[Podman Guide](PODMAN_GUIDE.md)** - Podman-spezifische Anweisungen und Best Practices
- **[Quadlets Guide](QUADLETS_GUIDE.md)** - Systemd-basierte Container-Verwaltung (nur Linux Production)
- **[Synology NAS Deployment](SYNOLOGY_DEPLOYMENT.md)** - Detaillierte Anleitung für Synology DSM 8 mit Container Manager

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für:
- Produktions-Deployment
- Umgebungsvariablen-Konfiguration
- HTTPS/SSL-Setup
- DB2-Integration
- Monitoring und Logging
- Backup und Wiederherstellung
- Skalierung und Performance-Optimierung

Siehe [SYNOLOGY_DEPLOYMENT.md](SYNOLOGY_DEPLOYMENT.md) für:
- Synology DSM 8 spezifische Konfiguration
- Container Manager Setup
- Reverse Proxy und SSL-Zertifikate
- Hyper Backup Integration
- Synology-spezifisches Troubleshooting

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