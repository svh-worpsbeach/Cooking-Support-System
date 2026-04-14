//
//  Localizable.swift
//  CookingApp
//
//  Created by Bob
//

import Foundation

struct Localizable {
    static func string(_ key: String, language: String = "de") -> String {
        return translations[language]?[key] ?? key
    }
    
    private static let translations: [String: [String: String]] = [
        "de": [
            // Common
            "common.appName": "Cooking Support System",
            "common.loading": "Lädt...",
            "common.error": "Fehler",
            "common.success": "Erfolg",
            "common.save": "Speichern",
            "common.cancel": "Abbrechen",
            "common.delete": "Löschen",
            "common.edit": "Bearbeiten",
            "common.create": "Erstellen",
            "common.add": "Hinzufügen",
            "common.update": "Aktualisieren",
            "common.remove": "Entfernen",
            "common.search": "Suchen",
            "common.filter": "Filtern",
            "common.back": "Zurück",
            "common.close": "Schließen",
            "common.confirm": "Bestätigen",
            "common.yes": "Ja",
            "common.no": "Nein",
            
            // Navigation
            "nav.home": "Startseite",
            "nav.recipes": "Rezepte",
            "nav.events": "Veranstaltungen",
            "nav.tools": "Werkzeuge",
            "nav.storage": "Lager",
            "nav.locations": "Standorte",
            "nav.guests": "Gäste",
            "nav.shoppingLists": "Einkaufslisten",
            "nav.settings": "Einstellungen",
            
            // Recipes
            "recipes.title": "Rezepte",
            "recipes.createRecipe": "Rezept erstellen",
            "recipes.editRecipe": "Rezept bearbeiten",
            "recipes.recipeName": "Rezeptname",
            "recipes.description": "Beschreibung",
            "recipes.categories": "Kategorien",
            "recipes.ingredients": "Zutaten",
            "recipes.steps": "Schritte",
            "recipes.preparationTime": "Vorbereitungszeit",
            "recipes.cookingTime": "Koch-/Backzeit",
            "recipes.totalTime": "Gesamtzeit",
            "recipes.searchPlaceholder": "Nach Name oder Beschreibung suchen...",
            "recipes.addIngredient": "Zutat hinzufügen",
            "recipes.addStep": "Schritt hinzufügen",
            "recipes.noRecipes": "Keine Rezepte gefunden",
            
            // Events
            "events.title": "Veranstaltungen",
            "events.createEvent": "Veranstaltung erstellen",
            "events.editEvent": "Veranstaltung bearbeiten",
            "events.eventName": "Veranstaltungsname",
            "events.theme": "Thema",
            "events.eventDate": "Datum",
            "events.participants": "Teilnehmer",
            "events.courses": "Gänge",
            "events.addParticipant": "Teilnehmer hinzufügen",
            "events.addCourse": "Gang hinzufügen",
            "events.noEvents": "Keine Veranstaltungen gefunden",
            
            // Tools
            "tools.title": "Werkzeuge",
            "tools.createTool": "Werkzeug erstellen",
            "tools.editTool": "Werkzeug bearbeiten",
            "tools.toolName": "Werkzeugname",
            "tools.storageLocation": "Lagerort",
            "tools.noTools": "Keine Werkzeuge gefunden",
            
            // Storage
            "storage.title": "Lager",
            "storage.createItem": "Artikel erstellen",
            "storage.editItem": "Artikel bearbeiten",
            "storage.itemName": "Artikelname",
            "storage.category": "Kategorie",
            "storage.quantity": "Menge",
            "storage.unit": "Einheit",
            "storage.expiryDate": "Ablaufdatum",
            "storage.noItems": "Keine Artikel gefunden",
            
            // Locations
            "locations.title": "Standorte",
            "locations.createLocation": "Standort erstellen",
            "locations.editLocation": "Standort bearbeiten",
            "locations.locationName": "Standortname",
            "locations.noLocations": "Keine Standorte gefunden",
            
            // Guests
            "guests.title": "Gäste",
            "guests.createGuest": "Gast erstellen",
            "guests.editGuest": "Gast bearbeiten",
            "guests.firstName": "Vorname",
            "guests.lastName": "Nachname",
            "guests.email": "E-Mail",
            "guests.phone": "Telefon",
            "guests.noGuests": "Keine Gäste gefunden",
            
            // Shopping Lists
            "shoppingLists.title": "Einkaufslisten",
            "shoppingLists.createList": "Liste erstellen",
            "shoppingLists.editList": "Liste bearbeiten",
            "shoppingLists.listTitle": "Listentitel",
            "shoppingLists.dueDate": "Fälligkeitsdatum",
            "shoppingLists.items": "Artikel",
            "shoppingLists.noLists": "Keine Einkaufslisten gefunden",
            "shoppingLists.noItems": "Keine Artikel in dieser Liste",
            
            // Settings
            "settings.title": "Einstellungen",
            "settings.language": "Sprache",
            "settings.darkMode": "Dunkler Modus",
            "settings.apiURL": "API URL",
            "settings.about": "Über",
        ],
        "en": [
            // Common
            "common.appName": "Cooking Support System",
            "common.loading": "Loading...",
            "common.error": "Error",
            "common.success": "Success",
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.create": "Create",
            "common.add": "Add",
            "common.update": "Update",
            "common.remove": "Remove",
            "common.search": "Search",
            "common.filter": "Filter",
            "common.back": "Back",
            "common.close": "Close",
            "common.confirm": "Confirm",
            "common.yes": "Yes",
            "common.no": "No",
            
            // Navigation
            "nav.home": "Home",
            "nav.recipes": "Recipes",
            "nav.events": "Events",
            "nav.tools": "Tools",
            "nav.storage": "Storage",
            "nav.locations": "Locations",
            "nav.guests": "Guests",
            "nav.shoppingLists": "Shopping Lists",
            "nav.settings": "Settings",
            
            // Recipes
            "recipes.title": "Recipes",
            "recipes.createRecipe": "Create Recipe",
            "recipes.editRecipe": "Edit Recipe",
            "recipes.recipeName": "Recipe Name",
            "recipes.description": "Description",
            "recipes.categories": "Categories",
            "recipes.ingredients": "Ingredients",
            "recipes.steps": "Steps",
            "recipes.preparationTime": "Preparation Time",
            "recipes.cookingTime": "Cooking Time",
            "recipes.totalTime": "Total Time",
            "recipes.searchPlaceholder": "Search by name or description...",
            "recipes.addIngredient": "Add Ingredient",
            "recipes.addStep": "Add Step",
            "recipes.noRecipes": "No recipes found",
            
            // Events
            "events.title": "Events",
            "events.createEvent": "Create Event",
            "events.editEvent": "Edit Event",
            "events.eventName": "Event Name",
            "events.theme": "Theme",
            "events.eventDate": "Date",
            "events.participants": "Participants",
            "events.courses": "Courses",
            "events.addParticipant": "Add Participant",
            "events.addCourse": "Add Course",
            "events.noEvents": "No events found",
            
            // Tools
            "tools.title": "Tools",
            "tools.createTool": "Create Tool",
            "tools.editTool": "Edit Tool",
            "tools.toolName": "Tool Name",
            "tools.storageLocation": "Storage Location",
            "tools.noTools": "No tools found",
            
            // Storage
            "storage.title": "Storage",
            "storage.createItem": "Create Item",
            "storage.editItem": "Edit Item",
            "storage.itemName": "Item Name",
            "storage.category": "Category",
            "storage.quantity": "Quantity",
            "storage.unit": "Unit",
            "storage.expiryDate": "Expiry Date",
            "storage.noItems": "No items found",
            
            // Locations
            "locations.title": "Locations",
            "locations.createLocation": "Create Location",
            "locations.editLocation": "Edit Location",
            "locations.locationName": "Location Name",
            "locations.noLocations": "No locations found",
            
            // Guests
            "guests.title": "Guests",
            "guests.createGuest": "Create Guest",
            "guests.editGuest": "Edit Guest",
            "guests.firstName": "First Name",
            "guests.lastName": "Last Name",
            "guests.email": "Email",
            "guests.phone": "Phone",
            "guests.noGuests": "No guests found",
            
            // Shopping Lists
            "shoppingLists.title": "Shopping Lists",
            "shoppingLists.createList": "Create List",
            "shoppingLists.editList": "Edit List",
            "shoppingLists.listTitle": "List Title",
            "shoppingLists.dueDate": "Due Date",
            "shoppingLists.items": "Items",
            "shoppingLists.noLists": "No shopping lists found",
            "shoppingLists.noItems": "No items in this list",
            
            // Settings
            "settings.title": "Settings",
            "settings.language": "Language",
            "settings.darkMode": "Dark Mode",
            "settings.apiURL": "API URL",
            "settings.about": "About",
        ]
    ]
}

// Helper extension for easy access
extension String {
    func localized(_ language: String = "de") -> String {
        return Localizable.string(self, language: language)
    }
}

// Made with Bob
