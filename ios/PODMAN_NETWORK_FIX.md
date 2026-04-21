# Podman Netzwerk-Problem für iOS-App

## Problem
Die iOS-App kann nicht auf das Backend zugreifen, obwohl der Podman-Container läuft:
- `localhost:5580` funktioniert ✅
- `192.168.178.65:5580` funktioniert nicht ❌ (Empty reply from server)

## Ursache
Podman bindet Ports standardmäßig nur an `localhost` (127.0.0.1), nicht an alle Netzwerk-Interfaces. Daher können externe Geräte (wie ein iPhone im selben WLAN) nicht auf den Container zugreifen.

## Lösungen

### Option 1: Podman mit --publish auf allen Interfaces (Empfohlen)

Stoppen Sie die Container und starten Sie sie mit expliziter IP-Bindung neu:

```bash
# Container stoppen
podman-compose down

# docker-compose.yml anpassen (Zeile 39):
# Von:  - "5580:8000"
# Zu:   - "0.0.0.0:5580:8000"

# Container neu starten
podman-compose up -d
```

**Oder** direkt in der Compose-Datei:

```yaml
services:
  backend:
    ports:
      - "0.0.0.0:5580:8000"  # Bindet an alle Interfaces
```

### Option 2: Podman Machine mit Host-Netzwerk

Wenn Sie Podman Machine verwenden:

```bash
# Podman Machine mit Host-Netzwerk neu erstellen
podman machine stop
podman machine rm
podman machine init --rootful --now
```

### Option 3: Port-Forwarding über SSH (Temporär für Tests)

```bash
# Auf dem Mac (Terminal 1):
ssh -L 0.0.0.0:5580:localhost:5580 localhost

# iOS-App kann jetzt 192.168.178.65:5580 verwenden
```

### Option 4: Lokales Backend ohne Container (Entwicklung)

Für iOS-Entwicklung ist es oft einfacher, das Backend lokal zu starten:

```bash
cd backend
./run.sh
```

Dann in der iOS-App:
```swift
// APIService.swift Zeile 8
UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://192.168.178.65:5580"
```

## Aktueller Status

### Container-Konfiguration
```bash
$ podman ps
NAMES             STATUS                  PORTS
cooking-backend   Up (healthy)            0.0.0.0:5580->8000/tcp
```

Der Port ist auf `0.0.0.0` gebunden, aber Podman Machine leitet ihn nur an localhost weiter.

### Test-Befehle
```bash
# Funktioniert ✅
curl http://localhost:5580/health

# Funktioniert nicht ❌
curl http://192.168.178.65:5580/health
# Fehler: Empty reply from server
```

## Empfohlene Lösung für iOS-Entwicklung

**Verwenden Sie Option 4**: Starten Sie das Backend lokal ohne Container:

1. **Backend starten**:
   ```bash
   cd backend
   source venv/bin/activate  # Falls vorhanden
   ./run.sh
   ```

2. **iOS-App konfigurieren**:
   - Öffnen Sie Xcode
   - Gehen Sie zu Settings → CookingManagement
   - Setzen Sie API Base URL auf: `http://192.168.178.65:5580`

3. **Vorteile**:
   - Keine Podman-Netzwerk-Probleme
   - Schnellere Entwicklung (Hot-Reload)
   - Einfacheres Debugging
   - Direkter Zugriff auf Logs

## Firewall-Prüfung

Falls Option 4 auch nicht funktioniert, prüfen Sie die macOS-Firewall:

```bash
# Firewall-Status prüfen
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Falls aktiviert, Python erlauben:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3
```

## Nächste Schritte

1. Wählen Sie eine der Lösungen oben
2. Testen Sie mit: `curl http://192.168.178.65:5580/health`
3. Wenn erfolgreich, testen Sie die iOS-App
4. Bei Problemen: Prüfen Sie Firewall und Netzwerk-Einstellungen

## Debugging

### Container-Logs prüfen
```bash
podman logs cooking-backend --tail 50
```

### Netzwerk-Verbindung testen
```bash
# Von einem anderen Gerät im WLAN:
curl -v http://192.168.178.65:5580/health

# Oder mit netcat:
nc -zv 192.168.178.65 5580
```

### Podman-Netzwerk prüfen
```bash
podman network ls
podman network inspect cooking-network