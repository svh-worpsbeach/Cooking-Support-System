# Database Switching Guide

## Übersicht

Das Cooking Management System unterstützt mehrere Datenbank-Backends mit einfachem Wechsel zwischen ihnen:

- **SQLite** - Ideal für lokale Entwicklung (keine Installation erforderlich)
- **PostgreSQL** - Empfohlen für Produktion (schnell, zuverlässig, Open Source)
- **DB2** - Enterprise-Datenbank (für spezielle Anforderungen)
- **MySQL** - Optional unterstützt (Konfiguration erforderlich)

## Schnellstart: Datenbank wechseln

### Methode 1: Automatisches Wechsel-Skript (Empfohlen)

```bash
# Zu SQLite wechseln (lokale Entwicklung)
./switch-database.sh sqlite

# Zu PostgreSQL wechseln (Produktion)
./switch-database.sh postgresql

# Zu DB2 wechseln (Enterprise)
./switch-database.sh db2
```

Das Skript:
- Stoppt alle laufenden Container
- Erstellt die passende `.env` Konfiguration
- Startet die Services mit der gewählten Datenbank

### Methode 2: Manueller Wechsel

#### 1. Konfiguration erstellen

Kopiere die Beispiel-Konfiguration:
```bash
cp backend/.env.example backend/.env
```

Bearbeite `backend/.env` und setze `DATABASE_TYPE`:

```env
# Für SQLite
DATABASE_TYPE=sqlite

# Für PostgreSQL
DATABASE_TYPE=postgresql

# Für DB2
DATABASE_TYPE=db2
```

#### 2. Services starten

**SQLite (Entwicklung):**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**PostgreSQL:**
```bash
docker-compose -f docker-compose.postgres.yml up -d
```

**DB2:**
```bash
docker-compose up -d
```

## Detaillierte Konfiguration

### SQLite

**Vorteile:**
- Keine Installation erforderlich
- Schneller Start
- Ideal für lokale Entwicklung
- Keine Netzwerk-Latenz

**Konfiguration in `.env`:**
```env
DATABASE_TYPE=sqlite
SQLITE_DATABASE=./cooking.db
```

**Docker Compose:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Zugriff:**
- Backend: http://localhost:5580
- Frontend: http://localhost:5502
- Datenbank: `./backend/cooking.db`

### PostgreSQL

**Vorteile:**
- Produktionsreif
- Hervorragende Performance
- ACID-konform
- Große Community
- Open Source

**Konfiguration in `.env`:**
```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=cooking_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POOL_SIZE=10
MAX_OVERFLOW=20
POOL_PRE_PING=true
```

**Docker Compose:**
```bash
docker-compose -f docker-compose.postgres.yml up -d
```

**Zugriff:**
- Backend: http://localhost:5580
- Frontend: http://localhost:5500
- PostgreSQL: localhost:5532

**Initialisierungszeit:** ~10 Sekunden

### DB2

**Vorteile:**
- Enterprise-Features
- Hohe Skalierbarkeit
- IBM Support

**Konfiguration in `.env`:**
```env
DATABASE_TYPE=db2
DB2_HOST=db2
DB2_PORT=50000
DB2_DATABASE=COOKDB
DB2_USER=db2inst1
DB2_PASSWORD=db2inst1-pwd
POOL_SIZE=10
MAX_OVERFLOW=20
POOL_PRE_PING=true
```

**Docker Compose:**
```bash
docker-compose up -d
```

**Zugriff:**
- Backend: http://localhost:5580
- Frontend: http://localhost:5501
- DB2: localhost:5500

**Initialisierungszeit:** ~3 Minuten

## Vergleich der Datenbanken

| Feature | SQLite | PostgreSQL | DB2 |
|---------|--------|------------|-----|
| Setup-Zeit | Sofort | 10 Sek | 3 Min |
| Produktion | ❌ | ✅ | ✅ |
| Entwicklung | ✅ | ✅ | ⚠️ |
| Concurrent Users | Begrenzt | Hoch | Sehr Hoch |
| Speicher | Datei | Server | Server |
| Kosten | Kostenlos | Kostenlos | Lizenz |

## Häufige Aufgaben

### Datenbank zurücksetzen

**SQLite:**
```bash
rm backend/cooking.db
# Neustart erstellt neue Datenbank
```

**PostgreSQL:**
```bash
docker-compose -f docker-compose.postgres.yml down -v
docker-compose -f docker-compose.postgres.yml up -d
```

**DB2:**
```bash
docker-compose down -v
docker-compose up -d
```

### Logs anzeigen

```bash
# Alle Services
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Datenbank
docker-compose logs -f postgres  # oder db2
```

### Services stoppen

```bash
# Stoppen (Daten bleiben erhalten)
docker-compose down

# Stoppen und Daten löschen
docker-compose down -v
```

### Datenbank-Verbindung testen

```bash
# Backend Health Check
curl http://localhost:5580/health

# API Test
curl http://localhost:5580/api/recipes
```

## Umgebungsspezifische Konfigurationen

### Lokale Entwicklung

Erstelle `backend/.env.local`:
```env
DATABASE_TYPE=sqlite
SQLITE_DATABASE=./cooking.db
ECHO_SQL=true  # SQL-Queries loggen
```

### Staging

Erstelle `backend/.env.staging`:
```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=staging-db.example.com
POSTGRES_PORT=5432
POSTGRES_DATABASE=cooking_staging
POSTGRES_USER=staging_user
POSTGRES_PASSWORD=staging_password
POOL_SIZE=15
MAX_OVERFLOW=30
```

### Produktion

Erstelle `backend/.env.production`:
```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=prod-db.example.com
POSTGRES_PORT=5432
POSTGRES_DATABASE=cooking_production
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=secure_password_here
POOL_SIZE=20
MAX_OVERFLOW=40
POOL_PRE_PING=true
ECHO_SQL=false
```

Dann kopiere die gewünschte Konfiguration:
```bash
cp backend/.env.production backend/.env
```

## Migration zwischen Datenbanken

### Daten exportieren (optional)

```bash
# TODO: Export-Skript erstellen
python backend/export_data.py
```

### Zu neuer Datenbank wechseln

```bash
# 1. Alte Services stoppen
docker-compose down

# 2. Neue Datenbank konfigurieren
./switch-database.sh postgresql

# 3. Daten importieren (optional)
# TODO: Import-Skript erstellen
python backend/import_data.py
```

## Fehlerbehebung

### PostgreSQL: "Connection refused"

```bash
# Prüfe ob Container läuft
docker ps | grep postgres

# Prüfe Logs
docker-compose logs postgres

# Warte auf Initialisierung
docker-compose logs -f postgres | grep "ready to accept connections"
```

### DB2: "SQL0134N Error"

Dieser Fehler wurde behoben. Siehe [`DB2_MIGRATION.md`](backend/DB2_MIGRATION.md) für Details.

### SQLite: "Database is locked"

```bash
# Stelle sicher, dass nur eine Instanz läuft
docker-compose down
docker-compose -f docker-compose.dev.yml up -d
```

### Allgemeine Verbindungsprobleme

```bash
# Prüfe Docker-Netzwerk
docker network ls
docker network inspect cooking-network

# Prüfe Container-Status
docker ps -a

# Neustart aller Services
docker-compose down
docker-compose up -d
```

## Best Practices

1. **Entwicklung**: Verwende SQLite für schnelle lokale Entwicklung
2. **Testing**: Verwende PostgreSQL für realistische Tests
3. **Staging**: Verwende die gleiche Datenbank wie in Produktion
4. **Produktion**: Verwende PostgreSQL oder DB2 mit Connection Pooling
5. **Backups**: Erstelle regelmäßige Backups der Produktionsdatenbank
6. **Secrets**: Verwende niemals Produktions-Credentials in Git
7. **Monitoring**: Überwache Datenbank-Performance in Produktion

## Weitere Ressourcen

- [DATABASE_CONFIG.md](backend/DATABASE_CONFIG.md) - Detaillierte Datenbank-Konfiguration
- [DB2_MIGRATION.md](backend/DB2_MIGRATION.md) - DB2-spezifische Migration
- [.env.example](backend/.env.example) - Alle Konfigurationsoptionen
- [PostgreSQL Dokumentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Dokumentation](https://docs.sqlalchemy.org/)