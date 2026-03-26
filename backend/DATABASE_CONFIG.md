# Datenbank-Konfiguration

## Übersicht

Das Cooking Management System unterstützt mehrere Datenbank-Backends mit einfachem Umschalten zwischen Entwicklungs- und Produktionsumgebungen.

## Unterstützte Datenbanken

- **SQLite** - Standard für lokale Entwicklung (keine Installation erforderlich)
- **DB2** - Produktionsdatenbank
- **PostgreSQL** - Optional unterstützt
- **MySQL** - Optional unterstützt

## Schnellstart

### Lokale Entwicklung mit SQLite

1. Kopiere die Beispiel-Konfiguration:
```bash
cp .env.example .env
```

2. Die Standardkonfiguration verwendet bereits SQLite:
```env
DATABASE_TYPE=sqlite
SQLITE_DATABASE=./cooking.db
```

3. Starte das Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Die Datenbank wird automatisch erstellt beim ersten Start.

### Produktion mit DB2

1. Aktualisiere die `.env` Datei:
```env
DATABASE_TYPE=db2
DB2_HOST=localhost
DB2_PORT=50000
DB2_DATABASE=COOKDB
DB2_USER=db2inst1
DB2_PASSWORD=db2inst1-pwd
```

2. Starte mit Docker Compose:
```bash
docker-compose up -d
```

## Konfigurationsoptionen

### Umgebungsvariablen

#### Datenbank-Typ
```env
DATABASE_TYPE=sqlite  # Optionen: sqlite, db2, postgresql, mysql
```

#### SQLite-Konfiguration
```env
SQLITE_DATABASE=./cooking.db  # Pfad zur Datenbankdatei
```

#### DB2-Konfiguration
```env
DB2_HOST=localhost
DB2_PORT=50000
DB2_DATABASE=COOKDB
DB2_USER=db2inst1
DB2_PASSWORD=db2inst1-pwd
```

#### PostgreSQL-Konfiguration
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=cooking_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

#### MySQL-Konfiguration
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=cooking_db
MYSQL_USER=root
MYSQL_PASSWORD=root
```

#### Connection Pool Einstellungen
```env
POOL_SIZE=10           # Anzahl der Verbindungen im Pool
MAX_OVERFLOW=20        # Maximale zusätzliche Verbindungen
POOL_PRE_PING=true     # Verbindungstest vor Verwendung
ECHO_SQL=false         # SQL-Queries loggen (für Debugging)
```

## Datenbank-Treiber

### Erforderliche Pakete

Die Basis-Installation enthält bereits:
- SQLite (eingebaut in Python)
- DB2 (`ibm-db`, `ibm-db-sa`)

### Optionale Datenbanken

Für PostgreSQL, füge zu `requirements.txt` hinzu:
```txt
psycopg2-binary>=2.9.9
```

Für MySQL, füge zu `requirements.txt` hinzu:
```txt
pymysql>=1.1.0
cryptography>=41.0.0
```

Dann installiere die Abhängigkeiten:
```bash
pip install -r requirements.txt
```

## Docker-Konfigurationen

### Entwicklung (SQLite)

Verwende `docker-compose.dev.yml` für lokale Entwicklung ohne DB2:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Diese Konfiguration:
- Verwendet SQLite als Datenbank
- Aktiviert Hot-Reload für Backend-Änderungen
- Benötigt keine DB2-Installation

### Produktion (DB2)

Verwende `docker-compose.yml` für Produktion:

```bash
docker-compose up -d
```

Diese Konfiguration:
- Startet DB2-Container
- Verwendet DB2 als Produktionsdatenbank
- Optimiert für Produktionsumgebung

## Umschalten zwischen Datenbanken

### Methode 1: Umgebungsvariable ändern

Einfach `DATABASE_TYPE` in der `.env` Datei ändern:

```env
# Für Entwicklung
DATABASE_TYPE=sqlite

# Für Produktion
DATABASE_TYPE=db2
```

### Methode 2: Verschiedene .env Dateien

Erstelle separate Konfigurationsdateien:

**`.env.development`:**
```env
DATABASE_TYPE=sqlite
SQLITE_DATABASE=./cooking.db
```

**`.env.production`:**
```env
DATABASE_TYPE=db2
DB2_HOST=db2
DB2_PORT=50000
DB2_DATABASE=COOKDB
DB2_USER=db2inst1
DB2_PASSWORD=db2inst1-pwd
```

Dann kopiere die gewünschte Datei:
```bash
# Für Entwicklung
cp .env.development .env

# Für Produktion
cp .env.production .env
```

## Migration zwischen Datenbanken

### Von SQLite zu DB2

1. Exportiere Daten aus SQLite (optional):
```bash
python backend/export_data.py
```

2. Ändere `DATABASE_TYPE` zu `db2` in `.env`

3. Starte die Anwendung - Tabellen werden automatisch erstellt

4. Importiere Daten (optional):
```bash
python backend/import_data.py
```

### Datenbank zurücksetzen

```bash
# SQLite
rm backend/cooking.db

# DB2 (in Docker)
docker-compose down -v
docker-compose up -d
```

## Fehlerbehebung

### SQLite: "database is locked"

- Stelle sicher, dass nur eine Instanz der Anwendung läuft
- Prüfe, ob andere Prozesse auf die Datenbankdatei zugreifen

### DB2: Verbindungsfehler

- Prüfe, ob DB2-Container läuft: `docker ps`
- Prüfe DB2-Logs: `docker logs cooking-db2`
- Warte auf Health Check: DB2 braucht ~3 Minuten zum Starten

### PostgreSQL/MySQL: Treiber nicht gefunden

- Installiere die erforderlichen Pakete:
```bash
# PostgreSQL
pip install psycopg2-binary

# MySQL
pip install pymysql cryptography
```

## Best Practices

1. **Entwicklung**: Verwende SQLite für schnelle lokale Entwicklung
2. **Testing**: Verwende SQLite oder PostgreSQL für automatisierte Tests
3. **Staging**: Verwende die gleiche Datenbank wie in Produktion (DB2)
4. **Produktion**: Verwende DB2 mit Connection Pooling

## Weitere Informationen

- [SQLAlchemy Dokumentation](https://docs.sqlalchemy.org/)
- [FastAPI Datenbank-Integration](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [DB2 Docker Image](https://hub.docker.com/r/ibm/db2)