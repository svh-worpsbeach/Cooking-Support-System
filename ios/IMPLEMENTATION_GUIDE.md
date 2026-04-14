# iOS/iPadOS Implementation Guide

Vollständige Anleitung zur Implementierung und Verwendung der Cooking Management System iOS/iPadOS App.

## 📋 Inhaltsverzeichnis

1. [Projektübersicht](#projektübersicht)
2. [Architektur](#architektur)
3. [Setup & Installation](#setup--installation)
4. [Projektstruktur](#projektstruktur)
5. [Implementierungsdetails](#implementierungsdetails)
6. [API Integration](#api-integration)
7. [UI/UX Guidelines](#uiux-guidelines)
8. [iPad-Optimierungen](#ipad-optimierungen)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## 📱 Projektübersicht

Die iOS/iPadOS-App ist eine native Swift-Implementierung des Cooking Management Systems. Sie bietet alle Features der Web-Anwendung in einer optimierten mobilen Oberfläche.

### Hauptfeatures

- ✅ Rezeptverwaltung mit Bildern, Zutaten und Schritten
- ✅ Event-Planung mit mehreren Gängen
- ✅ Werkzeug- und Lagerverwaltung
- ✅ Gästeverwaltung mit Ernährungspräferenzen
- ✅ Automatische Einkaufslisten-Generierung
- ✅ Mehrsprachigkeit (Deutsch/Englisch)
- ✅ Dark Mode Support
- ✅ iPad-Optimierungen (Split View, Keyboard Shortcuts)

## 🏗️ Architektur

### Design Pattern: MVVM

```
View ←→ ViewModel ←→ Model
  ↓         ↓          ↓
SwiftUI  @Published  Codable
         ObservableObject
```

### Komponenten

1. **Models** (`Models.swift`)
   - Datenstrukturen für alle Entitäten
   - Codable für JSON-Serialisierung
   - Identifiable für SwiftUI Lists

2. **Services** (`APIService.swift`)
   - Singleton-Pattern für API-Zugriff
   - Async/await für asynchrone Operationen
   - Error Handling mit custom APIError

3. **Views**
   - SwiftUI-basierte UI-Komponenten
   - Reactive Updates durch @Published
   - Wiederverwendbare Components

4. **ViewModels**
   - Business Logic
   - State Management
   - API-Aufrufe

## 🚀 Setup & Installation

### Voraussetzungen

```bash
# System Requirements
- macOS 13.0+
- Xcode 15.0+
- iOS 16.0+ SDK
- Swift 5.9+
```

### Projekt öffnen

```bash
cd ios/CookingApp
open CookingApp.xcodeproj
```

### Backend-Konfiguration

1. **Lokale Entwicklung (Simulator)**
   ```swift
   // Standard-URL
   http://localhost:8000/api
   ```

2. **Physisches Gerät (gleiches Netzwerk)**
   ```swift
   // Ersetze [IP] mit deiner lokalen IP
   http://[IP-ADRESSE]:8000/api
   ```

3. **Produktions-Server**
   ```swift
   https://your-domain.com/api
   ```

### Erste Schritte

1. Wähle ein Zielgerät (Simulator oder Device)
2. Drücke `Cmd + R` zum Bauen und Ausführen
3. Konfiguriere die API-URL in den Einstellungen
4. Starte mit der Erkundung der Features

## 📁 Projektstruktur

```
CookingApp/
├── CookingApp/
│   ├── CookingAppApp.swift              # App Entry Point
│   ├── ContentView.swift                # Main Navigation
│   │
│   ├── Models/
│   │   └── Models.swift                 # Alle Datenmodelle
│   │
│   ├── Services/
│   │   └── APIService.swift             # API Client
│   │
│   ├── Localization/
│   │   └── Localizable.swift            # Übersetzungen
│   │
│   ├── Views/
│   │   ├── Recipes/
│   │   │   ├── RecipesView.swift
│   │   │   ├── RecipeDetailView.swift
│   │   │   └── RecipeFormView.swift
│   │   ├── Events/
│   │   ├── Tools/
│   │   ├── Storage/
│   │   ├── Locations/
│   │   ├── Guests/
│   │   ├── ShoppingLists/
│   │   ├── Settings/
│   │   └── AllViews.swift               # Alle View-Implementierungen
│   │
│   ├── iPad/
│   │   └── iPadOptimizations.swift      # iPad-spezifische Features
│   │
│   └── Assets.xcassets/
│
└── CookingApp.xcodeproj/
```

## 💻 Implementierungsdetails

### 1. Models

Alle Models sind in `Models.swift` definiert und folgen diesem Pattern:

```swift
struct Recipe: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    // ... weitere Properties
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case createdAt = "created_at"  // Snake case → Camel case
    }
}
```

**Wichtige Konzepte:**
- `Codable`: Automatische JSON-Serialisierung
- `Identifiable`: Für SwiftUI ForEach
- `Hashable`: Für Set-Operationen
- `CodingKeys`: Mapping zwischen API und Swift

### 2. API Service

Der `APIService` ist ein Singleton mit async/await:

```swift
class APIService {
    static let shared = APIService()
    
    func getRecipes() async throws -> [Recipe] {
        return try await request(endpoint: "/recipes")
    }
}
```

**Features:**
- Generische Request-Methode
- Automatisches Error Handling
- Image Upload Support
- Konfigurierbare Base URL

### 3. ViewModels

ViewModels verwenden `@MainActor` für UI-Updates:

```swift
@MainActor
class RecipesViewModel: ObservableObject {
    @Published var recipes: [Recipe] = []
    @Published var isLoading = false
    
    func loadRecipes() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            recipes = try await APIService.shared.getRecipes()
        } catch {
            // Error handling
        }
    }
}
```

### 4. Views

Views sind deklarativ mit SwiftUI:

```swift
struct RecipesView: View {
    @StateObject private var viewModel = RecipesViewModel()
    
    var body: some View {
        List(viewModel.recipes) { recipe in
            RecipeCard(recipe: recipe)
        }
        .task {
            await viewModel.loadRecipes()
        }
    }
}
```

## 🔌 API Integration

### Request Flow

```
View → ViewModel → APIService → Backend
  ↓        ↓           ↓            ↓
User    Business    Network     Database
Action   Logic      Request
```

### Error Handling

```swift
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .httpError(let code):
            return "HTTP Fehler: \(code)"
        // ...
        }
    }
}
```

### Image Loading

```swift
// AsyncImage für automatisches Laden
AsyncImage(url: imageURL) { phase in
    switch phase {
    case .success(let image):
        image.resizable()
    case .failure:
        PlaceholderImage()
    case .empty:
        ProgressView()
    @unknown default:
        EmptyView()
    }
}
```

## 🎨 UI/UX Guidelines

### Design Principles

1. **Native iOS Feel**
   - System Fonts (SF Pro)
   - Native Controls
   - Standard Gestures

2. **Accessibility**
   - Dynamic Type Support
   - VoiceOver Labels
   - High Contrast Mode

3. **Performance**
   - Lazy Loading
   - Image Caching
   - Efficient Rendering

### Color Scheme

```swift
// Automatische Dark Mode Unterstützung
Color.primary          // Schwarz/Weiß
Color.secondary        // Grau
Color.blue            // Accent Color
```

### Typography

```swift
.font(.largeTitle)    // 34pt
.font(.title)         // 28pt
.font(.headline)      // 17pt Bold
.font(.body)          // 17pt Regular
.font(.caption)       // 12pt
```

### Spacing

```swift
.padding()            // 16pt
.padding(.horizontal) // 16pt links/rechts
.padding(.vertical)   // 16pt oben/unten
```

## 📱 iPad-Optimierungen

### Split View

```swift
NavigationSplitView {
    // Sidebar
    List(items) { item in
        NavigationLink(value: item) {
            ItemRow(item: item)
        }
    }
} detail: {
    // Detail View
    if let selected = selectedItem {
        DetailView(item: selected)
    }
}
```

### Keyboard Shortcuts

```swift
.keyboardShortcut("n", modifiers: .command)  // Cmd+N
.keyboardShortcut("s", modifiers: .command)  // Cmd+S
.keyboardShortcut("f", modifiers: .command)  // Cmd+F
```

### Adaptive Layouts

```swift
@Environment(\.horizontalSizeClass) var sizeClass

var body: some View {
    if sizeClass == .regular {
        // iPad Layout
        iPadLayout()
    } else {
        // iPhone Layout
        iPhoneLayout()
    }
}
```

### Drag & Drop

```swift
.onDrag {
    NSItemProvider(object: item)
}
.onDrop(of: [.item], delegate: DropDelegate())
```

## 🧪 Testing

### Unit Tests

```swift
import XCTest
@testable import CookingApp

class RecipesViewModelTests: XCTestCase {
    func testLoadRecipes() async {
        let viewModel = RecipesViewModel()
        await viewModel.loadRecipes()
        XCTAssertFalse(viewModel.recipes.isEmpty)
    }
}
```

### UI Tests

```swift
func testRecipeCreation() {
    let app = XCUIApplication()
    app.launch()
    
    app.buttons["Rezepte"].tap()
    app.buttons["plus"].tap()
    
    let nameField = app.textFields["Rezeptname"]
    nameField.tap()
    nameField.typeText("Test Rezept")
    
    app.buttons["Speichern"].tap()
}
```

### Test ausführen

```bash
# In Xcode
Cmd + U

# Oder via Command Line
xcodebuild test -scheme CookingApp -destination 'platform=iOS Simulator,name=iPhone 15'
```

## 📦 Deployment

### TestFlight

1. **Archive erstellen**
   ```
   Product → Archive
   ```

2. **Organizer öffnen**
   ```
   Window → Organizer
   ```

3. **Distribute App**
   - App Store Connect auswählen
   - Upload
   - Auf Verarbeitung warten

4. **TestFlight konfigurieren**
   - Tester hinzufügen
   - Build freigeben
   - Feedback sammeln

### App Store

1. **App Store Connect**
   - App-Informationen ausfüllen
   - Screenshots hinzufügen (alle Größen)
   - Beschreibung verfassen
   - Keywords festlegen

2. **Review einreichen**
   - Build auswählen
   - Zur Überprüfung einreichen
   - Auf Freigabe warten (1-3 Tage)

### Versioning

```swift
// In Xcode Project Settings
Version: 1.0.0
Build: 1

// Semantic Versioning
MAJOR.MINOR.PATCH
1.0.0 → Initial Release
1.1.0 → New Features
1.0.1 → Bug Fixes
```

## 🔧 Troubleshooting

### Häufige Probleme

#### 1. Backend-Verbindung fehlgeschlagen

**Problem:** App kann Backend nicht erreichen

**Lösung:**
```swift
// Überprüfe die API URL in Settings
// Für Simulator: http://localhost:8000/api
// Für Device: http://[DEINE-IP]:8000/api

// Backend-Status prüfen
curl http://localhost:8000/api/recipes
```

#### 2. Bilder werden nicht geladen

**Problem:** AsyncImage zeigt keine Bilder

**Lösung:**
```swift
// Überprüfe Info.plist
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

// Oder spezifische Domain erlauben
<key>NSExceptionDomains</key>
<dict>
    <key>localhost</key>
    <dict>
        <key>NSExceptionAllowsInsecureHTTPLoads</key>
        <true/>
    </dict>
</dict>
```

#### 3. Build Fehler

**Problem:** Xcode kann nicht bauen

**Lösung:**
```bash
# Clean Build Folder
Cmd + Shift + K

# Derived Data löschen
rm -rf ~/Library/Developer/Xcode/DerivedData

# Xcode neu starten
```

#### 4. Simulator langsam

**Problem:** Simulator reagiert träge

**Lösung:**
```bash
# Simulator zurücksetzen
Device → Erase All Content and Settings

# Oder via Command Line
xcrun simctl erase all
```

### Debug-Tipps

```swift
// Console Logging
print("Debug: \(variable)")

// Breakpoints setzen
// Klicke auf Zeilennummer in Xcode

// View Hierarchy debuggen
Debug → View Debugging → Capture View Hierarchy

// Memory Graph
Debug → Memory Graph
```

## 📚 Weitere Ressourcen

### Apple Dokumentation

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Projekt-Dokumentation

- [Backend API](../backend/README.md)
- [Web Frontend](../frontend/README.md)
- [Architektur](../ARCHITECTURE.md)

### Community

- [Swift Forums](https://forums.swift.org)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/swiftui)
- [Apple Developer Forums](https://developer.apple.com/forums/)

## 🤝 Beitragen

Contributions sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

### Code Style

```swift
// Verwende Swift Naming Conventions
class RecipesViewModel { }  // PascalCase für Types
var recipeName: String      // camelCase für Properties
func loadRecipes() { }      // camelCase für Functions

// Verwende guard für Early Returns
guard let recipe = recipe else { return }

// Verwende trailing closures
recipes.map { $0.name }

// Dokumentiere öffentliche APIs
/// Lädt alle Rezepte vom Server
/// - Returns: Array von Recipe-Objekten
func loadRecipes() async throws -> [Recipe]
```

---

**Made with ❤️ and Bob**