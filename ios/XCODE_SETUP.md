# Xcode Projekt Setup

Da das manuell erstellte Xcode-Projekt möglicherweise Kompatibilitätsprobleme mit Xcode 16.1 hat, folge dieser Anleitung, um das Projekt neu zu erstellen.

## 🚀 Schnellstart: Neues Xcode-Projekt erstellen

### Schritt 1: Neues Projekt in Xcode erstellen

1. Öffne Xcode 16.1
2. Wähle **File → New → Project**
3. Wähle **iOS → App**
4. Konfiguriere das Projekt:
   - **Product Name:** `CookingApp`
   - **Team:** Dein Team (optional für Simulator)
   - **Organization Identifier:** `com.cookingapp`
   - **Interface:** `SwiftUI`
   - **Language:** `Swift`
   - **Storage:** Keine (wir verwenden API)
   - **Include Tests:** Ja (optional)
5. Speichere das Projekt im Verzeichnis `ios/CookingApp/`

### Schritt 2: Dateien hinzufügen

Alle benötigten Swift-Dateien sind bereits im Repository vorhanden:

```
ios/CookingApp/CookingApp/
├── CookingAppApp.swift          ✅ Bereits vorhanden
├── ContentView.swift             ✅ Bereits vorhanden
├── Models/
│   └── Models.swift              ✅ Bereits vorhanden
├── Services/
│   └── APIService.swift          ✅ Bereits vorhanden
├── Localization/
│   └── Localizable.swift         ✅ Bereits vorhanden
├── Views/
│   ├── Recipes/
│   │   ├── RecipesView.swift    ✅ Bereits vorhanden
│   │   ├── RecipeDetailView.swift ✅ Bereits vorhanden
│   │   └── RecipeFormView.swift ✅ Bereits vorhanden
│   └── AllViews.swift            ✅ Bereits vorhanden
└── iPad/
    └── iPadOptimizations.swift   ✅ Bereits vorhanden
```

### Schritt 3: Dateien zum Xcode-Projekt hinzufügen

1. **Lösche die Standard-Dateien** (falls vorhanden):
   - `ContentView.swift` (wird durch unsere Version ersetzt)
   - `CookingAppApp.swift` (wird durch unsere Version ersetzt)

2. **Füge alle Dateien hinzu**:
   - Rechtsklick auf `CookingApp` Ordner im Project Navigator
   - Wähle **Add Files to "CookingApp"...**
   - Navigiere zu `ios/CookingApp/CookingApp/`
   - Wähle alle Ordner aus (Models, Services, Localization, Views, iPad)
   - ✅ Aktiviere **"Copy items if needed"**
   - ✅ Aktiviere **"Create groups"**
   - ✅ Wähle Target: **CookingApp**
   - Klicke **Add**

### Schritt 4: Projekt-Einstellungen konfigurieren

1. Wähle das Projekt im Navigator
2. Wähle das Target **CookingApp**
3. **General Tab:**
   - **Minimum Deployments:** iOS 16.0
   - **Supported Destinations:** iPhone, iPad
   - **Supports multiple windows:** Nein (oder Ja für iPad)

4. **Info Tab:**
   - Füge hinzu (falls nicht vorhanden):
     ```xml
     <key>NSAppTransportSecurity</key>
     <dict>
         <key>NSAllowsLocalNetworking</key>
         <true/>
     </dict>
     ```

5. **Build Settings:**
   - **Swift Language Version:** Swift 5
   - **iOS Deployment Target:** 16.0

### Schritt 5: Testen

1. Wähle ein Zielgerät (Simulator oder Device)
2. Drücke `Cmd + B` zum Bauen
3. Drücke `Cmd + R` zum Ausführen

## 🔧 Alternative: Swift Package Manager

Falls du Swift Package Manager bevorzugst:

```bash
cd ios
swift package init --type executable --name CookingApp
```

Dann füge die Dateien manuell hinzu und konfiguriere `Package.swift`.

## 📱 Minimale Projekt-Struktur

Falls du ein komplett neues Projekt von Grund auf erstellen möchtest:

### 1. Erstelle `CookingAppApp.swift`:

```swift
import SwiftUI

@main
struct CookingAppApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

class AppState: ObservableObject {
    @Published var isDarkMode = false
    @Published var currentLanguage = "de"
}
```

### 2. Erstelle `ContentView.swift`:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Text("Home")
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
            
            Text("Recipes")
                .tabItem {
                    Label("Recipes", systemImage: "book.fill")
                }
        }
    }
}
```

### 3. Füge nach und nach weitere Dateien hinzu

Kopiere die Dateien aus dem Repository in dein Projekt.

## 🐛 Troubleshooting

### Problem: "Failed to send CA Event for app launch measurements"

**Fehlermeldung:**
```
Failed to send CA Event for app launch measurements for ca_event_type: 0
event_name: com.apple.app_launch_measurement.FirstFramePresentationMetric
Failed to send CA Event for app launch measurements for ca_event_type: 1
event_name: com.apple.app_launch_measurement.ExtendedLaunchMetrics
```

**Lösung:**
Diese Warnungen sind harmlos und können ignoriert werden. Sie betreffen nur Xcode's interne Analytics und beeinträchtigen die App-Funktionalität nicht. Dies ist ein bekanntes Problem in Xcode 16.1.

**Optional - Warnungen unterdrücken:**
1. In Xcode: Product → Scheme → Edit Scheme
2. Run → Arguments → Environment Variables
3. Füge hinzu: `OS_ACTIVITY_MODE` = `disable`

### Problem: "Cannot find type 'Recipe' in scope"

**Lösung:** Stelle sicher, dass `Models.swift` zum Projekt hinzugefügt wurde.

### Problem: "Cannot find 'APIService' in scope"

**Lösung:** Stelle sicher, dass `Services/APIService.swift` zum Projekt hinzugefügt wurde.

### Problem: Build-Fehler wegen fehlender Dateien

**Lösung:** 
1. Öffne den Project Navigator
2. Überprüfe, dass alle Dateien mit einem ✓ markiert sind
3. Falls nicht, wähle die Datei und aktiviere das Target im File Inspector

### Problem: Xcode stürzt beim Öffnen ab

**Lösung:** 
1. Lösche das alte Projekt komplett
2. Erstelle ein neues Projekt wie oben beschrieben
3. Füge die Dateien einzeln hinzu

## 📚 Weitere Hilfe

- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [iOS README](./README.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)

## ✅ Checkliste

- [ ] Xcode 16.1 installiert
- [ ] Neues iOS App Projekt erstellt
- [ ] Alle Swift-Dateien hinzugefügt
- [ ] Projekt-Einstellungen konfiguriert
- [ ] Projekt baut erfolgreich
- [ ] App läuft im Simulator
- [ ] API-URL in Settings konfiguriert

---

**Hinweis:** Die vorhandenen Swift-Dateien sind vollständig und funktionsfähig. Das Problem liegt nur in der Xcode-Projekt-Datei, die manuell erstellt wurde. Durch Neuerstellen des Projekts in Xcode wird dieses Problem behoben.