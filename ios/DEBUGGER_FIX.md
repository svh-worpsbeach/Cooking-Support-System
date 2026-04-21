# Xcode Debugger Attach Problem beheben

## Problem
```
Could not attach to pid : "xxxxx"
Domain: IDEDebugSessionErrorDomain
Code: 3
Failure Reason: attach failed (Not allowed to attach to process...)
```

## Lösungen (in dieser Reihenfolge versuchen)

### 1. Simulator neu starten
1. Simulator komplett beenden (Cmd+Q)
2. Xcode beenden (Cmd+Q)
3. Xcode neu starten
4. Simulator neu starten
5. App erneut ausführen

### 2. Simulator zurücksetzen
1. Im Simulator: Device → Erase All Content and Settings
2. Oder im Terminal:
   ```bash
   xcrun simctl erase all
   ```
3. App erneut ausführen

### 3. Derived Data löschen
1. Xcode → Settings → Locations → Derived Data
2. Auf Pfeil klicken um Ordner zu öffnen
3. Alle Inhalte löschen
4. Xcode neu starten
5. App erneut ausführen

Oder im Terminal:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### 4. Ohne Debugger starten
1. In Xcode: Product → Scheme → Edit Scheme
2. Run → Info Tab
3. Debug executable: **deaktivieren**
4. App starten

Die App läuft dann ohne Debugger, aber du kannst testen ob sie funktioniert.

### 5. System Developer Mode aktivieren (macOS 15+)
```bash
sudo /usr/sbin/DevToolsSecurity -enable
sudo dscl . append /Groups/_developer GroupMembership $(whoami)
```

Danach Mac neu starten.

### 6. Schnelltest ohne Debugger
Starte die App direkt im Simulator:
1. App im Simulator installieren (Xcode → Product → Run)
2. Wenn Fehler kommt, Xcode beenden
3. Im Simulator die App manuell starten (App-Icon antippen)

So kannst du testen ob die App grundsätzlich funktioniert.

## Empfohlene Reihenfolge
1. Simulator & Xcode neu starten (schnellste Lösung)
2. Derived Data löschen
3. Simulator zurücksetzen
4. Ohne Debugger testen
5. Developer Mode aktivieren (nur wenn nichts anderes hilft)