# iOS App Netzwerkfehler Behebung

## Problem
Die iOS-App zeigte beim Start Netzwerkfehler `-1005` ("The network connection was lost") für alle API-Anfragen.

## Ursachen
1. **Fehlende URLSession-Konfiguration**: Die App verwendete die Standard-URLSession ohne Timeout- und Verbindungseinstellungen
2. **Zu viele gleichzeitige Anfragen**: Beim App-Start wurden 6 API-Anfragen gleichzeitig gestartet, was zu Verbindungsabbrüchen führte
3. **Keine Keep-Alive-Verbindungen**: Verbindungen wurden nicht wiederverwendet

## Implementierte Lösungen

### 1. URLSession-Konfiguration (APIService.swift)
```swift
private lazy var urlSession: URLSession = {
    let configuration = URLSessionConfiguration.default
    configuration.timeoutIntervalForRequest = 30
    configuration.timeoutIntervalForResource = 60
    configuration.httpMaximumConnectionsPerHost = 4
    configuration.requestCachePolicy = .reloadIgnoringLocalCacheData
    configuration.httpShouldSetCookies = false
    configuration.httpAdditionalHeaders = [
        "Connection": "keep-alive",
        "Accept": "application/json"
    ]
    return URLSession(configuration: configuration)
}()
```

**Vorteile:**
- Längere Timeouts (30s für Anfragen, 60s für Ressourcen)
- Maximal 4 gleichzeitige Verbindungen pro Host
- Keep-Alive für Verbindungswiederverwendung
- Kein Caching für aktuelle Daten

### 2. Batch-Loading der Statistiken (AllOtherViews.swift)
Statt 6 gleichzeitige Anfragen werden diese nun in 3 Batches à 2 Anfragen aufgeteilt:

```swift
func loadStatistics() async {
    // Batch 1: Core content (Recipes, Events)
    async let recipes = loadRecipesCount()
    async let events = loadEventsCount()
    let batch1 = await (recipes, events)
    
    // Batch 2: Resources (Tools, Storage)
    async let tools = loadToolsCount()
    async let storage = loadStorageCount()
    let batch2 = await (tools, storage)
    
    // Batch 3: Additional data (Locations, Guests)
    async let locations = loadLocationsCount()
    async let guests = loadGuestsCount()
    let batch3 = await (locations, guests)
}
```

**Vorteile:**
- Reduziert die Last auf dem Server
- Verhindert Verbindungsabbrüche
- Zeigt Daten schrittweise an (bessere UX)
- Bleibt trotzdem performant durch parallele Batches

## Port-Konfiguration

### Aktueller Status
- **Backend läuft auf**: Port 8000 (siehe `backend/run.sh`)
- **iOS-App Standard**: Port 5580 (siehe `APIService.swift`)

### Optionen zur Anpassung

#### Option 1: Backend-Port ändern (Empfohlen für Entwicklung)
Ändern Sie `backend/run.sh`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5580
```

#### Option 2: iOS-App-Port ändern
Ändern Sie `APIService.swift` Zeile 8:
```swift
UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8000"
```

#### Option 3: Über iOS-Einstellungen (Flexibelste Lösung)
1. Öffnen Sie die iOS-Einstellungen
2. Scrollen Sie zur App "CookingManagement"
3. Setzen Sie "API Base URL" auf: `http://192.168.178.65:8000`

**Für physische Geräte**: Verwenden Sie die IP-Adresse Ihres Computers statt `localhost`.

## Testen der Lösung

1. **Backend starten**:
   ```bash
   cd backend
   ./run.sh
   ```

2. **iOS-App neu bauen**:
   - Öffnen Sie das Projekt in Xcode
   - Wählen Sie Ihr Zielgerät
   - Drücken Sie Cmd+R zum Bauen und Ausführen

3. **Erwartetes Verhalten**:
   - Home-Screen lädt Statistiken in 3 Batches
   - Keine Netzwerkfehler mehr
   - Logs zeigen erfolgreiche API-Aufrufe

## Debugging

### Netzwerk-Logs aktiviert
Die App loggt alle Netzwerkanfragen im Common Log Format:
```
ios-app - - [21/Apr/2026:13:46:29 +0200] "GET http://192.168.178.65:5580/api/guests HTTP/1.1" 200 1234 "-" "iOSApp/1.0" source=ios duration_ms=384.61
```

### Bei weiteren Problemen prüfen:
1. **Backend erreichbar?**
   ```bash
   curl http://localhost:8000/api/recipes
   ```

2. **Firewall-Einstellungen**: Stellen Sie sicher, dass Port 8000/5580 nicht blockiert ist

3. **Netzwerk**: Bei physischen Geräten müssen sich Computer und Gerät im selben WLAN befinden

## Weitere Optimierungen

### Für Produktion empfohlen:
1. **Retry-Logik**: Automatisches Wiederholen bei Netzwerkfehlern
2. **Offline-Modus**: Lokales Caching mit Core Data
3. **Background-Refresh**: Daten im Hintergrund aktualisieren
4. **Error-Handling**: Benutzerfreundliche Fehlermeldungen

## Änderungsverlauf
- **2026-04-21**: Initiale Behebung des Netzwerkfehlers -1005
  - URLSession-Konfiguration hinzugefügt
  - Batch-Loading implementiert
  - Dokumentation erstellt