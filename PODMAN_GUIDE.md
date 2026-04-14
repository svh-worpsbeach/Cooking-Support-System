# 🐳 Podman Deployment Guide

Dieser Leitfaden beschreibt die Verwendung von Podman und podman-compose als Alternative zu Docker für das Cooking Management System.

## 📋 Inhaltsverzeichnis

- [Was ist Podman?](#was-ist-podman)
- [Vorteile von Podman](#vorteile-von-podman)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Unterschiede zu Docker](#unterschiede-zu-docker)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Was ist Podman?

Podman ist eine daemonless Container-Engine für die Entwicklung, Verwaltung und Ausführung von OCI-Containern. Es ist eine vollständige Alternative zu Docker und bietet eine nahezu identische CLI.

**Hauptmerkmale:**
- Daemonless (kein Hintergrund-Daemon erforderlich)
- Rootless (Container laufen ohne Root-Rechte)
- Docker-kompatible CLI
- OCI-konform
- Unterstützt Docker Compose über podman-compose

## Vorteile von Podman

### Sicherheit
- **Rootless Containers**: Container laufen standardmäßig ohne Root-Rechte
- **Kein Daemon**: Keine privilegierten Hintergrundprozesse
- **User Namespaces**: Bessere Isolation zwischen Host und Container

### Architektur
- **Fork-Exec-Modell**: Jeder Container ist ein eigenständiger Prozess
- **Systemd-Integration**: Native Integration mit systemd für Container-Management
- **Keine zentrale Fehlerquelle**: Kein Daemon, der ausfallen kann

### Kompatibilität
- **Docker-kompatibel**: Gleiche CLI-Befehle wie Docker
- **OCI-konform**: Verwendet Standard-Container-Images
- **Docker Compose**: Unterstützung über podman-compose

## Installation

### macOS

```bash
# Mit Homebrew
brew install podman podman-compose

# Podman Machine initialisieren (erforderlich auf macOS)
podman machine init
podman machine start

# Status überprüfen
podman machine list
podman info
```

### Linux (Fedora/RHEL/CentOS)

```bash
# Podman ist oft vorinstalliert
sudo dnf install podman podman-compose

# Rootless Setup aktivieren
podman system migrate
```

### Linux (Ubuntu/Debian)

```bash
# Repository hinzufügen
sudo apt-get update
sudo apt-get -y install podman

# podman-compose installieren
pip3 install podman-compose

# Rootless Setup
podman system migrate
```

### Windows

```bash
# Mit Chocolatey
choco install podman-desktop

# Oder WSL2 mit Linux-Installation verwenden
```

## Verwendung

### Grundlegende Befehle

Podman verwendet die gleichen Befehle wie Docker:

```bash
# Container starten
podman run -d nginx

# Container auflisten
podman ps

# Images auflisten
podman images

# Container stoppen
podman stop <container-id>

# Container entfernen
podman rm <container-id>
```

### Mit dem Cooking Management System

Das Projekt erkennt automatisch, ob Podman oder Docker verfügbar ist.

#### Option 1: Automatische Erkennung mit switch-database.sh

```bash
# Das Skript erkennt automatisch podman-compose
./switch-database.sh postgresql
```

#### Option 2: Direkter Aufruf von podman-compose

```bash
# PostgreSQL starten
podman-compose up -d

# SQLite Development
podman-compose -f docker-compose.dev.yml up -d

# DB2
podman-compose -f docker-compose.db2.yml up -d

# Logs anzeigen
podman-compose logs -f

# Container stoppen
podman-compose down
```

#### Option 3: Wrapper-Skript verwenden

```bash
# Verwendet automatisch podman-compose wenn verfügbar
./compose-wrapper.sh up -d
./compose-wrapper.sh logs -f
./compose-wrapper.sh down
```

### Rootless vs. Rootful

#### Rootless (Empfohlen)

```bash
# Standardmäßig rootless
podman-compose up -d

# Vorteile:
# - Keine Root-Rechte erforderlich
# - Bessere Sicherheit
# - Isolation vom Host-System
```

#### Rootful (Falls erforderlich)

```bash
# Mit sudo für rootful
sudo podman-compose up -d

# Nur verwenden wenn:
# - Privilegierte Ports (<1024) benötigt werden
# - Spezielle Kernel-Features erforderlich sind
```

## Unterschiede zu Docker

### Port-Mapping

**Docker:**
```bash
# Ports < 1024 funktionieren mit Root-Daemon
docker run -p 80:80 nginx
```

**Podman (Rootless):**
```bash
# Ports < 1024 erfordern Anpassung oder rootful
podman run -p 8080:80 nginx

# ODER mit sysctl (einmalig):
sudo sysctl net.ipv4.ip_unprivileged_port_start=80
```

**Lösung für dieses Projekt:**
- Alle Ports sind bereits > 1024 konfiguriert
- Frontend: 5500-5502
- Backend: 5580
- Keine Anpassungen erforderlich

### Volume-Pfade

**Docker:**
```yaml
volumes:
  - ./data:/app/data
```

**Podman:**
```yaml
# Gleiche Syntax, aber Pfade relativ zum User
volumes:
  - ./data:/app/data
```

### Netzwerke

**Docker:**
- Verwendet bridge-Netzwerk standardmäßig
- DNS-Auflösung zwischen Containern

**Podman:**
- Verwendet CNI (Container Network Interface)
- DNS-Auflösung funktioniert identisch
- Rootless: Verwendet slirp4netns

### Systemd-Integration

**Podman-Vorteil:**
```bash
# Container als systemd-Service
podman generate systemd --new --name cooking-backend > /etc/systemd/system/cooking-backend.service
systemctl enable cooking-backend
systemctl start cooking-backend
```

## Troubleshooting

### Problem: "Cannot connect to Podman socket"

**Lösung:**
```bash
# Podman Machine neu starten (macOS)
podman machine stop
podman machine start

# Oder Service neu starten (Linux)
systemctl --user restart podman
```

### Problem: "Permission denied" bei Volumes

**Lösung:**
```bash
# SELinux-Kontext anpassen (Linux)
podman run -v ./data:/app/data:Z nginx

# Oder in docker-compose.yml:
volumes:
  - ./data:/app/data:Z
```

### Problem: "Port already in use"

**Lösung:**
```bash
# Ports überprüfen
podman ps -a

# Alte Container entfernen
podman-compose down
podman system prune -a
```

### Problem: "Network not found"

**Lösung:**
```bash
# Netzwerk neu erstellen
podman network create cooking-network

# Oder alle Netzwerke neu erstellen
podman-compose down
podman-compose up -d
```

### Problem: Langsame Performance auf macOS

**Lösung:**
```bash
# Podman Machine mit mehr Ressourcen
podman machine stop
podman machine rm
podman machine init --cpus 4 --memory 8192 --disk-size 50
podman machine start
```

## Best Practices

### 1. Rootless bevorzugen

```bash
# Immer rootless verwenden, außer absolut notwendig
podman-compose up -d  # Gut
sudo podman-compose up -d  # Nur wenn nötig
```

### 2. Volumes für Persistenz

```bash
# Named volumes für Datenbank-Daten
volumes:
  postgres-data:
    driver: local
```

### 3. Health Checks verwenden

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 4. Ressourcen-Limits setzen

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 5. Logs rotieren

```bash
# Podman Log-Rotation konfigurieren
# ~/.config/containers/containers.conf
[containers]
log_size_max = 10485760  # 10MB
```

### 6. Regelmäßige Wartung

```bash
# Ungenutzte Ressourcen entfernen
podman system prune -a --volumes

# Alte Images entfernen
podman image prune -a
```

### 7. Systemd für Produktion

```bash
# Container als Service
podman generate systemd --new --name cooking-backend \
  --files --restart-policy=always

# Service aktivieren
systemctl --user enable container-cooking-backend.service
```

## Vergleich: Docker vs. Podman

| Feature | Docker | Podman |
|---------|--------|--------|
| Daemon | Ja (dockerd) | Nein (daemonless) |
| Root-Rechte | Erforderlich | Optional (rootless) |
| CLI-Kompatibilität | - | 100% Docker-kompatibel |
| Systemd-Integration | Plugin | Native |
| OCI-konform | Ja | Ja |
| Docker Compose | Native | Via podman-compose |
| Kubernetes YAML | Nein | Ja (podman play kube) |
| Performance | Sehr gut | Sehr gut |
| Sicherheit | Gut | Ausgezeichnet |

## Migration von Docker zu Podman

### Schritt 1: Installation

```bash
# Podman installieren (siehe oben)
brew install podman podman-compose
```

### Schritt 2: Alias erstellen (Optional)

```bash
# In ~/.bashrc oder ~/.zshrc
alias docker=podman
alias docker-compose=podman-compose
```

### Schritt 3: Projekt starten

```bash
# Funktioniert ohne Änderungen
./switch-database.sh postgresql
```

### Schritt 4: Verifizieren

```bash
# Container überprüfen
podman ps

# Logs überprüfen
podman-compose logs -f
```

## Zusätzliche Ressourcen

- [Offizielle Podman-Dokumentation](https://docs.podman.io/)
- [Podman Desktop](https://podman-desktop.io/)
- [podman-compose GitHub](https://github.com/containers/podman-compose)
- [Rootless Containers](https://rootlesscontaine.rs/)

## Support

Bei Problemen mit Podman:

1. Überprüfe die [Troubleshooting-Sektion](#troubleshooting)
2. Konsultiere die [offizielle Dokumentation](https://docs.podman.io/)
3. Erstelle ein Issue im Projekt-Repository

---

**Made with Bob** 🐳