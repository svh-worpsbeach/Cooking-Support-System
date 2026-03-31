# Guest Management System

## Übersicht

Das Guest Management System ermöglicht die Verwaltung von Gästen mit vollständigen Kontaktinformationen, Ernährungspräferenzen und Event-Zuordnungen.

## Features

### Gast-Verwaltung
- **CRUD-Operationen**: Erstellen, Lesen, Aktualisieren und Löschen von Gästen
- **Kontaktinformationen**: Name, E-Mail, Telefon, vollständige Adresse
- **Ernährungspräferenzen**: Unverträglichkeiten, Favoriten, Notizen
- **Bild-Upload**: Profilbilder für Gäste
- **Suchfunktion**: Suche nach Namen

### Event-Zuordnung
- **Many-to-Many Beziehung**: Gäste können mehreren Events zugeordnet werden
- **Event-Gast-Verwaltung**: Hinzufügen und Entfernen von Gästen zu/von Events
- **Übersichten**: Liste aller Gäste eines Events und alle Events eines Gastes

## Datenbank-Schema

### Guests Tabelle
```sql
CREATE TABLE guests (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    address_street VARCHAR(200),
    address_city VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100),
    intolerances TEXT,
    favorites TEXT,
    dietary_notes TEXT,
    image_path VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Event_Guests Association Tabelle
```sql
CREATE TABLE event_guests (
    event_id INTEGER NOT NULL,
    guest_id INTEGER NOT NULL,
    created_at TIMESTAMP,
    PRIMARY KEY (event_id, guest_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
)
```

## API Endpoints

### Gast-Verwaltung

#### Gast erstellen
```http
POST /api/guests
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+49 123 456789",
  "address_street": "Musterstraße 1",
  "address_city": "Berlin",
  "address_postal_code": "10115",
  "address_country": "Deutschland",
  "intolerances": "Laktose, Nüsse",
  "favorites": "Pasta, Salat",
  "dietary_notes": "Vegetarisch"
}
```

#### Alle Gäste abrufen
```http
GET /api/guests?search=Max&skip=0&limit=100
```

#### Einzelnen Gast abrufen
```http
GET /api/guests/{guest_id}
```

#### Gast aktualisieren
```http
PUT /api/guests/{guest_id}
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max.neu@example.com",
  "phone": "+49 123 456789"
}
```

#### Gast löschen
```http
DELETE /api/guests/{guest_id}
```

### Bild-Verwaltung

#### Gast-Bild hochladen
```http
POST /api/guests/{guest_id}/image
Content-Type: multipart/form-data

file: [Bilddatei]
```

**Unterstützte Formate**: JPG, JPEG, PNG, GIF, WEBP  
**Maximale Größe**: 10 MB

#### Gast-Bild löschen
```http
DELETE /api/guests/{guest_id}/image
```

### Event-Gast-Zuordnung

#### Gast zu Event hinzufügen
```http
POST /api/events/{event_id}/guests
Content-Type: application/json

{
  "guest_id": 1
}
```

#### Alle Gäste eines Events abrufen
```http
GET /api/events/{event_id}/guests
```

#### Gast von Event entfernen
```http
DELETE /api/events/{event_id}/guests/{guest_id}
```

#### Alle Events eines Gastes abrufen
```http
GET /api/guests/{guest_id}/events
```

## Migration

### Datenbank-Migration ausführen

```bash
cd backend
python migrate_add_guests.py
```

Das Migrationsskript:
- Erstellt die `guests` Tabelle
- Erstellt die `event_guests` Association Tabelle
- Unterstützt alle Datenbank-Typen (SQLite, PostgreSQL, DB2, MySQL)
- Prüft, ob Tabellen bereits existieren

## Verwendung

### 1. Migration ausführen
```bash
cd backend
python migrate_add_guests.py
```

### 2. Backend starten
```bash
cd backend
./run.sh
```

### 3. API testen

#### Gast erstellen
```bash
curl -X POST http://localhost:8000/api/guests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anna Schmidt",
    "email": "anna@example.com",
    "phone": "+49 987 654321",
    "address_street": "Hauptstraße 10",
    "address_city": "München",
    "address_postal_code": "80331",
    "address_country": "Deutschland",
    "intolerances": "Gluten",
    "favorites": "Pizza, Sushi",
    "dietary_notes": "Vegan"
  }'
```

#### Gast zu Event hinzufügen
```bash
curl -X POST http://localhost:8000/api/events/1/guests \
  -H "Content-Type: application/json" \
  -d '{"guest_id": 1}'
```

#### Bild hochladen
```bash
curl -X POST http://localhost:8000/api/guests/1/image \
  -F "file=@/path/to/image.jpg"
```

## Dateistruktur

```
backend/
├── app/
│   ├── models/
│   │   ├── guest.py          # Guest Model und event_guests Tabelle
│   │   └── event.py          # Event Model mit guests Beziehung
│   ├── schemas/
│   │   └── guest.py          # Pydantic Schemas für Validierung
│   ├── routers/
│   │   └── guests.py         # API Endpoints
│   └── main.py               # Router-Registrierung
├── uploads/
│   └── guests/               # Gast-Bilder
└── migrate_add_guests.py     # Migrations-Skript
```

## Validierung

### E-Mail-Validierung
- Verwendet Pydantic's `EmailStr` für automatische E-Mail-Validierung
- Optional: Kann leer gelassen werden

### Pflichtfelder
- **name**: Erforderlich, max. 200 Zeichen

### Optionale Felder
- **email**: Optional, muss gültige E-Mail sein
- **phone**: Optional, max. 50 Zeichen
- **address_***: Optional, verschiedene Längenbeschränkungen
- **intolerances**: Optional, unbegrenzte Länge
- **favorites**: Optional, unbegrenzte Länge
- **dietary_notes**: Optional, unbegrenzte Länge

## Fehlerbehandlung

### Häufige Fehler

#### 404 Not Found
```json
{
  "detail": "Guest not found"
}
```

#### 400 Bad Request
```json
{
  "detail": "Guest is already assigned to this event"
}
```

#### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

## Best Practices

### 1. Datenintegrität
- Verwende CASCADE DELETE für automatisches Aufräumen
- Prüfe auf doppelte Event-Zuordnungen

### 2. Bild-Upload
- Validiere Dateitypen und -größen
- Verwende eindeutige Dateinamen (UUID)
- Lösche alte Bilder beim Hochladen neuer

### 3. Suche
- Verwende case-insensitive Suche
- Implementiere Pagination (skip/limit)

### 4. Performance
- Verwende Eager Loading für Beziehungen
- Indexiere häufig gesuchte Felder (name, email)

## Zukünftige Erweiterungen

- [ ] Gast-Gruppen (Familien, Freunde)
- [ ] Gast-Historie (besuchte Events)
- [ ] Gast-Notizen pro Event
- [ ] Import/Export von Gästen (CSV)
- [ ] Gast-Tags für Kategorisierung
- [ ] Automatische Duplikatserkennung
- [ ] Gast-Statistiken (häufigste Gäste, etc.)