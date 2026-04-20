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
    var preparationTime: String?
    var cookingTime: String?
    var titleImageId: Int?
    var categories: [RecipeCategory]?
    var ingredients: [Ingredient]?
    var steps: [RecipeStep]?
    var images: [RecipeImage]?
    var createdAt: String?
    var updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, categories, ingredients, steps, images
        case preparationTime = "preparation_time"
        case cookingTime = "cooking_time"
        case titleImageId = "title_image_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct RecipeCategory: Codable, Hashable {
    let id: Int
    let recipeId: Int
    let categoryName: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case recipeId = "recipe_id"
        case categoryName = "category_name"
    }
}

struct Ingredient: Codable, Hashable {
    let id: Int
    let recipeId: Int
    var name: String
    var description: String?
    var amount: Double
    var unit: String
    var orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, amount, unit
        case recipeId = "recipe_id"
        case orderIndex = "order_index"
    }
}

struct RecipeStep: Codable, Hashable {
    let id: Int
    let recipeId: Int
    var stepNumber: Int
    var content: String
    var stepImageId: Int?
    var createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, content
        case recipeId = "recipe_id"
        case stepNumber = "step_number"
        case stepImageId = "step_image_id"
        case createdAt = "created_at"
    }
}

struct RecipeImage: Codable, Hashable {
    let id: Int
    let recipeId: Int
    var filename: String
    var filepath: String
    var isProcessImage: Bool
    var orderIndex: Int
    var createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, filename, filepath
        case recipeId = "recipe_id"
        case isProcessImage = "is_process_image"
        case orderIndex = "order_index"
        case createdAt = "created_at"
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
