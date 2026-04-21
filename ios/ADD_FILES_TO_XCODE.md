# Dateien zum Xcode-Projekt hinzufügen

## Anleitung

Die folgenden Dateien müssen zum Xcode-Projekt hinzugefügt werden:

### 1. Öffne das Projekt in Xcode
```bash
open ios/com.svh.cookingmanagement/CookingManagementApp.xcodeproj
```

### 2. Füge die folgenden Dateien hinzu:

#### Recipes Ordner
- `Views/Recipes/RecipeFormView.swift`

#### Events Ordner  
- `Views/Events/EventFormView.swift`

#### ShoppingLists Ordner
- `Views/ShoppingLists/ShoppingListFormView.swift`

#### Assets
- `Assets.xcassets/KitchenLight.imageset/` (kompletter Ordner)
- `Assets.xcassets/KitchenDark.imageset/` (kompletter Ordner)

### 3. Schritte in Xcode:

1. **Rechtsklick** auf den `Views` Ordner im Project Navigator
2. Wähle **"Add Files to CookingManagementApp..."**
3. Navigiere zu den oben genannten Dateien
4. Stelle sicher, dass **"Copy items if needed"** NICHT ausgewählt ist (Dateien sind bereits im richtigen Ordner)
5. Stelle sicher, dass **"Create groups"** ausgewählt ist
6. Stelle sicher, dass das **Target "CookingManagementApp"** ausgewählt ist
7. Klicke **"Add"**

### 4. Für die Asset-Ordner:

1. **Rechtsklick** auf `Assets.xcassets` im Project Navigator
2. Wähle **"Add Files to Assets..."**
3. Navigiere zu `Assets.xcassets/KitchenLight.imageset` und `KitchenDark.imageset`
4. Füge beide Ordner hinzu

### 5. Build das Projekt:
- Drücke `Cmd + B` oder wähle **Product > Build**
- Überprüfe, ob es Fehler gibt

## Alternative: Automatisches Hinzufügen (experimentell)

Du kannst auch versuchen, die Dateien automatisch hinzuzufügen mit:

```bash
cd ios/com.svh.cookingmanagement
# Schließe Xcode zuerst!
# Dann führe aus:
ruby ../add_files_to_xcode.rb
```

Hinweis: Dies erfordert ein Ruby-Skript, das die .pbxproj-Datei modifiziert.