# Hintergrundbilder in der iOS-App

## Übersicht

Die iOS-App verwendet jetzt Hintergrundbilder, die sich automatisch an den Dark Mode anpassen, genau wie die Web-App.

## Implementierung

### Assets
Die Hintergrundbilder befinden sich in:
- `CookingManagementApp/Assets.xcassets/KitchenLight.imageset/kitchen-light.png` - Für Light Mode
- `CookingManagementApp/Assets.xcassets/KitchenDark.imageset/kitchen-dark.png` - Für Dark Mode

### ContentView.swift
Die Hauptansicht (`ContentView.swift`) wurde mit einem `ZStack` erweitert, der:
1. Das entsprechende Hintergrundbild basierend auf `appState.isDarkMode` anzeigt
2. Eine halbtransparente Overlay-Ebene für bessere Lesbarkeit hinzufügt
3. Die TabView über dem Hintergrund platziert

```swift
ZStack {
    // Background image based on dark mode
    Image(appState.isDarkMode ? "KitchenDark" : "KitchenLight")
        .resizable()
        .aspectRatio(contentMode: .fill)
        .ignoresSafeArea()
        .opacity(0.3)
    
    // Subtle overlay for better readability
    Color.black
        .opacity(appState.isDarkMode ? 0.2 : 0.05)
        .ignoresSafeArea()
    
    TabView(selection: $selectedTab) {
        // ... Tab-Inhalte
    }
}
```

### StatCard-Komponente
Die `StatCard`-Komponente in `AllOtherViews.swift` wurde aktualisiert, um:
- Einen halbtransparenten Hintergrund zu verwenden (70% Deckkraft)
- Einen subtilen Rahmen hinzuzufügen
- Das Hintergrundbild durchscheinen zu lassen

```swift
.background(
    RoundedRectangle(cornerRadius: 12)
        .fill(Color(UIColor.systemBackground).opacity(0.7))
)
.overlay(
    RoundedRectangle(cornerRadius: 12)
        .stroke(Color.secondary.opacity(0.2), lineWidth: 1)
)
```

## Dark Mode Umschaltung

Die Hintergrundbilder wechseln automatisch, wenn der Benutzer:
1. Den Dark Mode in den iOS-Einstellungen aktiviert/deaktiviert
2. Die App-Einstellungen über die iOS-Einstellungs-App ändert

Die `AppState`-Klasse überwacht `UserDefaults` und aktualisiert `isDarkMode` automatisch.

## Anpassungen

### Hintergrundbilder ersetzen
Um die Hintergrundbilder zu ersetzen:
1. Öffne das Xcode-Projekt
2. Navigiere zu `Assets.xcassets`
3. Wähle `KitchenLight.imageset` oder `KitchenDark.imageset`
4. Ersetze die PNG-Datei durch dein neues Bild
5. Empfohlene Auflösung: 1920x1080 oder höher

### Transparenz anpassen
Um die Sichtbarkeit des Hintergrunds anzupassen, ändere die Opacity-Werte in `ContentView.swift`:
- `.opacity(0.3)` - Hintergrundbild-Transparenz (0.0 = unsichtbar, 1.0 = vollständig sichtbar)
- `.opacity(appState.isDarkMode ? 0.2 : 0.05)` - Overlay-Transparenz für bessere Lesbarkeit

### Karten-Transparenz anpassen
Um die Transparenz der Karten anzupassen, ändere den Opacity-Wert in `AllOtherViews.swift`:
- `.opacity(0.7)` - Karten-Hintergrund (0.0 = vollständig transparent, 1.0 = vollständig undurchsichtig)

## Konsistenz mit der Web-App

Die iOS-App verwendet jetzt das gleiche visuelle Konzept wie die Web-App:
- Hintergrundbilder für Light und Dark Mode
- Halbtransparente UI-Elemente
- Glasmorphismus-Effekte für moderne Ästhetik
- Automatische Anpassung an den Dark Mode

## Fehlerbehebung

### Hintergrundbilder werden nicht angezeigt
1. Überprüfe, ob die Bilder in den Assets vorhanden sind
2. Stelle sicher, dass die Bildnamen korrekt sind: `KitchenLight` und `KitchenDark`
3. Baue das Projekt neu (Clean Build Folder: Cmd+Shift+K, dann Cmd+B)

### Hintergrund ist zu hell/dunkel
Passe die Opacity-Werte in `ContentView.swift` an (siehe "Transparenz anpassen" oben)

### UI-Elemente sind schwer lesbar
Erhöhe die Opacity des Overlays oder reduziere die Opacity des Hintergrundbilds