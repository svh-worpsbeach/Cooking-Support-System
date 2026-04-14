# Xcode Setup Guide - CookingManagementApp

## Schritt-für-Schritt Anleitung zum Hinzufügen der Swift-Dateien

### 1. Xcode-Projekt öffnen

Öffnen Sie das Xcode-Projekt:
```bash
cd ios/com.svh.cookingmanagement/CookingManagementApp
open CookingManagementApp.xcodeproj
```

Falls kein Xcode-Projekt existiert, erstellen Sie ein neues:

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
5. Speichern Sie das Projekt im Verzeichnis `ios/com.svh.cookingmanagement/`

### 2. Alle Swift-Dateien zum Projekt hinzufügen

#### Option A: Über Xcode GUI

1. Rechtsklick auf den `CookingManagementApp`-Ordner im Project Navigator
2. Wählen Sie "Add Files to CookingManagementApp..."
3. Navigieren Sie zu `ios/com.svh.cookingmanagement/CookingManagementApp/`
4. Wählen Sie **alle** folgenden Dateien und Ordner aus:
   - `CookingManagementApp.swift`
   - `ContentView.swift`
   - `Models/` (gesamter Ordner)
   - `Services/` (gesamter Ordner)
   - `Localization/` (gesamter Ordner)
   - `Views/` (gesamter Ordner)
5. **WICHTIG**: Aktivieren Sie diese Optionen:
   - ✅ "Copy items if needed" (falls noch nicht im Projekt)
   - ✅ "Create groups" (nicht "Create folder references")
   - ✅ "Add to targets: CookingManagementApp"
6. Klicken Sie auf "Add"

#### Option B: Über Terminal (falls Dateien bereits im richtigen Verzeichnis sind)

Falls die Dateien bereits im Projektverzeichnis sind, aber nicht im Xcode-Projekt erscheinen:

1. Schließen Sie Xcode
2. Öffnen Sie die `.xcodeproj/project.pbxproj` Datei in einem Texteditor
3. Fügen Sie die Dateireferenzen manuell hinzu (kompliziert, nicht empfohlen)
4. **ODER** löschen Sie das Xcode-Projekt und erstellen Sie es neu (siehe Schritt 1)

### 3. Projektstruktur im Xcode Project Navigator überprüfen

Nach dem Hinzufügen sollte die Struktur so aussehen:

```
CookingManagementApp
├── CookingManagementApp.swift
├── ContentView.swift
├── Models
│   └── Models.swift
├── Services
│   └── APIService.swift
├── Localization
│   └── Localizable.swift
└── Views
    ├── Recipes
    │   └── RecipesViews.swift
    └── AllOtherViews.swift
```

### 4. Build Settings überprüfen

1. Wählen Sie das Projekt im Project Navigator
2. Wählen Sie das Target "CookingManagementApp"
3. Gehen Sie zu "Build Settings"
4. Überprüfen Sie:
   - **iOS Deployment Target**: 15.0 oder höher
   - **Swift Language Version**: Swift 5

### 5. Info.plist konfigurieren (falls nötig)

Falls die App auf das Netzwerk zugreifen muss (für API-Calls):

1. Öffnen Sie `Info.plist`
2. Fügen Sie hinzu (falls nicht vorhanden):
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```
   **Hinweis**: Dies ist nur für Entwicklung/Testing. Für Production sollten Sie spezifische Domains whitelisten.

### 6. Build und Run

1. Wählen Sie einen Simulator oder ein verbundenes Gerät
2. Drücken Sie `Cmd + B` zum Bauen
3. Drücken Sie `Cmd + R` zum Starten

### Fehlerbehebung

#### Problem: "No such module 'SwiftUI'"
**Lösung**: Stellen Sie sicher, dass das Deployment Target auf iOS 15.0 oder höher gesetzt ist.

#### Problem: "Cannot find type 'Recipe' in scope"
**Lösung**: Stellen Sie sicher, dass `Models/Models.swift` zum Projekt hinzugefügt wurde und im Target enthalten ist.

#### Problem: Dateien erscheinen rot im Project Navigator
**Lösung**: 
1. Rechtsklick auf die rote Datei
2. Wählen Sie "Show in Finder"
3. Überprüfen Sie, ob die Datei am richtigen Ort ist
4. Falls nicht, verschieben Sie sie oder aktualisieren Sie den Pfad in Xcode

#### Problem: "Duplicate symbol" Fehler
**Lösung**: Überprüfen Sie, dass keine Dateien doppelt zum Projekt hinzugefügt wurden.

### 7. Erste Schritte nach dem Start

1. Die App startet mit dem Home-Tab
2. Navigieren Sie zu "Mehr" → "Einstellungen"
3. Geben Sie die Backend-URL ein (z.B. `http://192.168.1.100:8000`)
4. Tippen Sie auf "Speichern"
5. Navigieren Sie zu "Rezepte" und testen Sie die Funktionalität

## Dateiübersicht

| Datei | Zeilen | Beschreibung |
|-------|--------|--------------|
| CookingManagementApp.swift | 38 | App-Einstiegspunkt mit AppState |
| ContentView.swift | 101 | Tab-Navigation |
| Models/Models.swift | 164 | Alle Datenmodelle |
| Services/APIService.swift | 288 | API-Client für Backend-Kommunikation |
| Localization/Localizable.swift | 200 | Deutsch/Englisch Übersetzungen |
| Views/Recipes/RecipesViews.swift | 410 | Rezept-Views und ViewModels |
| Views/AllOtherViews.swift | 731 | Alle anderen Feature-Views |

**Gesamt**: ~1.932 Zeilen Swift-Code

## Nächste Schritte

Nach erfolgreichem Setup:
- [ ] Backend starten und URL in Settings konfigurieren
- [ ] Rezepte erstellen und testen
- [ ] Events planen
- [ ] Weitere Features erkunden

Bei Problemen: Siehe README.md für weitere Informationen.