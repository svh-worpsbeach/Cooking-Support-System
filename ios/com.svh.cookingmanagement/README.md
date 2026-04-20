# CookingManagementApp - iOS App

Eine native iOS-App für das Cooking Management System, entwickelt mit SwiftUI für iOS 17.0+.

## 📱 Projektstruktur

```
CookingManagementApp/
├── CookingManagementApp.xcodeproj/     # Xcode-Projektdatei (Xcode 16.1)
│   ├── project.pbxproj                 # Hauptprojektkonfiguration
│   └── project.xcworkspace/            # Workspace-Konfiguration
├── CookingManagementApp/               # Quellcode
│   ├── CookingManagementApp.swift      # App-Einstiegspunkt
│   ├── ContentView.swift               # Haupt-Tab-Navigation
│   ├── Models/                         # Datenmodelle
│   │   └── Models.swift                # Recipe, Event, Tool, etc.
│   ├── Services/                       # Backend-Services
│   │   └── APIService.swift            # REST API Client
│   ├── Localization/                   # Übersetzungen
│   │   └── Localizable.swift           # DE/EN Strings
│   ├── Views/                          # UI-Komponenten
│   │   ├── Recipes/                    # Rezept-Views
│   │   │   └── RecipesViews.swift
│   │   └── AllOtherViews.swift         # Events, Tools, Storage, etc.
│   ├── Assets.xcassets/                # App-Icons und Farben
│   │   ├── AppIcon.appiconset/
│   │   └── AccentColor.colorset/
│   └── Preview Content/                # SwiftUI Previews
│       └── Preview Assets.xcassets/
└── README.md                           # Diese Datei
```

## 🚀 Erste Schritte

### Voraussetzungen

- **macOS**: Sonoma 14.0 oder neuer
- **Xcode**: 16.1 oder neuer
- **iOS Deployment Target**: 17.0+
- **Swift**: 5.0+

### Projekt öffnen

1. Navigieren Sie zum Projektverzeichnis:
   ```bash
   cd ios/com.svh.cookingmanagement
   ```

2. Öffnen Sie das Xcode-Projekt:
   ```bash
   open CookingManagementApp.xcodeproj
   ```

3. Warten Sie, bis Xcode das Projekt geladen hat

### Build und Run

1. **Simulator auswählen**: 
   - Klicken Sie auf das Gerät-Dropdown in der Toolbar
   - Wählen Sie einen iOS-Simulator (z.B. "iPhone 15 Pro")

2. **Projekt bauen**:
   - Drücken Sie `⌘ + B` oder
   - Menü: Product → Build

3. **App starten**:
   - Drücken Sie `⌘ + R` oder
   - Klicken Sie auf den Play-Button in der Toolbar

### Backend-Konfiguration

Nach dem ersten Start der App:

1. Navigieren Sie zu **"Mehr"** → **"Einstellungen"**
2. Geben Sie die Backend-URL ein:
   - Lokal: `http://localhost:8000`
   - Netzwerk: `http://192.168.x.x:8000`
   - Production: `https://your-domain.com`
3. Tippen Sie auf **"Speichern"**
4. Die App ist jetzt mit dem Backend verbunden

## 📋 Features

### Implementierte Funktionen

- ✅ **Rezepte**: Anzeigen, Erstellen, Bearbeiten, Löschen
- ✅ **Events**: Event-Planung mit Kursen und Gästen
- ✅ **Tools**: Küchengeräte-Verwaltung
- ✅ **Storage**: Vorräte und Zutaten verwalten
- ✅ **Locations**: Lagerorte organisieren
- ✅ **Gäste**: Gästeverwaltung für Events
- ✅ **Einkaufslisten**: Automatische Generierung aus Events
- ✅ **Mehrsprachigkeit**: Deutsch und Englisch
- ✅ **Dark Mode**: Automatische Anpassung

### API-Integration

Die App kommuniziert mit dem Backend über REST API:

- **Base URL**: Konfigurierbar in den Einstellungen
- **Endpoints**: `/api/recipes`, `/api/events`, `/api/tools`, etc.
- **Authentication**: Aktuell keine (kann erweitert werden)
- **Image Upload**: Unterstützt für Rezepte und Tools

## 🛠️ Entwicklung

### Code-Struktur

#### Models (`Models/Models.swift`)
Alle Datenmodelle mit Codable-Konformität:
- `Recipe`, `RecipeIngredient`, `RecipeStep`
- `Event`, `EventCourse`
- `Tool`, `Storage`, `Location`
- `Guest`, `ShoppingList`

#### Services (`Services/APIService.swift`)
Zentraler API-Client mit Methoden für:
- CRUD-Operationen für alle Entitäten
- Image-Upload
- Error-Handling
- Async/Await Support

#### Views
- **Recipes**: Liste, Detail, Formular, Suche
- **Events**: Liste, Detail, Kurs-Management
- **Tools/Storage/Locations**: CRUD-Views
- **Settings**: Backend-URL, Sprache, Dark Mode

### SwiftUI Previews

Alle Views haben SwiftUI Previews für schnelle Entwicklung:

```swift
#Preview {
    RecipeListView()
        .environmentObject(AppState())
}
```

### Lokalisierung

Übersetzungen in `Localization/Localizable.swift`:

```swift
func t(_ key: String) -> String {
    let translations: [String: [String: String]] = [
        "recipes.title": ["de": "Rezepte", "en": "Recipes"],
        // ...
    ]
}
```

## 🔧 Konfiguration

### Build Settings

Wichtige Einstellungen im Xcode-Projekt:

- **Bundle Identifier**: `com.svh.cookingmanagement.CookingManagementApp`
- **Deployment Target**: iOS 17.0
- **Swift Version**: 5.0
- **Interface**: SwiftUI
- **Supported Orientations**: Portrait, Landscape

### Info.plist (Auto-generiert)

Das Projekt verwendet `GENERATE_INFOPLIST_FILE = YES`, daher wird Info.plist automatisch generiert.

Für Netzwerk-Zugriff auf HTTP (nicht HTTPS):
1. Fügen Sie manuell eine Info.plist hinzu
2. Konfigurieren Sie App Transport Security:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```

## 📱 Testing

### Simulator Testing

1. Wählen Sie verschiedene Geräte:
   - iPhone SE (kleiner Bildschirm)
   - iPhone 15 Pro (Standard)
   - iPad Pro (Tablet-Layout)

2. Testen Sie verschiedene iOS-Versionen:
   - iOS 17.0 (Minimum)
   - iOS 18.0 (Latest)

### Physisches Gerät

1. Verbinden Sie Ihr iPhone/iPad
2. Wählen Sie es als Build-Target
3. Vertrauen Sie dem Entwicklerzertifikat auf dem Gerät
4. Build und Run

## 🐛 Fehlerbehebung

### "No such module 'SwiftUI'"
**Lösung**: Deployment Target auf iOS 17.0+ setzen

### "Cannot find type 'Recipe' in scope"
**Lösung**: Stellen Sie sicher, dass `Models.swift` im Target enthalten ist

### Rote Dateien im Project Navigator
**Lösung**: 
1. Rechtsklick → "Show in Finder"
2. Überprüfen Sie den Dateipfad
3. Ggf. Datei neu hinzufügen

### Build-Fehler nach Git-Pull
**Lösung**:
1. Clean Build Folder: `⌘ + Shift + K`
2. Derived Data löschen
3. Xcode neu starten

### Backend-Verbindung schlägt fehl
**Lösung**:
1. Backend läuft: `cd backend && ./run.sh`
2. Richtige URL in Settings
3. Firewall-Einstellungen prüfen
4. Bei Simulator: `localhost` verwenden
5. Bei Gerät: IP-Adresse des Macs verwenden

## 📊 Statistiken

- **Swift-Dateien**: 7
- **Zeilen Code**: ~1.932
- **Views**: 15+
- **Models**: 10+
- **API-Endpoints**: 30+
- **Unterstützte Sprachen**: 2 (DE, EN)

## 🔄 Updates

### Version 1.0 (Aktuell)
- ✅ Vollständige CRUD-Funktionalität
- ✅ Alle Backend-Features implementiert
- ✅ Mehrsprachigkeit
- ✅ Dark Mode Support
- ✅ Image Upload

### Geplante Features
- [ ] Offline-Modus mit Core Data
- [ ] Push-Benachrichtigungen
- [ ] Widget-Support
- [ ] Apple Watch App
- [ ] iCloud-Sync

## 📄 Lizenz

Dieses Projekt ist Teil des Cooking Management Systems.

## 👨‍💻 Entwicklung

Entwickelt mit ❤️ und SwiftUI für iOS.

**Xcode Version**: 16.1  
**iOS Target**: 17.0+  
**Swift Version**: 5.0

---

**Hinweis**: Stellen Sie sicher, dass das Backend läuft, bevor Sie die App verwenden!