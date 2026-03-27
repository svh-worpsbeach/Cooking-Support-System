# DB2 Migration Guide

## Problem
DB2 hat Einschränkungen bei der Verwendung von `Text`-Spalten (CLOB). Diese können nicht in ORDER BY, GROUP BY oder WHERE-Klauseln verwendet werden, was zu Fehlern wie diesem führt:

```
SQL0134N Improper use of a string column, host variable, constant, or function "RECIPES_DESCRIPTION"
```

## Lösung
Alle `Text`-Spalten wurden durch `String`-Spalten mit ausreichender Länge ersetzt:

### Geänderte Modelle

#### Recipe Model (`backend/app/models/recipe.py`)
- `description`: `Text` → `String(2000)`
- `content` (in RecipeStep): `Text` → `String(4000)`

#### Event Model (`backend/app/models/event.py`)
- `description`: `Text` → `String(2000)`
- `dietary_restrictions` (in EventParticipant): `Text` → `String(1000)`

#### Tool Model (`backend/app/models/tool.py`)
- `description` (in CookingTool): `Text` → `String(2000)`
- `description` (in ToolWishlist): `Text` → `String(2000)`

#### Location Model (`backend/app/models/location.py`)
- `description`: Bereits `String(1000)` ✓

## Datenbank neu initialisieren

### Option 1: Docker Compose (Empfohlen)

1. Stoppe und entferne alle Container und Volumes:
```bash
docker-compose down -v
```

2. Starte die Container neu:
```bash
docker-compose up -d
```

3. Warte, bis DB2 vollständig gestartet ist (~3 Minuten):
```bash
docker logs -f cooking-db2
```

4. Die Tabellen werden automatisch mit den neuen Spaltentypen erstellt.

### Option 2: Lokale Entwicklung mit SQLite

Wenn du SQLite verwendest, lösche einfach die Datenbankdatei:

```bash
rm backend/cooking.db
```

Die Datenbank wird beim nächsten Start automatisch neu erstellt.

### Option 3: Manuelle DB2-Migration

Falls du eine bestehende DB2-Datenbank mit Daten hast:

1. Exportiere die Daten:
```bash
python backend/export_data.py
```

2. Lösche die Tabellen:
```sql
DROP TABLE step_storage_refs;
DROP TABLE step_ingredient_refs;
DROP TABLE shopping_list_items;
DROP TABLE shopping_lists;
DROP TABLE course_recipes;
DROP TABLE event_courses;
DROP TABLE event_participants;
DROP TABLE events;
DROP TABLE recipe_images;
DROP TABLE recipe_steps;
DROP TABLE recipe_ingredients;
DROP TABLE recipe_categories;
DROP TABLE recipes;
DROP TABLE tool_wishlist;
DROP TABLE cooking_tools;
DROP TABLE storage_items;
DROP TABLE locations;
```

3. Starte die Anwendung neu - Tabellen werden automatisch erstellt

4. Importiere die Daten:
```bash
python backend/import_data.py
```

## Testen

Nach der Migration teste die Anwendung:

```bash
# Backend starten
cd backend
python -m uvicorn app.main:app --reload

# In einem anderen Terminal: API testen
curl http://localhost:8000/api/recipes
curl http://localhost:8000/api/events
curl http://localhost:8000/api/tools
```

## Hinweise

- Die neuen String-Längen sind großzügig bemessen:
  - `String(1000)`: Kurze Beschreibungen
  - `String(2000)`: Mittlere Beschreibungen
  - `String(4000)`: Lange Texte (z.B. Rezeptschritte)
  
- Falls du längere Texte benötigst, kannst du die Längen in den Modellen anpassen

- DB2 unterstützt VARCHAR bis zu 32.672 Zeichen

## Weitere Informationen

- [DB2 String Data Types](https://www.ibm.com/docs/en/db2/11.5?topic=types-character-strings)
- [SQLAlchemy DB2 Dialect](https://github.com/ibmdb/python-ibmdb/wiki/APIs)