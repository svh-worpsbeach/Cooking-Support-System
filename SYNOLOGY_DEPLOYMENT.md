# Synology DSM 8 Deployment Guide - Cooking Management System

Detaillierte Anleitung zur Bereitstellung des Cooking Management Systems auf Synology NAS mit DSM 8 und Container Manager.

## 📋 Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Vorbereitung](#vorbereitung)
3. [Container Manager Setup](#container-manager-setup)
4. [Deployment-Methoden](#deployment-methoden)
5. [Konfiguration](#konfiguration)
6. [Zugriff und Verwaltung](#zugriff-und-verwaltung)
7. [Backup und Wartung](#backup-und-wartung)
8. [Troubleshooting](#troubleshooting)
9. [Performance-Optimierung](#performance-optimierung)

---

## Voraussetzungen

### Hardware-Anforderungen
- **Synology NAS** mit DSM 8.0 oder höher
- **Mindestens 4GB RAM** (8GB empfohlen für DB2)
- **10GB freier Speicherplatz** (für DB2 und Container-Images)
- **CPU**: x86_64 Architektur (Intel/AMD)

### Software-Anforderungen
- **Container Manager** (ehemals Docker) installiert
- **SSH-Zugriff** aktiviert (optional, für erweiterte Konfiguration)
- **File Station** für Datei-Management

### Netzwerk-Anforderungen
- Statische IP-Adresse für das NAS (empfohlen)
- Ports verfügbar:
  - `80` - Frontend (HTTP)
  - `443` - Frontend (HTTPS, optional)
  - `8000` - Backend API
  - `50000` - DB2 Database (nur intern)

---

## Vorbereitung

### 1. Container Manager installieren

1. Öffnen Sie das **Paket-Zentrum**
2. Suchen Sie nach **"Container Manager"**
3. Klicken Sie auf **Installieren**
4. Warten Sie, bis die Installation abgeschlossen ist

### 2. Projektverzeichnis erstellen

1. Öffnen Sie **File Station**
2. Navigieren Sie zu einem geeigneten Speicherort (z.B. `/docker/`)
3. Erstellen Sie einen neuen Ordner: `cooking-management-system`
4. Erstellen Sie folgende Unterordner:
   ```
   cooking-management-system/
   ├── backend/
   ├── frontend/
   ├── db2-data/          # Für DB2 Persistenz
   └── uploads/           # Für hochgeladene Bilder
       ├── recipes/
       └── tools/
   ```

### 3. Projekt-Dateien hochladen

**Option A: Via Git (empfohlen)**
1. Aktivieren Sie SSH auf Ihrem Synology NAS
2. Verbinden Sie sich via SSH:
   ```bash
   ssh admin@your-nas-ip
   ```
3. Navigieren Sie zum Projektverzeichnis:
   ```bash
   cd /volume1/docker/cooking-management-system
   ```
4. Klonen Sie das Repository:
   ```bash
   git clone <repository-url> .
   ```

**Option B: Via File Station**
1. Laden Sie das Projekt als ZIP herunter
2. Entpacken Sie es lokal
3. Laden Sie alle Dateien via File Station hoch

---

## Container Manager Setup

### Methode 1: Docker Compose (Empfohlen)

#### 1. Docker Compose Datei vorbereiten

Erstellen Sie eine `docker-compose.synology.yml` im Projektverzeichnis:

```yaml
version: '3.8'

services:
  # DB2 Database Service
  db2:
    image: icr.io/db2_community/db2:latest
    container_name: cooking-db2
    privileged: true
    ports:
      - "50000:50000"
    environment:
      - LICENSE=accept
      - DB2INSTANCE=db2inst1
      - DB2INST1_PASSWORD=SecurePassword123!
      - DBNAME=COOKDB
      - ARCHIVE_LOGS=false
      - AUTOCONFIG=false
    volumes:
      - /volume1/docker/cooking-management-system/db2-data:/database
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "su - db2inst1 -c 'db2 connect to COOKDB' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 180s
    networks:
      - cooking-network

  # Backend API Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cooking-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=db2+ibm_db://db2inst1:SecurePassword123!@db2:50000/COOKDB
      - CORS_ORIGINS=http://your-nas-ip,http://your-nas-ip:80,http://frontend
    volumes:
      - /volume1/docker/cooking-management-system/uploads:/app/uploads
    depends_on:
      db2:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - cooking-network

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://your-nas-ip:8000
    container_name: cooking-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - cooking-network

networks:
  cooking-network:
    driver: bridge

volumes:
  db2-data:
    driver: local
```

**Wichtig:** Ersetzen Sie `your-nas-ip` mit der tatsächlichen IP-Adresse Ihres NAS!

#### 2. Container Manager Projekt erstellen

1. Öffnen Sie **Container Manager**
2. Gehen Sie zu **Projekt**
3. Klicken Sie auf **Erstellen**
4. Konfigurieren Sie:
   - **Projektname**: `cooking-management-system`
   - **Pfad**: `/docker/cooking-management-system`
   - **Quelle**: Vorhandene docker-compose.yml verwenden
   - Wählen Sie `docker-compose.synology.yml`
5. Klicken Sie auf **Weiter** und dann **Fertig**

#### 3. Projekt starten

1. Wählen Sie das Projekt aus
2. Klicken Sie auf **Aktion** → **Erstellen**
3. Warten Sie, bis alle Container gestartet sind (ca. 5-10 Minuten beim ersten Start)

### Methode 2: Manuelle Container-Erstellung

Falls Docker Compose nicht funktioniert, können Sie Container manuell erstellen:

#### 1. DB2 Container erstellen

1. Öffnen Sie **Container Manager** → **Container**
2. Klicken Sie auf **Erstellen**
3. Suchen Sie nach `icr.io/db2_community/db2`
4. Konfigurieren Sie:
   - **Container-Name**: `cooking-db2`
   - **Port-Einstellungen**:
     - Lokal: `50000` → Container: `50000`
   - **Umgebungsvariablen**:
     ```
     LICENSE=accept
     DB2INSTANCE=db2inst1
     DB2INST1_PASSWORD=SecurePassword123!
     DBNAME=COOKDB
     ARCHIVE_LOGS=false
     ```
   - **Volume-Einstellungen**:
     - Ordner: `/docker/cooking-management-system/db2-data`
     - Mount-Pfad: `/database`
   - **Netzwerk**: Bridge
   - **Privilegierter Modus**: Aktiviert
5. Klicken Sie auf **Fertig**

#### 2. Backend Container erstellen

1. Erstellen Sie zuerst das Backend-Image:
   - Gehen Sie zu **Image**
   - Klicken Sie auf **Hinzufügen** → **Aus Datei hinzufügen**
   - Wählen Sie `backend/Dockerfile`
   - Build-Name: `cooking-backend:latest`

2. Erstellen Sie den Container:
   - **Container-Name**: `cooking-backend`
   - **Image**: `cooking-backend:latest`
   - **Port-Einstellungen**:
     - Lokal: `8000` → Container: `8000`
   - **Umgebungsvariablen**:
     ```
     DATABASE_URL=db2+ibm_db://db2inst1:SecurePassword123!@cooking-db2:50000/COOKDB
     CORS_ORIGINS=http://your-nas-ip,http://your-nas-ip:80
     ```
   - **Volume-Einstellungen**:
     - Ordner: `/docker/cooking-management-system/uploads`
     - Mount-Pfad: `/app/uploads`
   - **Links**: `cooking-db2:db2`

#### 3. Frontend Container erstellen

1. Erstellen Sie das Frontend-Image:
   - Build-Argument: `VITE_API_URL=http://your-nas-ip:8000`
   - Build-Name: `cooking-frontend:latest`

2. Erstellen Sie den Container:
   - **Container-Name**: `cooking-frontend`
   - **Image**: `cooking-frontend:latest`
   - **Port-Einstellungen**:
     - Lokal: `80` → Container: `80`
   - **Links**: `cooking-backend:backend`

---

## Konfiguration

### Umgebungsvariablen anpassen

#### Für Produktion

Bearbeiten Sie die Umgebungsvariablen in Container Manager:

**Backend:**
```env
DATABASE_URL=db2+ibm_db://db2inst1:IhrSicheresPasswort@db2:50000/COOKDB
CORS_ORIGINS=http://192.168.1.100,https://cooking.yourdomain.com
```

**Frontend Build-Args:**
```env
VITE_API_URL=http://192.168.1.100:8000
# oder für HTTPS:
VITE_API_URL=https://api.cooking.yourdomain.com
```

### Reverse Proxy einrichten (Optional)

Für HTTPS-Zugriff über Synology's Reverse Proxy:

1. Öffnen Sie **Systemsteuerung** → **Anmeldungsportal** → **Erweitert**
2. Klicken Sie auf **Reverse Proxy** → **Erstellen**

**Frontend Proxy:**
- **Beschreibung**: Cooking Frontend
- **Quelle**:
  - Protokoll: HTTPS
  - Hostname: cooking.yourdomain.com
  - Port: 443
- **Ziel**:
  - Protokoll: HTTP
  - Hostname: localhost
  - Port: 80

**Backend API Proxy:**
- **Beschreibung**: Cooking Backend API
- **Quelle**:
  - Protokoll: HTTPS
  - Hostname: api.cooking.yourdomain.com
  - Port: 443
- **Ziel**:
  - Protokoll: HTTP
  - Hostname: localhost
  - Port: 8000

3. Aktivieren Sie **HSTS** und **HTTP/2** für bessere Sicherheit

### SSL-Zertifikat einrichten

1. Gehen Sie zu **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. Fügen Sie ein Let's Encrypt Zertifikat hinzu oder importieren Sie Ihr eigenes
3. Weisen Sie das Zertifikat dem Reverse Proxy zu

---

## Zugriff und Verwaltung

### Anwendung aufrufen

Nach erfolgreichem Start:

- **Frontend**: `http://your-nas-ip` oder `https://cooking.yourdomain.com`
- **Backend API**: `http://your-nas-ip:8000`
- **API Dokumentation**: `http://your-nas-ip:8000/docs`

### Container-Verwaltung

**Container starten/stoppen:**
1. Öffnen Sie **Container Manager** → **Container**
2. Wählen Sie den Container aus
3. Klicken Sie auf **Aktion** → **Starten/Stoppen**

**Logs anzeigen:**
1. Wählen Sie den Container aus
2. Klicken Sie auf **Details**
3. Gehen Sie zum Tab **Log**

**Container-Terminal öffnen:**
1. Wählen Sie den Container aus
2. Klicken Sie auf **Details**
3. Gehen Sie zum Tab **Terminal**
4. Klicken Sie auf **Mit Bash erstellen**

### Ressourcen-Überwachung

1. Öffnen Sie **Container Manager** → **Container**
2. Wählen Sie einen Container aus
3. Klicken Sie auf **Details** → **Ressourcen**
4. Überwachen Sie CPU, RAM und Netzwerk-Nutzung

---

## Backup und Wartung

### Automatisches Backup einrichten

#### 1. Hyper Backup konfigurieren

1. Installieren Sie **Hyper Backup** aus dem Paket-Zentrum
2. Erstellen Sie eine neue Backup-Aufgabe
3. Wählen Sie folgende Ordner:
   - `/docker/cooking-management-system/db2-data`
   - `/docker/cooking-management-system/uploads`
4. Konfigurieren Sie Zeitplan (z.B. täglich um 2:00 Uhr)

#### 2. Manuelles Backup

**Via Container Manager:**
```bash
# SSH-Verbindung zum NAS
ssh admin@your-nas-ip

# DB2 Backup erstellen
docker exec cooking-db2 su - db2inst1 -c "db2 backup database COOKDB to /database/backup"

# Backup-Dateien kopieren
sudo cp -r /volume1/docker/cooking-management-system/db2-data/backup /volume1/backups/cooking-db2-$(date +%Y%m%d)

# Uploads sichern
sudo tar -czf /volume1/backups/cooking-uploads-$(date +%Y%m%d).tar.gz /volume1/docker/cooking-management-system/uploads
```

### Backup wiederherstellen

```bash
# DB2 Backup wiederherstellen
docker exec cooking-db2 su - db2inst1 -c "db2 restore database COOKDB from /database/backup"

# Uploads wiederherstellen
sudo tar -xzf /volume1/backups/cooking-uploads-20240325.tar.gz -C /
```

### Updates durchführen

#### Container-Images aktualisieren

1. Öffnen Sie **Container Manager** → **Image**
2. Wählen Sie das Image aus
3. Klicken Sie auf **Aktualisieren**
4. Starten Sie die Container neu

#### Projekt-Code aktualisieren

```bash
# Via SSH
cd /volume1/docker/cooking-management-system
git pull origin main

# Container neu bauen
docker-compose -f docker-compose.synology.yml build
docker-compose -f docker-compose.synology.yml up -d
```

---

## Troubleshooting

### Häufige Probleme

#### Container startet nicht

**Problem**: DB2 Container startet nicht
**Lösung**:
```bash
# Logs prüfen
docker logs cooking-db2

# Berechtigungen prüfen
sudo chmod -R 777 /volume1/docker/cooking-management-system/db2-data

# Container neu erstellen
docker rm cooking-db2
# Dann Container neu erstellen via Container Manager
```

#### Verbindungsfehler Backend → DB2

**Problem**: Backend kann nicht mit DB2 verbinden
**Lösung**:
1. Prüfen Sie, ob DB2 läuft: `docker ps | grep cooking-db2`
2. Prüfen Sie die Netzwerk-Verbindung:
   ```bash
   docker exec cooking-backend ping db2
   ```
3. Prüfen Sie die DATABASE_URL Umgebungsvariable
4. Warten Sie 3-5 Minuten nach DB2-Start (Initialisierung)

#### Frontend zeigt API-Fehler

**Problem**: Frontend kann Backend nicht erreichen
**Lösung**:
1. Prüfen Sie CORS-Einstellungen im Backend
2. Prüfen Sie VITE_API_URL im Frontend
3. Testen Sie Backend direkt: `curl http://your-nas-ip:8000/health`
4. Prüfen Sie Firewall-Regeln auf dem NAS

#### Speicherplatz-Probleme

**Problem**: DB2 benötigt zu viel Speicher
**Lösung**:
```bash
# DB2 Logs bereinigen
docker exec cooking-db2 su - db2inst1 -c "db2 prune history 30"

# Alte Backups löschen
docker exec cooking-db2 su - db2inst1 -c "db2 list history backup all for COOKDB"
docker exec cooking-db2 su - db2inst1 -c "db2 prune history <timestamp>"
```

#### Port-Konflikte

**Problem**: Port 80 oder 8000 bereits belegt
**Lösung**:
1. Ändern Sie die Port-Mappings in Container Manager
2. Beispiel: `8080:80` statt `80:80`
3. Aktualisieren Sie CORS und API-URLs entsprechend

### Debug-Modus aktivieren

**Backend Debug-Logs:**
```bash
# Umgebungsvariable hinzufügen
LOG_LEVEL=DEBUG

# Container neu starten
docker restart cooking-backend
```

**Frontend Debug:**
1. Öffnen Sie Browser-Entwicklertools (F12)
2. Prüfen Sie Console und Network-Tab
3. Aktivieren Sie "Preserve log"

### Performance-Probleme

**DB2 Performance verbessern:**
```bash
# In DB2 Container
docker exec -it cooking-db2 su - db2inst1

# DB2 Konfiguration optimieren
db2 update db cfg for COOKDB using LOGFILSIZ 4096
db2 update db cfg for COOKDB using LOGPRIMARY 20
db2 update db cfg for COOKDB using LOGSECOND 40
db2 update db cfg for COOKDB using SORTHEAP 2048
db2 update db cfg for COOKDB using SHEAPTHRES 0

# Datenbank neu starten
db2stop
db2start
```

---

## Performance-Optimierung

### Ressourcen-Limits setzen

In Container Manager → Container → Details → Ressourcen:

**DB2:**
- CPU-Limit: 2 Kerne
- RAM-Limit: 4GB (Minimum), 8GB (empfohlen)

**Backend:**
- CPU-Limit: 1 Kern
- RAM-Limit: 1GB

**Frontend:**
- CPU-Limit: 0.5 Kerne
- RAM-Limit: 512MB

### Caching optimieren

**Nginx Caching (Frontend):**
Die `frontend/nginx.conf` enthält bereits optimierte Cache-Einstellungen.

**Browser-Caching:**
Wird automatisch durch Nginx konfiguriert.

### Netzwerk-Optimierung

1. Verwenden Sie statische IP für das NAS
2. Aktivieren Sie Jumbo Frames (MTU 9000) wenn möglich
3. Verwenden Sie Gigabit-Ethernet oder besser

### SSD-Cache nutzen

Falls Ihr NAS SSD-Cache unterstützt:
1. Gehen Sie zu **Speicher-Manager** → **SSD-Cache**
2. Erstellen Sie einen Read-Write Cache
3. Wählen Sie die Docker-Volumes aus

---

## Sicherheitsempfehlungen

### 1. Starke Passwörter verwenden

Ändern Sie alle Standard-Passwörter:
- DB2: `DB2INST1_PASSWORD`
- Synology Admin-Konto
- Reverse Proxy Authentifizierung

### 2. Firewall konfigurieren

1. Öffnen Sie **Systemsteuerung** → **Sicherheit** → **Firewall**
2. Erstellen Sie Regeln:
   - Erlauben: Port 80, 443 (von überall)
   - Erlauben: Port 8000 (nur lokales Netzwerk)
   - Blockieren: Port 50000 (DB2, nur intern)

### 3. Auto-Block aktivieren

1. Gehen Sie zu **Systemsteuerung** → **Sicherheit** → **Konto**
2. Aktivieren Sie **Auto-Blockierung**
3. Setzen Sie Schwellenwert auf 5 Versuche

### 4. Regelmäßige Updates

- Halten Sie DSM aktuell
- Aktualisieren Sie Container-Images monatlich
- Überwachen Sie Security-Advisories

### 5. Netzwerk-Segmentierung

Verwenden Sie VLANs um Docker-Container zu isolieren:
1. Erstellen Sie ein separates VLAN für Container
2. Konfigurieren Sie Firewall-Regeln zwischen VLANs
3. Erlauben Sie nur notwendige Verbindungen

---

## Erweiterte Konfiguration

### Multi-User Setup

Für mehrere Benutzer mit unterschiedlichen Berechtigungen:

1. Implementieren Sie Authentifizierung im Backend
2. Verwenden Sie Synology's LDAP/AD Integration
3. Konfigurieren Sie Reverse Proxy mit Authentifizierung

### Hochverfügbarkeit

Für kritische Deployments:

1. Verwenden Sie Synology High Availability (SHA)
2. Konfigurieren Sie externe DB2-Instanz
3. Implementieren Sie Load Balancing

### Monitoring einrichten

**Mit Synology Log Center:**
1. Installieren Sie **Log Center**
2. Konfigurieren Sie Container-Log-Sammlung
3. Erstellen Sie Benachrichtigungsregeln

**Mit externen Tools:**
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog oder New Relic

---

## Support und Ressourcen

### Dokumentation
- [Hauptdokumentation](README.md)
- [Architektur](ARCHITECTURE.md)
- [Allgemeines Deployment](DEPLOYMENT.md)

### Synology Ressourcen
- [Synology Knowledge Base](https://kb.synology.com/)
- [Container Manager Dokumentation](https://kb.synology.com/en-global/DSM/help/ContainerManager)
- [Synology Community Forum](https://community.synology.com/)

### Hilfe erhalten

Bei Problemen:
1. Prüfen Sie die Logs in Container Manager
2. Konsultieren Sie dieses Dokument
3. Öffnen Sie ein Issue auf GitHub
4. Fragen Sie in der Synology Community

---

## Checkliste für Deployment

- [ ] Container Manager installiert
- [ ] Projektverzeichnis erstellt
- [ ] Projekt-Dateien hochgeladen
- [ ] `docker-compose.synology.yml` angepasst (IP-Adressen, Passwörter)
- [ ] Container erstellt und gestartet
- [ ] DB2 vollständig initialisiert (3-5 Minuten warten)
- [ ] Backend erreichbar (`http://nas-ip:8000/health`)
- [ ] Frontend erreichbar (`http://nas-ip`)
- [ ] Reverse Proxy konfiguriert (optional)
- [ ] SSL-Zertifikat eingerichtet (optional)
- [ ] Firewall-Regeln konfiguriert
- [ ] Backup-Strategie implementiert
- [ ] Monitoring eingerichtet
- [ ] Dokumentation gelesen

---

**Viel Erfolg mit Ihrem Cooking Management System auf Synology NAS! 🍳**

*Made with Bob*