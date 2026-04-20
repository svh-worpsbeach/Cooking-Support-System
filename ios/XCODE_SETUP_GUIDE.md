# Xcode Setup Guide - CookingManagementApp

## ✅ Projekt ist fertig konfiguriert!

Das Xcode-Projekt ist vollständig eingerichtet und kann direkt geöffnet werden.

### Schnellstart

```bash
cd ios/com.svh.cookingmanagement
open CookingManagementApp.xcodeproj
```

Dann einfach `⌘ + R` drücken zum Starten!

---

## 📁 Projektstruktur

Das Projekt enthält alle notwendigen Dateien:

- ✅ `CookingManagementApp.xcodeproj` - Xcode 16.1 Projektdatei
- ✅ Alle Swift-Quelldateien sind referenziert
- ✅ Assets.xcassets mit AppIcon und AccentColor
- ✅ Preview Content für SwiftUI Previews
- ✅ Build Settings für iOS 17.0+

### Enthaltene Dateien

```
CookingManagementApp/
├── CookingManagementApp.xcodeproj/
│   ├── project.pbxproj                 ✅ Hauptprojektkonfiguration
│   └── project.xcworkspace/            ✅ Workspace
├── CookingManagementApp/
│   ├── CookingManagementApp.swift      ✅ App-Einstiegspunkt
│   ├── ContentView.swift               ✅ Tab-Navigation
│   ├── Models/Models.swift             ✅ Datenmodelle
│   ├── Services/APIService.swift       ✅ API-Client
│   ├── Localization/Localizable.swift  ✅ DE/EN Übersetzungen
│   ├── Views/
│   │   ├── Recipes/RecipesViews.swift  ✅ Rezept-Views
│   │   └── AllOtherViews.swift         ✅ Weitere Views
│   ├── Assets.xcassets/                ✅ App-Icons
│   └── Preview Content/                ✅ Previews
└── README.md                           ✅ Dokumentation
```

---

## 🚀 Erste Schritte

### 1. Projekt öffnen

```bash
cd ios/com.svh.cookingmanagement
open CookingManagementApp.xcodeproj
```

**Wichtig**: Öffnen Sie die `.xcodeproj` Datei, nicht den Ordner!

### 2. Simulator wählen

- Klicken Sie auf das Gerät-Dropdown in der Toolbar
- Wählen Sie z.B. "iPhone 15 Pro"
- Oder ein anderes iOS 17.0+ Gerät

### 3. Build und Run

- Drücken Sie `⌘ + R` oder
- Klicken Sie auf den Play-Button
- Die App startet im Simulator

### 4. Backend konfigurieren

Nach dem ersten Start der App:

1. Navigieren Sie zu **"Mehr"** → **"Einstellungen"**
2. Geben Sie die Backend-URL ein:
   - Lokal: `http://localhost:8000`
   - Netzwerk: `http://192.168.x.x:8000`
3. Tippen Sie auf **"Speichern"**
4. Navigieren Sie zu "Rezepte" und testen Sie die Funktionalität

---

## 🔧 Projektkonfiguration

### Build Settings

Das Projekt ist bereits konfiguriert mit:

- **iOS Deployment Target**: 17.0
- **Swift Language Version**: 5.0
- **Xcode Version**: 16.1
- **Interface**: SwiftUI
- **Bundle Identifier**: `com.svh.cookingmanagement.CookingManagementApp`

### Unterstützte Geräte

- iPhone (Portrait, Landscape)
- iPad (alle Orientierungen)
- iOS 17.0 oder neuer

### Unterstützte Features

- ✅ SwiftUI
- ✅ Async/Await
- ✅ Codable
- ✅ URLSession
- ✅ Dark Mode
- ✅ Localization (DE/EN)

---

## 🐛 Fehlerbehebung

### Problem: Projekt lässt sich nicht öffnen

**Lösung**: 
- Stellen Sie sicher, dass Sie Xcode 16.1 oder neuer verwenden
- Öffnen Sie die `.xcodeproj` Datei, nicht den Ordner

### Problem: Build-Fehler "No such module 'SwiftUI'"

**Lösung**: 
- Überprüfen Sie, dass das Deployment Target auf iOS 17.0+ gesetzt ist
- Project → Target → General → Deployment Info

### Problem: Dateien erscheinen rot im Project Navigator

**Lösung**: 
- Die Dateien sind bereits im Projekt referenziert
- Falls rot: Rechtsklick → "Show in Finder" → Pfad überprüfen

### Problem: Backend-Verbindung schlägt fehl

**Lösung**:
1. Backend läuft: `cd backend && ./run.sh`
2. Richtige URL in Settings eingegeben
3. Bei Simulator: `localhost` verwenden
4. Bei physischem Gerät: IP-Adresse des Macs verwenden

### Problem: "Cannot find type 'Recipe' in scope"

**Lösung**: 
- Clean Build Folder: `⌘ + Shift + K`
- Rebuild: `⌘ + B`

---

## 📱 Testing

### Im Simulator

1. Wählen Sie verschiedene Geräte:
   - iPhone SE (kleiner Bildschirm)
   - iPhone 15 Pro (Standard)
   - iPad Pro (Tablet-Layout)

2. Testen Sie Dark Mode:
   - Settings → Appearance → Dark

### Auf physischem Gerät

1. Verbinden Sie Ihr iPhone/iPad via USB
2. Wählen Sie es als Build-Target
3. Vertrauen Sie dem Entwicklerzertifikat auf dem Gerät
4. Build und Run

**Hinweis**: Für physische Geräte benötigen Sie ein Apple Developer Account (kostenlos für Testing).

---

## 📊 Projektstatistiken

| Kategorie | Anzahl |
|-----------|--------|
| Swift-Dateien | 7 |
| Zeilen Code | ~1.932 |
| Views | 15+ |
| Models | 10+ |
| API-Endpoints | 30+ |
| Sprachen | 2 (DE, EN) |

---

## 🔄 Nächste Schritte

Nach erfolgreichem Setup:

1. ✅ Backend starten: `cd backend && ./run.sh`
2. ✅ App im Simulator starten
3. ✅ Backend-URL in Settings konfigurieren
4. ✅ Rezepte erstellen und testen
5. ✅ Events planen
6. ✅ Weitere Features erkunden

---

## 📚 Weitere Dokumentation

- **Projekt-README**: `ios/com.svh.cookingmanagement/README.md`
- **Backend-Dokumentation**: `backend/README.md`
- **API-Dokumentation**: `backend/FILE_UPLOAD_API.md`
- **Hauptprojekt**: `README.md`

---

## 💡 Tipps

### SwiftUI Previews

Alle Views haben Previews für schnelle Entwicklung:

```swift
#Preview {
    RecipeListView()
        .environmentObject(AppState())
}
```

Aktivieren Sie Previews: `⌘ + Option + Enter`

### Live Preview

Für Live-Updates während der Entwicklung:
- Aktivieren Sie "Live Preview" im Canvas
- Änderungen werden sofort sichtbar

### Debugging

- Breakpoints setzen: Klick auf Zeilennummer
- Debug-Konsole: `⌘ + Shift + Y`
- View-Hierarchie: Debug → View Debugging → Capture View Hierarchy

---

## ✨ Features der App

### Implementiert

- ✅ Rezepte (CRUD, Suche, Kategorien)
- ✅ Events (Planung, Kurse, Gäste)
- ✅ Tools (Küchengeräte-Verwaltung)
- ✅ Storage (Vorräte, Zutaten)
- ✅ Locations (Lagerorte)
- ✅ Gäste (Verwaltung)
- ✅ Einkaufslisten (Auto-Generierung)
- ✅ Mehrsprachigkeit (DE/EN)
- ✅ Dark Mode
- ✅ Image Upload

### Geplant

- [ ] Offline-Modus (Core Data)
- [ ] Push-Benachrichtigungen
- [ ] Widgets
- [ ] Apple Watch App
- [ ] iCloud-Sync

---

## 🎯 Entwickelt für

- **Xcode**: 16.1
- **iOS**: 17.0+
- **Swift**: 5.0
- **Framework**: SwiftUI

---

**Viel Erfolg mit der App-Entwicklung! 🚀**

Bei Fragen oder Problemen: Siehe README.md oder Backend-Dokumentation.