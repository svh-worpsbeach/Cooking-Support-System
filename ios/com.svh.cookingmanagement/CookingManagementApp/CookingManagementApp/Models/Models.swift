import Foundation

// MARK: - Location
struct Location: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var imageUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case imageUrl = "image_url"
    }
}

// MARK: - Recipe
struct Recipe: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var ingredients: [Ingredient]
    var steps: [RecipeStep]
    var prepTime: Int?
    var cookTime: Int?
    var servings: Int?
    var difficulty: String?
    var category: String?
    var tags: [String]
    var imageUrl: String?
    var sourceUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, ingredients, steps, servings, difficulty, category, tags
        case prepTime = "prep_time"
        case cookTime = "cook_time"
        case imageUrl = "image_url"
        case sourceUrl = "source_url"
    }
}

struct Ingredient: Codable, Hashable {
    var name: String
    var amount: String
    var unit: String?
}

struct RecipeStep: Codable, Hashable {
    var stepNumber: Int
    var instruction: String
    var imageUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case instruction
        case stepNumber = "step_number"
        case imageUrl = "image_url"
    }
}

// MARK: - Event
struct Event: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var date: String
    var locationId: Int?
    var location: Location?
    var recipes: [Recipe]
    var guests: [Guest]
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, date, location, recipes, guests
        case locationId = "location_id"
    }
}

// MARK: - Guest
struct Guest: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var email: String?
    var phone: String?
    var dietaryRestrictions: String?
    var notes: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, email, phone, notes
        case dietaryRestrictions = "dietary_restrictions"
    }
}

// MARK: - Tool
struct Tool: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var quantity: Int
    var locationId: Int?
    var location: Location?
    var imageUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, quantity, location
        case locationId = "location_id"
        case imageUrl = "image_url"
    }
}

// MARK: - Storage
struct Storage: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var quantity: String?
    var unit: String?
    var expiryDate: String?
    var locationId: Int?
    var location: Location?
    var category: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, quantity, unit, location, category
        case expiryDate = "expiry_date"
        case locationId = "location_id"
    }
}

// MARK: - Shopping List
struct ShoppingList: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var items: [ShoppingListItem]
    var createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, items
        case createdAt = "created_at"
    }
}

struct ShoppingListItem: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var quantity: String?
    var unit: String?
    var checked: Bool
    var category: String?
}

// MARK: - API Response Types
struct RecipeImportRequest: Codable {
    let url: String
}

struct RecipeImportResponse: Codable {
    let recipe: Recipe
}

struct DatabaseInfo: Codable {
    let type: String
    let version: String?
    let tables: [String]
}

// Made with Bob
