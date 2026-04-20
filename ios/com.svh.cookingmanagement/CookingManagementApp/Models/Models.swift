import Foundation

// MARK: - Location
struct Location: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var imagePath: String?
    var createdAt: String?
    var updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case imagePath = "image_path"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
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
    var theme: String?
    var eventDate: String?
    var participants: [EventParticipant]?
    var courses: [EventCourse]?
    var shoppingList: ShoppingListDetail?
    var createdAt: String?
    var updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, theme, participants, courses
        case eventDate = "event_date"
        case shoppingList = "shopping_list"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct EventParticipant: Codable, Hashable {
    let id: Int
    let eventId: Int
    var name: String
    var dietaryRestrictions: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case eventId = "event_id"
        case dietaryRestrictions = "dietary_restrictions"
    }
}

struct EventCourse: Codable, Hashable {
    let id: Int
    let eventId: Int
    var courseNumber: Int
    var courseName: String
    var recipes: [CourseRecipe]?
    
    enum CodingKeys: String, CodingKey {
        case id, recipes
        case eventId = "event_id"
        case courseNumber = "course_number"
        case courseName = "course_name"
    }
}

struct CourseRecipe: Codable, Hashable {
    let id: Int
    let courseId: Int
    let recipeId: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case courseId = "course_id"
        case recipeId = "recipe_id"
    }
}

struct ShoppingListDetail: Codable, Hashable {
    let id: Int
    let eventId: Int
    var items: [ShoppingListItemDetail]?
    var createdAt: String?
    var updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, items
        case eventId = "event_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ShoppingListItemDetail: Codable, Hashable {
    let id: Int
    let shoppingListId: Int
    var itemName: String
    var quantity: Double
    var unit: String
    var isPurchased: Bool
    var source: String?
    
    enum CodingKeys: String, CodingKey {
        case id, quantity, unit, source
        case shoppingListId = "shopping_list_id"
        case itemName = "item_name"
        case isPurchased = "is_purchased"
    }
}

// MARK: - Guest
struct Guest: Codable, Identifiable, Hashable {
    let id: Int
    var firstName: String
    var lastName: String
    var email: String?
    var phone: String?
    var street: String?
    var city: String?
    var postalCode: String?
    var country: String?
    var intolerances: String?
    var favorites: String?
    var dietaryNotes: String?
    var imagePath: String?
    var createdAt: String?
    var updatedAt: String?
    
    var fullName: String {
        "\(firstName) \(lastName)"
    }
    
    enum CodingKeys: String, CodingKey {
        case id, email, phone, street, city, country, intolerances, favorites
        case firstName = "first_name"
        case lastName = "last_name"
        case postalCode = "postal_code"
        case dietaryNotes = "dietary_notes"
        case imagePath = "image_path"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Tool
struct Tool: Codable, Identifiable, Hashable {
    let id: Int
    var name: String
    var description: String?
    var storageLocation: String?
    var locationId: Int?
    var locationName: String?
    var imagePath: String?
    var createdAt: String?
    var updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case storageLocation = "storage_location"
        case locationId = "location_id"
        case locationName = "location_name"
        case imagePath = "image_path"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
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
