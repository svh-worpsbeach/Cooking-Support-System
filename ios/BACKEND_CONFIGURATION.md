# Backend-Konfiguration - iOS App

Die iOS-App kann mit jedem Backend verbunden werden, indem die API-URL in den Einstellungen konfiguriert wird.

## 🔧 Backend-URL konfigurieren

### In der App

1. **App starten** im Simulator oder auf dem Gerät
2. **Navigieren** zu "Mehr" → "Einstellungen"
3. **API-URL eingeben** im Textfeld unter "API URL"
   - Lokal: `http://localhost:8000`
   - Netzwerk: `http://192.168.x.x:8000`
   - Production: `https://your-domain.com`
4. **Speichern** Button drücken
5. Die App verwendet jetzt die neue URL für alle API-Anfragen

### Standard-URL

Wenn keine URL konfiguriert ist, verwendet die App:
```
http://localhost:8000
```

## 📱 Verwendung

### Lokale Entwicklung (Simulator)

```bash
# Backend starten
cd backend
./run.sh

# In der iOS-App:
# Settings → API URL: http://localhost:8000
```

### Physisches Gerät im gleichen Netzwerk

```bash
# 1. Mac IP-Adresse herausfinden
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Backend mit dieser IP starten
cd backend
./run.sh

# 3. In der iOS-App:
# Settings → API URL: http://192.168.x.x:8000
```

### Production Server

```bash
# In der iOS-App:
# Settings → API URL: https://your-domain.com
```

## 🔍 Technische Details

### Implementierung

Die Backend-URL wird in `UserDefaults` gespeichert:

```swift
// APIService.swift
private var baseURL: String {
    UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8000"
}
```

### Settings View

```swift
// AllOtherViews.swift - SettingsView
Section("settings.apiUrl".localized(appState.currentLanguage)) {
    TextField("settings.apiUrl".localized(appState.currentLanguage), text: $apiUrl)
        .autocapitalization(.none)
        .keyboardType(.URL)
    Button("common.save".localized(appState.currentLanguage)) {
        UserDefaults.standard.set(apiUrl, forKey: "apiBaseURL")
    }
}
```

### API-Anfragen

Alle API-Anfragen verwenden automatisch die konfigurierte URL:

```swift
// Beispiel: Rezepte laden
func getRecipes() async throws -> [Recipe] {
    return try await request(endpoint: "/api/recipes")
}

// Wird zu: http://configured-url/api/recipes
```

## 🌐 Unterstützte Protokolle

### HTTP (Entwicklung)

```
http://localhost:8000
http://192.168.1.100:8000
```

**Hinweis**: Für HTTP-Verbindungen (nicht HTTPS) muss App Transport Security konfiguriert werden.

### HTTPS (Production)

```
https://api.example.com
https://your-domain.com
```

**Empfohlen** für Production-Umgebungen.

## 🔐 App Transport Security (ATS)

### HTTP erlauben (nur für Entwicklung)

Falls Sie HTTP verwenden möchten, fügen Sie zu `Info.plist` hinzu:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

**Oder** spezifisch für localhost:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### Production (HTTPS)

Für Production-Server mit HTTPS ist keine spezielle Konfiguration nötig.

## 🧪 Testen der Verbindung

### 1. Backend-Status prüfen

```bash
# Terminal
curl http://localhost:8000/api/recipes

# Sollte JSON zurückgeben
```

### 2. In der App testen

1. Settings → API URL konfigurieren
2. Zu "Rezepte" navigieren
3. Rezepte sollten geladen werden

### 3. Fehlerbehandlung

Falls keine Verbindung:
- ✅ Backend läuft
- ✅ URL korrekt eingegeben
- ✅ Firewall erlaubt Verbindung
- ✅ Bei Gerät: Gleiche Netzwerk wie Mac

## 📊 API-Endpoints

Die App verwendet folgende Endpoints:

### Rezepte
```
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/{id}
PUT    /api/recipes/{id}
DELETE /api/recipes/{id}
```

### Events
```
GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
```

### Tools
```
GET    /api/tools
POST   /api/tools
GET    /api/tools/{id}
PUT    /api/tools/{id}
DELETE /api/tools/{id}
```

### Storage
```
GET    /api/storage
POST   /api/storage
GET    /api/storage/{id}
PUT    /api/storage/{id}
DELETE /api/storage/{id}
```

### Locations
```
GET    /api/locations
POST   /api/locations
GET    /api/locations/{id}
PUT    /api/locations/{id}
DELETE /api/locations/{id}
```

### Guests
```
GET    /api/guests
POST   /api/guests
GET    /api/guests/{id}
PUT    /api/guests/{id}
DELETE /api/guests/{id}
```

### Shopping Lists
```
GET    /api/shopping-lists
POST   /api/shopping-lists
GET    /api/shopping-lists/{id}
PUT    /api/shopping-lists/{id}
DELETE /api/shopping-lists/{id}
```

## 🔄 URL zur Laufzeit ändern

Die URL kann jederzeit in den Einstellungen geändert werden:

1. Neue URL eingeben
2. "Speichern" drücken
3. App verwendet sofort die neue URL
4. **Kein Neustart nötig**

## 💡 Best Practices

### Entwicklung

```swift
// Simulator
http://localhost:8000

// Physisches Gerät
http://192.168.x.x:8000
```

### Staging

```swift
https://staging.your-domain.com
```

### Production

```swift
https://api.your-domain.com
```

## 🐛 Troubleshooting

### Problem: "Cannot connect to backend"

**Lösung**:
1. Backend läuft: `cd backend && ./run.sh`
2. URL korrekt: Settings → API URL prüfen
3. Netzwerk: Gleiche Netzwerk bei physischem Gerät

### Problem: "Invalid URL"

**Lösung**:
- URL muss mit `http://` oder `https://` beginnen
- Keine Leerzeichen
- Port angeben falls nötig (z.B. `:8000`)

### Problem: "SSL Error" (HTTPS)

**Lösung**:
- Gültiges SSL-Zertifikat auf Server
- Oder HTTP für Entwicklung verwenden

## 📚 Weitere Informationen

- **Backend-Dokumentation**: `backend/README.md`
- **API-Dokumentation**: `backend/FILE_UPLOAD_API.md`
- **iOS-Setup**: `ios/XCODE_SETUP_GUIDE.md`
- **Git-Workflow**: `ios/GIT_SETUP.md`

---

**Die Backend-URL-Konfiguration ist vollständig implementiert und einsatzbereit!** 🚀