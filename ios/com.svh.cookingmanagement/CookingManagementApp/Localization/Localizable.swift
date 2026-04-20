import Foundation

struct Localizable {
    static let translations: [String: [String: String]] = [
        "de": [
            // Navigation
            "nav.home": "Start",
            "nav.recipes": "Rezepte",
            "nav.events": "Events",
            "nav.tools": "Werkzeuge",
            "nav.storage": "Lager",
            "nav.more": "Mehr",
            
            // Common
            "common.save": "Speichern",
            "common.cancel": "Abbrechen",
            "common.delete": "Löschen",
            "common.edit": "Bearbeiten",
            "common.add": "Hinzufügen",
            "common.search": "Suchen",
            "common.loading": "Lädt...",
            "common.error": "Fehler",
            "common.success": "Erfolg",
            "common.name": "Name",
            "common.description": "Beschreibung",
            "common.quantity": "Menge",
            "common.unit": "Einheit",
            "common.category": "Kategorie",
            "common.date": "Datum",
            "common.location": "Standort",
            "common.image": "Bild",
            
            // Recipes
            "recipes.title": "Rezepte",
            "recipes.new": "Neues Rezept",
            "recipes.ingredients": "Zutaten",
            "recipes.steps": "Schritte",
            "recipes.prepTime": "Vorbereitungszeit",
            "recipes.cookTime": "Kochzeit",
            "recipes.servings": "Portionen",
            "recipes.difficulty": "Schwierigkeit",
            "recipes.tags": "Tags",
            "recipes.sourceUrl": "Quell-URL",
            "recipes.import": "Rezept importieren",
            "recipes.importUrl": "URL eingeben",
            
            // Events
            "events.title": "Events",
            "events.new": "Neues Event",
            "events.guests": "Gäste",
            "events.recipes": "Rezepte",
            
            // Tools
            "tools.title": "Werkzeuge",
            "tools.new": "Neues Werkzeug",
            
            // Storage
            "storage.title": "Lager",
            "storage.new": "Neuer Artikel",
            "storage.expiryDate": "Ablaufdatum",
            
            // Locations
            "locations.title": "Standorte",
            "locations.new": "Neuer Standort",
            
            // Guests
            "guests.title": "Gäste",
            "guests.new": "Neuer Gast",
            "guests.email": "E-Mail",
            "guests.phone": "Telefon",
            "guests.dietary": "Ernährungseinschränkungen",
            "guests.notes": "Notizen",
            
            // Shopping Lists
            "shopping.title": "Einkaufslisten",
            "shopping.new": "Neue Liste",
            "shopping.items": "Artikel",
            "shopping.checked": "Erledigt",
            
            // Settings
            "settings.title": "Einstellungen",
            "settings.language": "Sprache",
            "settings.darkMode": "Dunkler Modus",
            "settings.apiUrl": "API URL",
            "settings.about": "Über",
            
            // Empty States
            "empty.recipes": "Keine Rezepte vorhanden",
            "empty.events": "Keine Events vorhanden",
            "empty.tools": "Keine Werkzeuge vorhanden",
            "empty.storage": "Keine Lagerartikel vorhanden",
            "empty.locations": "Keine Standorte vorhanden",
            "empty.guests": "Keine Gäste vorhanden",
            "empty.shopping": "Keine Einkaufslisten vorhanden"
        ],
        "en": [
            // Navigation
            "nav.home": "Home",
            "nav.recipes": "Recipes",
            "nav.events": "Events",
            "nav.tools": "Tools",
            "nav.storage": "Storage",
            "nav.more": "More",
            
            // Common
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.add": "Add",
            "common.search": "Search",
            "common.loading": "Loading...",
            "common.error": "Error",
            "common.success": "Success",
            "common.name": "Name",
            "common.description": "Description",
            "common.quantity": "Quantity",
            "common.unit": "Unit",
            "common.category": "Category",
            "common.date": "Date",
            "common.location": "Location",
            "common.image": "Image",
            
            // Recipes
            "recipes.title": "Recipes",
            "recipes.new": "New Recipe",
            "recipes.ingredients": "Ingredients",
            "recipes.steps": "Steps",
            "recipes.prepTime": "Prep Time",
            "recipes.cookTime": "Cook Time",
            "recipes.servings": "Servings",
            "recipes.difficulty": "Difficulty",
            "recipes.tags": "Tags",
            "recipes.sourceUrl": "Source URL",
            "recipes.import": "Import Recipe",
            "recipes.importUrl": "Enter URL",
            
            // Events
            "events.title": "Events",
            "events.new": "New Event",
            "events.guests": "Guests",
            "events.recipes": "Recipes",
            
            // Tools
            "tools.title": "Tools",
            "tools.new": "New Tool",
            
            // Storage
            "storage.title": "Storage",
            "storage.new": "New Item",
            "storage.expiryDate": "Expiry Date",
            
            // Locations
            "locations.title": "Locations",
            "locations.new": "New Location",
            
            // Guests
            "guests.title": "Guests",
            "guests.new": "New Guest",
            "guests.email": "Email",
            "guests.phone": "Phone",
            "guests.dietary": "Dietary Restrictions",
            "guests.notes": "Notes",
            
            // Shopping Lists
            "shopping.title": "Shopping Lists",
            "shopping.new": "New List",
            "shopping.items": "Items",
            "shopping.checked": "Checked",
            
            // Settings
            "settings.title": "Settings",
            "settings.language": "Language",
            "settings.darkMode": "Dark Mode",
            "settings.apiUrl": "API URL",
            "settings.about": "About",
            "settings.configureBackend": "Configure Backend",
            "settings.backendUrl": "Backend URL",
            "settings.backendUrlDescription": "Enter the URL of your backend server. The app will connect to this server to load and save data.",
            "settings.urlInput": "URL Input",
            "settings.urlPlaceholder": "http://localhost:8000",
            "settings.quickPresets": "Quick presets:",
            "settings.testConnection": "Test Connection",
            "settings.testing": "Testing connection...",
            "settings.connectionSuccess": "✓ Connection successful",
            "settings.connectionFailed": "✗ Connection failed",
            "settings.examples": "Examples",
            "settings.exampleLocal": "Local (Simulator):",
            "settings.exampleNetwork": "Network (Device):",
            "settings.exampleProduction": "Production:",
            
            // Empty States
            "empty.recipes": "No recipes available",
            "empty.events": "No events available",
            "empty.tools": "No tools available",
            "empty.storage": "No storage items available",
            "empty.locations": "No locations available",
            "empty.guests": "No guests available",
            "empty.shopping": "No shopping lists available"
        ]
    ]
    
    static func localized(_ key: String, language: String = "de") -> String {
        translations[language]?[key] ?? key
    }
}

extension String {
    func localized(_ language: String = "de") -> String {
        Localizable.localized(self, language: language)
    }
}

// Made with Bob
