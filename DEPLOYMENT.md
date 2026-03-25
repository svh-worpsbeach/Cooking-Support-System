# Deployment Guide - Cooking Management System

Dieses Dokument beschreibt, wie das Cooking Management System als Microservices in Docker-Containern bereitgestellt wird.

## Voraussetzungen

- Docker (Version 20.10 oder höher)
- Docker Compose (Version 2.0 oder höher)
- Mindestens 4GB freier RAM (für DB2)
- Mindestens 10GB freier Festplattenspeicher (für DB2)

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
DATABASE_URL=db2+ibm_db://db2inst1:db2inst1-pwd@db2:50000/cookingdb
CORS_ORIGINS=http://localhost,http://localhost:80
```

#### DB2 Database
```env
DB2INSTANCE=db2inst1
DB2INST1_PASSWORD=db2inst1-pwd
DBNAME=cookingdb
```

#### Frontend (Build-Zeit)
```env
VITE_API_URL=http://localhost:8000
```

### Persistente Daten

Die folgenden Daten werden persistent gespeichert:
- **DB2 Datenbank**: Docker Volume `db2-data`
- **Uploads**: `./backend/uploads/`

Diese werden als Volumes gemountet und bleiben auch nach Container-Neustarts erhalten.

## Architektur

### Services

#### DB2 Database Service
- **Image**: IBM DB2 Community Edition
- **Port**: 50000
- **Database**: cookingdb
- **Instance**: db2inst1
- **Health Check**: DB2 connect test

#### Backend Service
- **Image**: Python 3.11 Slim
- **Port**: 8000
- **Framework**: FastAPI mit Uvicorn
- **Datenbank**: IBM DB2 (über Netzwerk)
- **Dependencies**: ibm-db, ibm-db-sa
- **Health Check**: GET /api/recipes

#### Frontend Service
- **Image**: Nginx Alpine (Multi-Stage Build)
- **Port**: 80
- **Build**: Node.js 20 (Build-Stage)
- **Server**: Nginx (Production-Stage)
- **Health Check**: GET /health

### Netzwerk

Alle Services kommunizieren über ein internes Docker-Netzwerk (`cooking-network`):
- Frontend → Backend (API-Anfragen)
- Backend → DB2 (Datenbankverbindung)

## Produktions-Deployment

### 1. Umgebungsvariablen anpassen

Für Produktion sollten Sie folgende Anpassungen vornehmen:

```env
# Backend
DATABASE_URL=db2+ibm_db://db2inst1:SECURE_PASSWORD@db2:50000/cookingdb
CORS_ORIGINS=https://yourdomain.com

# DB2 (Produktions-Passwort)
DB2INST1_PASSWORD=SECURE_PASSWORD_HERE

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

### 3. DB2 Produktions-Konfiguration

Für Produktion sollten Sie:
- Starke Passwörter verwenden
- DB2 Backup-Strategie implementieren
- DB2 Performance-Tuning durchführen
- Separate DB2-Instanz für Produktion verwenden

```yaml
services:
  db2:
    image: icr.io/db2_community/db2:latest
    environment:
      - DB2INST1_PASSWORD=${DB2_PASSWORD}
      - DBNAME=cookingdb
      - ARCHIVE_LOGS=true  # Für Backup
    volumes:
      - db2-prod-data:/database
      - ./db2-backup:/backup
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
# DB2 Datenbank sichern
docker-compose exec db2 su - db2inst1 -c "db2 backup database cookingdb to /backup"

# Backup-Datei aus Container kopieren
docker cp cooking-db2:/backup ./db2-backups/

# Uploads sichern
tar -czf uploads-backup.tar.gz backend/uploads/
```

### Backup wiederherstellen

```bash
# Backup-Datei in Container kopieren
docker cp ./db2-backups/COOKINGDB.0.db2inst1.DBPART000.20231225120000.001 cooking-db2:/backup/

# DB2 Datenbank wiederherstellen
docker-compose exec db2 su - db2inst1 -c "db2 restore database cookingdb from /backup"

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
# DB2-Status prüfen
docker-compose exec db2 su - db2inst1 -c "db2 list active databases"

# DB2-Logs anzeigen
docker-compose logs db2

# In DB2-Container einsteigen
docker-compose exec db2 bash

# Datenbank neu initialisieren (ACHTUNG: Löscht alle Daten!)
docker-compose exec db2 su - db2inst1 -c "db2 drop database cookingdb"
docker-compose exec db2 su - db2inst1 -c "db2 create database cookingdb"
docker-compose exec db2 bash /var/custom/init-db.sh
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