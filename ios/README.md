# Cooking Management System - iOS/iPadOS App

Eine native iOS/iPadOS-Anwendung für das Cooking Management System, entwickelt mit SwiftUI.

## Features

- ✅ **Rezeptverwaltung**: Erstellen, bearbeiten und durchsuchen von Rezepten
- ✅ **Event-Planung**: Organisieren von Koch-Events mit Gästen und Rezepten
- ✅ **Werkzeugverwaltung**: Verwalten von Küchengeräten und -werkzeugen
- ✅ **Lagerverwaltung**: Überwachen von Lebensmittelvorräten
- ✅ **Standortverwaltung**: Organisieren von Lagerorten
- ✅ **Gästeverwaltung**: Verwalten von Gästen mit Ernährungseinschränkungen
- ✅ **Einkaufslisten**: Erstellen und verwalten von Einkaufslisten
- ✅ **Mehrsprachigkeit**: Deutsch und Englisch
- ✅ **Dark Mode**: Unterstützung für hellen und dunklen Modus
- ✅ **iPad-Optimierung**: Angepasste Layouts für iPad

## Anforderungen

- iOS 15.0 oder höher
- iPadOS 15.0 oder höher
- Xcode 14.0 oder höher
- Swift 5.7 oder höher

## Installation

### 1. Xcode-Projekt erstellen

Da das Projekt neu erstellt werden muss, folgen Sie diesen Schritten:

1. Öffnen Sie Xcode
2. Wählen Sie "Create a new Xcode project"
3. Wählen Sie "iOS" → "App"
4. Projekteinstellungen:
   - Product Name: `CookingManagementApp`
   - Team: Ihr Entwicklerteam
   - Organization Identifier: `com.svh.cookingmanagement`
   - Interface: SwiftUI
   - Language: Swift
   - Storage: None
5. Speichern Sie das Projekt im Verzeichnis `ios/`

### 2. Dateien hinzufügen

Fügen Sie alle Swift-Dateien aus dem Repository zum Xcode-Projekt hinzu:

1. Rechtsklick auf den Projektordner in Xcode
2. "Add Files to CookingManagementApp..."
3. Wählen Sie alle `.swift`-Dateien aus:
   - `CookingManagementApp.swift`
   - `ContentView.swift`
   - `Models/Models.swift`
   - `Services/APIService.swift`
   - `Localization/Localizable.swift`
   - `Views/Recipes/RecipesViews.swift`
   - `Views/AllOtherViews.swift`
4. Stellen Sie sicher, dass "Copy items if needed" aktiviert ist

### 3. Backend-URL konfigurieren

Die App verbindet sich standardmäßig mit `http://localhost:8000`. Um eine andere URL zu verwenden:

1. Starten Sie die App
2. Navigieren Sie zu "Mehr" → "Einstellungen"
3. Geben Sie die Backend-URL ein (z.B. `http://192.168.1.100:8000`)
4. Tippen Sie auf "Speichern"

## Projektstruktur

```
ios/
├── com.svh.cookingmanagement/
│   └── CookingManagementApp/
│       ├── CookingManagementApp/
│       │   ├── CookingManagementApp.swift    # App-Einstiegspunkt
│       │   ├── ContentView.swift              # Haupt-Tab-Navigation
│       │   ├── Models/
│       │   │   └── Models.swift               # Datenmodelle
│       │   ├── Services/
│       │   │   └── APIService.swift           # API-Client
│       │   ├── Localization/
│       │   │   └── Localizable.swift          # Übersetzungen
│       │   └── Views/
│       │       ├── Recipes/
│       │       │   └── RecipesViews.swift     # Rezept-Views
│       │       └── AllOtherViews.swift        # Alle anderen Views
├── .gitignore
└── README.md
```

## Architektur

Die App folgt dem **MVVM (Model-View-ViewModel)** Pattern:

- **Models**: Datenstrukturen, die mit dem Backend synchronisiert werden
- **Views**: SwiftUI-Views für die Benutzeroberfläche
- **ViewModels**: Geschäftslogik und Zustandsverwaltung mit `@MainActor`
- **Services**: API-Kommunikation mit async/await

### Wichtige Komponenten

#### AppState
Globaler App-Zustand für:
- Spracheinstellungen (Deutsch/Englisch)
- Dark Mode
- Wird als `@EnvironmentObject` in alle Views injiziert

#### APIService
Singleton-Service für alle API-Aufrufe:
- Generische Request-Methoden
- Automatische JSON-Serialisierung
- Fehlerbehandlung
- Bild-Upload-Unterstützung

#### Localizable
Dictionary-basierte Lokalisierung:
- Deutsch und Englisch
- String-Extension für einfachen Zugriff
- Dynamischer Sprachwechsel

## Verwendung

### Rezepte

1. Tippen Sie auf den "Rezepte"-Tab
2. Tippen Sie auf "+" zum Hinzufügen eines neuen Rezepts
3. Füllen Sie die Felder aus und tippen Sie auf "Speichern"
4. Tippen Sie auf ein Rezept, um Details anzuzeigen
5. Verwenden Sie das Menü (⋯) zum Bearbeiten oder Löschen

### Events

1. Tippen Sie auf den "Events"-Tab
2. Erstellen Sie ein neues Event mit Datum und Beschreibung
3. Fügen Sie Rezepte und Gäste hinzu (in zukünftigen Updates)

### Einstellungen

1. Navigieren Sie zu "Mehr" → "Einstellungen"
2. Ändern Sie die Sprache (Deutsch/Englisch)
3. Aktivieren/Deaktivieren Sie den Dark Mode
4. Konfigurieren Sie die Backend-URL

## API-Integration

Die App kommuniziert mit dem Backend über REST-API:

- **Base URL**: Konfigurierbar in den Einstellungen
- **Endpoints**: `/api/recipes`, `/api/events`, `/api/tools`, etc.
- **Authentifizierung**: Aktuell keine (kann hinzugefügt werden)
- **Datenformat**: JSON mit snake_case → camelCase Konvertierung

### Beispiel API-Aufruf

```swift
// Rezepte laden
let recipes = try await APIService.shared.getRecipes()

// Rezept erstellen
let newRecipe = Recipe(id: 0, name: "Pasta", ...)
let created = try await APIService.shared.createRecipe(newRecipe)

// Rezept aktualisieren
let updated = try await APIService.shared.updateRecipe(recipe)

// Rezept löschen
try await APIService.shared.deleteRecipe(id: recipe.id)
```

## Entwicklung

### Debugging

1. Wählen Sie einen Simulator oder ein verbundenes Gerät
2. Drücken Sie `Cmd + R` zum Starten
3. Verwenden Sie `Cmd + .` zum Stoppen
4. Breakpoints können in Xcode gesetzt werden

### Testing

Die App kann auf folgenden Geräten getestet werden:
- iPhone (alle Modelle ab iOS 15)
- iPad (alle Modelle ab iPadOS 15)
- Mac mit Apple Silicon (über Mac Catalyst)

### Bekannte Einschränkungen

- Keine Offline-Unterstützung (alle Daten werden vom Backend geladen)
- Keine Authentifizierung implementiert
- Bild-Upload funktioniert, aber keine Kamera-Integration
- Keine Push-Benachrichtigungen

## Fehlerbehebung

### "Cannot connect to backend"
- Überprüfen Sie, ob das Backend läuft
- Stellen Sie sicher, dass die URL in den Einstellungen korrekt ist
- Bei Verwendung von `localhost`: Verwenden Sie die IP-Adresse Ihres Computers

### "Build failed"
- Stellen Sie sicher, dass alle Dateien zum Xcode-Projekt hinzugefügt wurden
- Überprüfen Sie, dass das Deployment Target auf iOS 15.0 oder höher gesetzt ist
- Führen Sie "Clean Build Folder" aus (`Cmd + Shift + K`)

### "App crashes on launch"
- Überprüfen Sie die Xcode-Konsole auf Fehlermeldungen
- Stellen Sie sicher, dass alle ViewModels korrekt mit `@MainActor` markiert sind

## Zukünftige Erweiterungen

- [ ] Offline-Modus mit Core Data
- [ ] Authentifizierung und Benutzerverwaltung
- [ ] Kamera-Integration für Rezeptfotos
- [ ] Push-Benachrichtigungen für Events
- [ ] Widget-Unterstützung
- [ ] Apple Watch App
- [ ] Siri-Shortcuts
- [ ] iCloud-Synchronisation

## Lizenz

Dieses Projekt ist Teil des Cooking Management Systems.

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im Repository.