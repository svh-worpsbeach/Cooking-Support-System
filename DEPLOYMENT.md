# Deployment Guide - Cooking Management System

Dieses Dokument beschreibt, wie das Cooking Management System als Microservices in Docker-Containern bereitgestellt wird.

## Voraussetzungen

- Docker (Version 20.10 oder höher)
- Docker Compose (Version 2.0 oder höher)
- Mindestens 2GB freier RAM
- Mindestens 5GB freier Festplattenspeicher

## Schnellstart

### 1. Repository klonen

```bash
git clone <repository-url>
cd "Cooking Management System"
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# Bearbeiten Sie .env nach Bedarf
```

### 3. Container starten

```bash
docker-compose up -d
```

Die Anwendung ist nun verfügbar unter:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Dokumentation: http://localhost:8000/docs

### 4. Container stoppen

```bash
docker-compose down
```

## Detaillierte Konfiguration

### Umgebungsvariablen

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./cooking.db
CORS_ORIGINS=http://localhost,http://localhost:80
```

#### Frontend (Build-Zeit)
```env
VITE_API_URL=http://localhost:8000
```

### Persistente Daten

Die folgenden Daten werden persistent gespeichert:
- **Datenbank**: `./backend/cooking.db`
- **Uploads**: `./backend/uploads/`

Diese werden als Volumes gemountet und bleiben auch nach Container-Neustarts erhalten.

## Architektur

### Services

#### Backend Service
- **Image**: Python 3.11 Slim
- **Port**: 8000
- **Framework**: FastAPI mit Uvicorn
- **Datenbank**: SQLite (über Volume)
- **Health Check**: GET /api/recipes

#### Frontend Service
- **Image**: Nginx Alpine (Multi-Stage Build)
- **Port**: 80
- **Build**: Node.js 20 (Build-Stage)
- **Server**: Nginx (Production-Stage)
- **Health Check**: GET /health

### Netzwerk

Beide Services kommunizieren über ein internes Docker-Netzwerk (`cooking-network`). Das Frontend proxied API-Anfragen an das Backend.

## Produktions-Deployment

### 1. Umgebungsvariablen anpassen

Für Produktion sollten Sie folgende Anpassungen vornehmen:

```env
# Backend
DATABASE_URL=postgresql://user:password@db:5432/cooking_db
CORS_ORIGINS=https://yourdomain.com

# Frontend (Build-Zeit)
VITE_API_URL=https://api.yourdomain.com
```

### 2. HTTPS konfigurieren

Für Produktion sollten Sie einen Reverse Proxy wie Traefik oder Nginx mit SSL/TLS verwenden:

```yaml
# docker-compose.prod.yml Beispiel
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls=true"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### 3. PostgreSQL verwenden (empfohlen für Produktion)

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cooking_db
      POSTGRES_USER: cooking_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - cooking-network

  backend:
    environment:
      - DATABASE_URL=postgresql://cooking_user:secure_password@db:5432/cooking_db
    depends_on:
      - db
```

### 4. Sicherheitsempfehlungen

- Verwenden Sie starke Passwörter
- Aktivieren Sie Firewall-Regeln
- Verwenden Sie HTTPS/TLS
- Implementieren Sie Rate Limiting
- Führen Sie regelmäßige Backups durch
- Halten Sie Docker-Images aktuell

## Monitoring und Logs

### Logs anzeigen

```bash
# Alle Services
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend Health Check
curl http://localhost:8000/api/recipes

# Frontend Health Check
curl http://localhost/health
```

### Container-Status

```bash
docker-compose ps
```

## Backup und Wiederherstellung

### Backup erstellen

```bash
# Datenbank sichern
docker-compose exec backend sqlite3 /app/cooking.db .dump > backup.sql

# Uploads sichern
tar -czf uploads-backup.tar.gz backend/uploads/
```

### Backup wiederherstellen

```bash
# Datenbank wiederherstellen
cat backup.sql | docker-compose exec -T backend sqlite3 /app/cooking.db

# Uploads wiederherstellen
tar -xzf uploads-backup.tar.gz
```

## Skalierung

### Horizontale Skalierung des Backends

```bash
docker-compose up -d --scale backend=3
```

Hinweis: Für echte Lastverteilung benötigen Sie einen Load Balancer.

## Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend

# Container neu bauen
docker-compose build --no-cache
docker-compose up -d
```

### Datenbank-Probleme

```bash
# In Backend-Container einsteigen
docker-compose exec backend bash

# Datenbank-Migrationen ausführen
python migrate_add_recipe_times.py
python migrate_add_step_images.py
```

### Port-Konflikte

Wenn Port 80 oder 8000 bereits belegt ist, ändern Sie die Ports in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Externer Port:Interner Port
  
  frontend:
    ports:
      - "8080:80"
```

## Updates und Wartung

### Images aktualisieren

```bash
# Container stoppen
docker-compose down

# Neueste Änderungen pullen
git pull

# Images neu bauen
docker-compose build

# Container starten
docker-compose up -d
```

### Datenbank-Migrationen

```bash
# Backup erstellen (wichtig!)
docker-compose exec backend sqlite3 /app/cooking.db .dump > backup.sql

# Migration ausführen
docker-compose exec backend python migrate_script.py

# Bei Problemen: Backup wiederherstellen
cat backup.sql | docker-compose exec -T backend sqlite3 /app/cooking.db
```

## Performance-Optimierung

### Nginx-Caching

Die Nginx-Konfiguration enthält bereits Caching für statische Assets. Für weitere Optimierungen siehe `frontend/nginx.conf`.

### Datenbank-Optimierung

Für SQLite:
```bash
# Datenbank optimieren
docker-compose exec backend sqlite3 /app/cooking.db "VACUUM;"
docker-compose exec backend sqlite3 /app/cooking.db "ANALYZE;"
```

## Support und Dokumentation

- API-Dokumentation: http://localhost:8000/docs
- Projekt-README: [README.md](README.md)
- Architektur: [ARCHITECTURE.md](ARCHITECTURE.md)
- Implementierungsguide: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

## Lizenz

Siehe [LICENSE](LICENSE) Datei für Details.