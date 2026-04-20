# Git Setup für iOS-Projekt

## 📦 Direktes Klonen aus Repository

Das iOS-Projekt ist vollständig im Haupt-Repository enthalten und kann direkt verwendet werden.

### Schnellstart

```bash
# 1. Repository klonen
git clone <repository-url> cooking-management-system
cd cooking-management-system

# 2. iOS-Projekt öffnen
cd ios/com.svh.cookingmanagement
open CookingManagementApp.xcodeproj

# 3. In Xcode: ⌘ + R zum Starten
```

Das war's! Alle Dateien sind bereits konfiguriert.

---

## 🔧 Projektstruktur im Repository

```
cooking-management-system/
├── backend/                    # Python FastAPI Backend
├── frontend/                   # React TypeScript Frontend
└── ios/                        # iOS SwiftUI App
    ├── com.svh.cookingmanagement/
    │   ├── CookingManagementApp.xcodeproj/  ✅ Xcode-Projekt
    │   ├── CookingManagementApp/            ✅ Swift-Quellcode
    │   └── README.md                        ✅ iOS-Dokumentation
    ├── XCODE_SETUP_GUIDE.md                 ✅ Setup-Anleitung
    └── GIT_SETUP.md                         ✅ Diese Datei
```

---

## 🚀 Workflow für Entwickler

### Erstes Setup

```bash
# Repository klonen
git clone <repository-url> cooking-management-system
cd cooking-management-system/ios/com.svh.cookingmanagement

# Xcode öffnen
open CookingManagementApp.xcodeproj

# In Xcode:
# 1. Simulator wählen (z.B. iPhone 15 Pro)
# 2. ⌘ + R drücken
# 3. App startet im Simulator
```

### Tägliche Entwicklung

```bash
# Neueste Änderungen holen
git pull

# Xcode öffnen
cd ios/com.svh.cookingmanagement
open CookingManagementApp.xcodeproj

# Entwickeln, testen, committen
git add .
git commit -m "iOS: Beschreibung der Änderungen"
git push
```

---

## 📋 Was ist im Repository enthalten?

### ✅ Vollständig konfiguriert

- **Xcode-Projekt** (`CookingManagementApp.xcodeproj`)
  - Alle Build-Settings für iOS 17.0+
  - Alle Swift-Dateien referenziert
  - Assets und Preview Content
  
- **Swift-Quellcode** (`CookingManagementApp/`)
  - App-Einstiegspunkt
  - Models, Services, Views
  - Lokalisierung (DE/EN)
  
- **Assets** (`Assets.xcassets/`)
  - AppIcon-Platzhalter
  - AccentColor
  
- **Dokumentation**
  - README.md (iOS-spezifisch)
  - XCODE_SETUP_GUIDE.md
  - GIT_SETUP.md (diese Datei)

### ❌ Nicht im Repository

- **Derived Data** (wird von Xcode generiert)
- **Build-Artefakte** (`.app` Dateien)
- **User-spezifische Einstellungen** (`.xcuserdata`)
- **Provisioning Profiles** (für App Store)

Diese werden automatisch von Xcode erstellt und sind in `.gitignore` ausgeschlossen.

---

## 🔄 Git-Workflow für iOS-Entwicklung

### Branch-Strategie

```bash
# Feature-Branch erstellen
git checkout -b ios/feature-name

# Entwickeln und committen
git add ios/
git commit -m "iOS: Feature-Beschreibung"

# Push und Pull Request
git push origin ios/feature-name
```

### Commit-Konventionen

Verwenden Sie aussagekräftige Commit-Messages:

```bash
# Gute Beispiele:
git commit -m "iOS: Add recipe search functionality"
git commit -m "iOS: Fix dark mode colors in settings"
git commit -m "iOS: Update API service for new endpoints"

# Vermeiden:
git commit -m "iOS: Update"
git commit -m "iOS: Fix"
```

---

## 🛠️ Xcode-spezifische Git-Einstellungen

### .gitignore für iOS

Das Projekt verwendet bereits eine `.gitignore` mit:

```gitignore
# Xcode
*.xcuserdata
*.xcuserdatad
DerivedData/
*.xcworkspace/xcuserdata/
*.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist

# Build
build/
*.app
*.ipa

# CocoaPods (falls verwendet)
Pods/
*.xcworkspace

# Swift Package Manager
.swiftpm/
```

### Was wird committed?

✅ **Sollte committed werden:**
- `.xcodeproj/project.pbxproj`
- `.xcodeproj/project.xcworkspace/contents.xcworkspacedata`
- Alle `.swift` Dateien
- `Assets.xcassets/`
- `Info.plist` (falls vorhanden)
- README und Dokumentation

❌ **Sollte NICHT committed werden:**
- `.xcuserdata/` (User-spezifische Einstellungen)
- `DerivedData/` (Build-Cache)
- `build/` (Build-Artefakte)
- `.DS_Store` (macOS-Dateien)

---

## 🔐 Team-Entwicklung

### Mehrere Entwickler

Wenn mehrere Entwickler am iOS-Projekt arbeiten:

1. **Xcode-Version synchronisieren**
   - Alle verwenden Xcode 16.1
   - Dokumentiert in `XCODE_SETUP_GUIDE.md`

2. **Merge-Konflikte vermeiden**
   - Nicht gleichzeitig an `project.pbxproj` arbeiten
   - Bei Konflikten: Xcode neu öffnen und Projekt neu laden

3. **Code-Reviews**
   - Pull Requests für iOS-Features
   - Testen im Simulator vor Merge

### Projekt-Synchronisation

Nach `git pull`:

```bash
# 1. Xcode schließen
# 2. Git pull
git pull

# 3. Xcode öffnen
cd ios/com.svh.cookingmanagement
open CookingManagementApp.xcodeproj

# 4. Clean Build (falls nötig)
# In Xcode: ⌘ + Shift + K
```

---

## 🎯 Alternative: Git Submodule (Optional)

Falls Sie das iOS-Projekt als separates Repository verwalten möchten:

### Submodule erstellen

```bash
# Im Haupt-Repository
cd cooking-management-system

# iOS-Projekt als Submodule hinzufügen
git submodule add <ios-repo-url> ios/com.svh.cookingmanagement

# Submodule initialisieren
git submodule update --init --recursive
```

### Submodule verwenden

```bash
# Repository mit Submodules klonen
git clone --recursive <repository-url>

# Oder nach normalem Clone:
git submodule update --init --recursive

# Submodule aktualisieren
cd ios/com.svh.cookingmanagement
git pull origin main
cd ../..
git add ios/com.svh.cookingmanagement
git commit -m "Update iOS submodule"
```

**Hinweis**: Aktuell ist das iOS-Projekt direkt im Haupt-Repository. Submodules sind optional für fortgeschrittene Workflows.

---

## 📱 CI/CD Integration (Zukünftig)

Für automatisierte Builds:

```yaml
# .github/workflows/ios.yml
name: iOS Build

on:
  push:
    paths:
      - 'ios/**'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build iOS App
        run: |
          cd ios/com.svh.cookingmanagement
          xcodebuild -project CookingManagementApp.xcodeproj \
                     -scheme CookingManagementApp \
                     -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
                     build
```

---

## 🆘 Häufige Probleme

### Problem: "Project file is corrupted"

**Lösung**:
```bash
git checkout HEAD -- ios/com.svh.cookingmanagement/CookingManagementApp.xcodeproj/project.pbxproj
```

### Problem: Merge-Konflikt in project.pbxproj

**Lösung**:
1. Backup erstellen
2. Eine Version wählen (yours/theirs)
3. Xcode öffnen und Projekt neu laden
4. Fehlende Dateien manuell hinzufügen

```bash
# Ihre Version behalten
git checkout --ours ios/com.svh.cookingmanagement/CookingManagementApp.xcodeproj/project.pbxproj

# Oder deren Version
git checkout --theirs ios/com.svh.cookingmanagement/CookingManagementApp.xcodeproj/project.pbxproj
```

### Problem: Dateien fehlen nach git pull

**Lösung**:
```bash
# Xcode schließen
# Clean und neu clonen
rm -rf ios/com.svh.cookingmanagement/DerivedData
git pull
open ios/com.svh.cookingmanagement/CookingManagementApp.xcodeproj
```

---

## ✅ Checkliste für neuen Entwickler

- [ ] Repository geklont
- [ ] Xcode 16.1 installiert
- [ ] iOS-Projekt geöffnet
- [ ] Simulator gewählt
- [ ] App erfolgreich gebaut (⌘ + B)
- [ ] App im Simulator gestartet (⌘ + R)
- [ ] Backend-URL in Settings konfiguriert
- [ ] Erste Änderung committed

---

## 📚 Weitere Ressourcen

- **iOS-Dokumentation**: `ios/com.svh.cookingmanagement/README.md`
- **Setup-Anleitung**: `ios/XCODE_SETUP_GUIDE.md`
- **Backend-API**: `backend/README.md`
- **Haupt-README**: `README.md`

---

**Das iOS-Projekt ist vollständig im Repository und sofort einsatzbereit! 🚀**