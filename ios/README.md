# Cooking Management System - iOS/iPadOS App

Eine native Swift-Anwendung für iOS und iPadOS, die alle Features des Web-Frontends implementiert.

## 📱 Übersicht

Diese iOS/iPadOS-App ist eine vollständige native Implementierung des Cooking Management Systems mit SwiftUI. Sie bietet alle Funktionen der Web-Anwendung in einer optimierten mobilen Oberfläche.

## ✨ Features

### Kernfunktionen
- **Rezeptverwaltung**: Erstellen, bearbeiten und durchsuchen von Rezepten mit Zutaten, Schritten und Bildern
- **Event-Management**: Planung von Koch-Events mit mehreren Gängen und Teilnehmern
- **Werkzeugverwaltung**: Katalogisierung von Kochutensilien nach Standorten
- **Lagerverwaltung**: Tracking von Vorräten, Gewürzen und Zutaten
- **Standortverwaltung**: Organisation von Werkzeugen und Lagerartikeln nach Orten
- **Gästeverwaltung**: Verwaltung von Gästen mit Ernährungspräferenzen
- **Einkaufslisten**: Automatische Generierung aus Events und Rezepten

### Mobile-spezifische Features
- **Native iOS/iPadOS UI**: Optimiert für Touch-Bedienung
- **Dark Mode**: Vollständige Unterstützung für helles und dunkles Design
- **Mehrsprachigkeit**: Deutsch und Englisch
- **Offline-fähig**: Lokales Caching für bessere Performance
- **iPad-Optimierung**: Split-View und Multitasking-Unterstützung
- **Kamera-Integration**: Direkte Foto-Aufnahme für Rezepte und Werkzeuge
- **Swipe-Gesten**: Intuitive Navigation und Aktionen

## 🏗️ Architektur

### Projektstruktur

```
CookingApp/
├── CookingApp/
│   ├── CookingAppApp.swift          # App Entry Point
│   ├── ContentView.swift            # Haupt-Navigation
│   │
│   ├── Models/
│   │   └── Models.swift             # Alle Datenmodelle
│   │
│   ├── Services/
│   │   └── APIService.swift         # API-Client
│   │
│   ├── Localization/
│   │   └── Localizable.swift        # Übersetzungen
│   │
│   ├── Views/
│   │   ├── Recipes/
│   │   │   ├── RecipesView.swift
│   │   │   ├── RecipeDetailView.swift
│   │   │   └── RecipeFormView.swift
│   │   ├── Events/
│   │   │   ├── EventsView.swift
│   │   │   ├── EventDetailView.swift
│   │   │   └── EventFormView.swift
│   │   ├── Tools/
│   │   │   ├── ToolsView.swift
│   │   │   ├── ToolDetailView.swift
│   │   │   └── ToolFormView.swift
│   │   ├── Storage/
│   │   │   ├── StorageView.swift
│   │   │   ├── StorageDetailView.swift
│   │   │   └── StorageFormView.swift
│   │   ├── Locations/
│   │   │   ├── LocationsView.swift
│   │   │   └── LocationFormView.swift
│   │   ├── Guests/
│   │   │   ├── GuestsView.swift
│   │   │   ├── GuestDetailView.swift
│   │   │   └── GuestFormView.swift
│   │   ├── ShoppingLists/
│   │   │   ├── ShoppingListsView.swift
│   │   │   └── ShoppingListDetailView.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   │
│   ├── Components/
│   │   ├── EmptyStateView.swift
│   │   ├── LoadingView.swift
│   │   ├── ImagePicker.swift
│   │   └── SearchBar.swift
│   │
│   └── Assets.xcassets/
│       ├── AppIcon.appiconset/
│       └── Colors/
│
└── CookingApp.xcodeproj/
```

### Technologie-Stack

- **Sprache**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS Version**: iOS 16.0
- **Unterstützte Geräte**: iPhone, iPad
- **Architektur**: MVVM (Model-View-ViewModel)
- **Networking**: URLSession mit async/await
- **State Management**: @StateObject, @EnvironmentObject

## 🚀 Installation & Setup

### Voraussetzungen

- macOS 13.0 oder höher
- Xcode 15.0 oder höher
- iOS 16.0+ Simulator oder Gerät
- Laufender Backend-Server (siehe Backend-Dokumentation)

### Projekt öffnen

1. Navigiere zum iOS-Verzeichnis:
```bash
cd ios/CookingApp
```

2. Öffne das Xcode-Projekt:
```bash
open CookingApp.xcodeproj
```

3. Wähle ein Zielgerät (Simulator oder physisches Gerät)

4. Drücke `Cmd + R` zum Bauen und Ausführen

### Backend-Konfiguration

Die App verbindet sich standardmäßig mit `http://localhost:8000/api`. Um eine andere URL zu verwenden:

1. Öffne die App
2. Navigiere zu **Einstellungen**
3. Ändere die **API URL**
4. Starte die App neu

Für physische Geräte im gleichen Netzwerk:
```
http://[DEINE-IP-ADRESSE]:8000/api
```

## 📱 Verwendung

### Erste Schritte

1. **Backend starten**: Stelle sicher, dass der Backend-Server läuft
2. **API URL konfigurieren**: Passe die URL in den Einstellungen an
3. **Sprache wählen**: Wähle Deutsch oder Englisch
4. **Daten erkunden**: Navigiere durch die verschiedenen Bereiche

### Hauptfunktionen

#### Rezepte
- Tippe auf **Rezepte** in der Tab-Bar
- Verwende **+** zum Erstellen neuer Rezepte
- Tippe auf ein Rezept für Details
- Wische nach links zum Löschen

#### Events
- Tippe auf **Events** in der Tab-Bar
- Erstelle Events mit mehreren Gängen
- Füge Teilnehmer hinzu
- Generiere automatisch Einkaufslisten

#### Werkzeuge & Lager
- Verwalte Kochutensilien und Vorräte
- Organisiere nach Standorten
- Füge Bilder hinzu
- Tracke Ablaufdaten

#### Einkaufslisten
- Erstelle Listen manuell oder aus Events/Rezepten
- Markiere Artikel als gekauft
- Organisiere nach Geschäften
- Teile Listen (zukünftig)

## 🎨 Design-Prinzipien

### iOS Human Interface Guidelines

Die App folgt den Apple Human Interface Guidelines:

- **Klarheit**: Klare Typografie und Icons
- **Deference**: Inhalte stehen im Vordergrund
- **Tiefe**: Visuelle Hierarchie durch Schatten und Ebenen

### Touch-Optimierung

- Mindestgröße für Touch-Targets: 44x44 pt
- Swipe-Gesten für häufige Aktionen
- Pull-to-Refresh für Aktualisierungen
- Haptic Feedback für Bestätigungen

### iPad-Optimierungen

- Split-View-Unterstützung
- Slide Over und Picture-in-Picture
- Keyboard-Shortcuts
- Größere Layouts für mehr Bildschirmfläche

## 🌍 Internationalisierung

Die App unterstützt:
- **Deutsch** (Standard)
- **Englisch**

Sprache ändern:
1. Gehe zu **Einstellungen**
2. Wähle **Sprache**
3. Wähle gewünschte Sprache

## 🔒 Datenschutz & Sicherheit

- Keine Daten werden lokal gespeichert (außer Einstellungen)
- Alle Daten werden über HTTPS übertragen (in Produktion)
- Keine Tracking- oder Analytics-Tools
- Keine Drittanbieter-SDKs

## 🐛 Bekannte Einschränkungen

- Offline-Modus noch nicht vollständig implementiert
- Bildkomprimierung könnte optimiert werden
- Keine Push-Benachrichtigungen
- Keine iCloud-Synchronisation

## 🔮 Geplante Features

- [ ] Offline-Modus mit lokaler Datenbank
- [ ] iCloud-Synchronisation
- [ ] Widget für Home Screen
- [ ] Apple Watch App
- [ ] Siri-Integration
- [ ] Handoff zwischen Geräten
- [ ] Teilen von Rezepten via AirDrop
- [ ] Barcode-Scanner für Zutaten
- [ ] AR-Ansicht für Kochschritte

## 🧪 Testing

### Unit Tests

```bash
# In Xcode
Cmd + U
```

### UI Tests

```bash
# In Xcode
Cmd + U (mit UI Test Target ausgewählt)
```

## 📦 Deployment

### TestFlight

1. Archive erstellen: `Product > Archive`
2. In Xcode Organizer öffnen
3. **Distribute App** wählen
4. **App Store Connect** auswählen
5. Hochladen und auf Verarbeitung warten

### App Store

1. In App Store Connect einloggen
2. App-Informationen ausfüllen
3. Screenshots hinzufügen
4. Zur Überprüfung einreichen

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist Teil des Cooking Management Systems.

## 🆘 Support

Bei Problemen oder Fragen:

1. Überprüfe die Backend-Verbindung
2. Stelle sicher, dass die API URL korrekt ist
3. Überprüfe die Xcode-Konsole für Fehler
4. Erstelle ein Issue im Repository

## 📚 Weitere Dokumentation

- [Backend-Dokumentation](../backend/README.md)
- [Frontend-Dokumentation](../frontend/README.md)
- [API-Dokumentation](../backend/FILE_UPLOAD_API.md)
- [Architektur-Übersicht](../ARCHITECTURE.md)

---

**Made with ❤️ and Bob**