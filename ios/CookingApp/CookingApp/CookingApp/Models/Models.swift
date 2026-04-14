//
//  Models.swift
//  CookingApp
//
//  Created by Bob
//

import Foundation

// MARK: - Location
struct Location: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let description: String?
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct LocationCreate: Codable {
    let name: String
    let description: String?
}

// MARK: - Recipe
struct Recipe: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let description: String?
    let preparationTime: String
    let cookingTime: String
    let titleImageId: Int?
    let createdAt: String
    let updatedAt: String
    let categories: [RecipeCategory]
    let ingredients: [RecipeIngredient]
    let steps: [RecipeStep]
    let images: [RecipeImage]
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, categories, ingredients, steps, images
        case preparationTime = "preparation_time"
        case cookingTime = "cooking_time"
        case titleImageId = "title_image_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct RecipeCategory: Codable, Identifiable, Hashable {
    let id: Int
    let recipeId: Int
    let categoryName: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case recipeId = "recipe_id"
        case categoryName = "category_name"
    }
}

struct RecipeIngredient: Codable, Identifiable, Hashable {
    let id: Int
    let recipeId: Int
    let name: String
    let description: String?
    let amount: Double?
    let unit: String?
    let orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, amount, unit
        case recipeId = "recipe_id"
        case orderIndex = "order_index"
    }
}

struct RecipeStep: Codable, Identifiable, Hashable {
    let id: Int
    let recipeId: Int
    let stepNumber: Int
    let content: String
    let stepImageId: Int?
    let createdAt: String
    let ingredientRefs: [StepIngredientRef]
    let storageRefs: [StepStorageRef]
    let stepImage: RecipeImage?
    
    enum CodingKeys: String, CodingKey {
        case id, content
        case recipeId = "recipe_id"
        case stepNumber = "step_number"
        case stepImageId = "step_image_id"
        case createdAt = "created_at"
        case ingredientRefs = "ingredient_refs"
        case storageRefs = "storage_refs"
        case stepImage = "step_image"
    }
}

struct RecipeImage: Codable, Identifiable, Hashable {
    let id: Int
    let recipeId: Int
    let filename: String
    let filepath: String
    let isProcessImage: Bool
    let orderIndex: Int
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, filename, filepath
        case recipeId = "recipe_id"
        case isProcessImage = "is_process_image"
        case orderIndex = "order_index"
        case createdAt = "created_at"
    }
}

struct StepIngredientRef: Codable, Identifiable, Hashable {
    let id: Int
    let stepId: Int
    let ingredientId: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case stepId = "step_id"
        case ingredientId = "ingredient_id"
    }
}

struct StepStorageRef: Codable, Identifiable, Hashable {
    let id: Int
    let stepId: Int
    let storageItemId: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case stepId = "step_id"
        case storageItemId = "storage_item_id"
    }
}

struct RecipeCreate: Codable {
    let name: String
    let description: String?
    let preparationTime: String?
    let cookingTime: String?
    let categories: [String]?
    let ingredients: [RecipeIngredientCreate]?
    let steps: [RecipeStepCreate]?
    
    enum CodingKeys: String, CodingKey {
        case name, description, categories, ingredients, steps
        case preparationTime = "preparation_time"
        case cookingTime = "cooking_time"
    }
}

struct RecipeIngredientCreate: Codable {
    let name: String
    let description: String?
    let amount: Double?
    let unit: String?
    let orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case name, description, amount, unit
        case orderIndex = "order_index"
    }
}

struct RecipeStepCreate: Codable {
    let stepNumber: Int
    let content: String
    let stepImageId: Int?
    
    enum CodingKeys: String, CodingKey {
        case content
        case stepNumber = "step_number"
        case stepImageId = "step_image_id"
    }
}

// MARK: - Event
struct Event: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let description: String?
    let theme: String?
    let eventDate: String?
    let createdAt: String
    let updatedAt: String
    let participants: [EventParticipant]
    let courses: [EventCourse]
    let shoppingList: ShoppingList?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, theme, participants, courses
        case eventDate = "event_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case shoppingList = "shopping_list"
    }
}

struct EventParticipant: Codable, Identifiable, Hashable {
    let id: Int
    let eventId: Int
    let name: String
    let dietaryRestrictions: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case eventId = "event_id"
        case dietaryRestrictions = "dietary_restrictions"
    }
}

struct EventCourse: Codable, Identifiable, Hashable {
    let id: Int
    let eventId: Int
    let courseNumber: Int
    let courseName: String
    let recipes: [CourseRecipe]
    
    enum CodingKeys: String, CodingKey {
        case id, recipes
        case eventId = "event_id"
        case courseNumber = "course_number"
        case courseName = "course_name"
    }
}

struct CourseRecipe: Codable, Identifiable, Hashable {
    let id: Int
    let courseId: Int
    let recipeId: Int
    let recipe: Recipe?
    
    enum CodingKeys: String, CodingKey {
        case id, recipe
        case courseId = "course_id"
        case recipeId = "recipe_id"
    }
}

struct EventCreate: Codable {
    let name: String
    let description: String?
    let theme: String?
    let eventDate: String?
    let participants: [EventParticipantCreate]?
    let courses: [EventCourseCreate]?
    
    enum CodingKeys: String, CodingKey {
        case name, description, theme, participants, courses
        case eventDate = "event_date"
    }
}

struct EventParticipantCreate: Codable {
    let name: String
    let dietaryRestrictions: String?
    
    enum CodingKeys: String, CodingKey {
        case name
        case dietaryRestrictions = "dietary_restrictions"
    }
}

struct EventCourseCreate: Codable {
    let courseNumber: Int
    let courseName: String
    let recipeIds: [Int]?
    
    enum CodingKeys: String, CodingKey {
        case courseName = "course_name"
        case courseNumber = "course_number"
        case recipeIds = "recipe_ids"
    }
}

// MARK: - Ingredient
struct Ingredient: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let description: String?
    let defaultShop: String?
    let defaultUnit: String?
    let createdAt: String
    let updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case defaultShop = "default_shop"
        case defaultUnit = "default_unit"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct IngredientCreate: Codable {
    let name: String
    let description: String?
    let defaultShop: String?
    let defaultUnit: String?
    
    enum CodingKeys: String, CodingKey {
        case name, description
        case defaultShop = "default_shop"
        case defaultUnit = "default_unit"
    }
}

// MARK: - Shopping List
struct ShoppingList: Codable, Identifiable, Hashable {
    let id: Int
    let title: String
    let dueDate: String
    let eventId: Int?
    let recipeId: Int?
    let createdAt: String
    let updatedAt: String?
    let items: [ShoppingListItem]?
    
    enum CodingKeys: String, CodingKey {
        case id, title, items
        case dueDate = "due_date"
        case eventId = "event_id"
        case recipeId = "recipe_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ShoppingListItem: Codable, Identifiable, Hashable {
    let id: Int
    let shoppingListId: Int
    let name: String
    let amount: Double?
    let unit: String?
    let shop: String?
    let checked: Int
    let orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case id, name, amount, unit, shop, checked
        case shoppingListId = "shopping_list_id"
        case orderIndex = "order_index"
    }
}

struct ShoppingListCreate: Codable {
    let title: String
    let dueDate: String
    let eventId: Int?
    let recipeId: Int?
    let items: [ShoppingListItemCreate]?
    
    enum CodingKeys: String, CodingKey {
        case title, items
        case dueDate = "due_date"
        case eventId = "event_id"
        case recipeId = "recipe_id"
    }
}

struct ShoppingListItemCreate: Codable {
    let name: String
    let amount: Double?
    let unit: String?
    let shop: String?
    let checked: Int
    let orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case name, amount, unit, shop, checked
        case orderIndex = "order_index"
    }
}

// MARK: - Tool
struct CookingTool: Codable, Identifiable, Hashable {
    let id: Int
    let locationId: Int?
    let name: String
    let description: String?
    let imagePath: String?
    let storageLocation: String?
    let createdAt: String
    let updatedAt: String
    let location: Location?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, location
        case locationId = "location_id"
        case imagePath = "image_path"
        case storageLocation = "storage_location"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ToolWishlist: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let description: String?
    let url: String?
    let estimatedPrice: Double?
    let priority: Int
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, url, priority
        case estimatedPrice = "estimated_price"
        case createdAt = "created_at"
    }
}

struct CookingToolCreate: Codable {
    let locationId: Int?
    let name: String
    let description: String?
    let storageLocation: String?
    
    enum CodingKeys: String, CodingKey {
        case name, description
        case locationId = "location_id"
        case storageLocation = "storage_location"
    }
}

struct ToolWishlistCreate: Codable {
    let name: String
    let description: String?
    let url: String?
    let estimatedPrice: Double?
    let priority: Int?
    
    enum CodingKeys: String, CodingKey {
        case name, description, url, priority
        case estimatedPrice = "estimated_price"
    }
}

// MARK: - Guest
struct Guest: Codable, Identifiable, Hashable {
    let id: Int
    let firstName: String
    let lastName: String
    let email: String?
    let phone: String?
    let street: String?
    let city: String?
    let postalCode: String?
    let country: String?
    let intolerances: String?
    let favorites: String?
    let dietaryNotes: String?
    let imagePath: String?
    let createdAt: String
    let updatedAt: String?
    let eventCount: Int?
    
    enum CodingKeys: String, CodingKey {
        case id, email, phone, street, city, country, intolerances, favorites
        case firstName = "first_name"
        case lastName = "last_name"
        case postalCode = "postal_code"
        case dietaryNotes = "dietary_notes"
        case imagePath = "image_path"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case eventCount = "event_count"
    }
}

struct GuestCreate: Codable {
    let firstName: String
    let lastName: String
    let email: String?
    let phone: String?
    let street: String?
    let city: String?
    let postalCode: String?
    let country: String?
    let intolerances: String?
    let favorites: String?
    let dietaryNotes: String?
    
    enum CodingKeys: String, CodingKey {
        case email, phone, street, city, country, intolerances, favorites
        case firstName = "first_name"
        case lastName = "last_name"
        case postalCode = "postal_code"
        case dietaryNotes = "dietary_notes"
    }
}

// MARK: - Storage
struct StorageItem: Codable, Identifiable, Hashable {
    let id: Int
    let locationId: Int?
    let name: String
    let category: String
    let quantity: Double?
    let unit: String?
    let expiryDate: String?
    let createdAt: String
    let updatedAt: String
    let location: Location?
    
    enum CodingKeys: String, CodingKey {
        case id, name, category, quantity, unit, location
        case locationId = "location_id"
        case expiryDate = "expiry_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct StorageItemCreate: Codable {
    let locationId: Int?
    let name: String
    let category: String
    let quantity: Double?
    let unit: String?
    let expiryDate: String?
    
    enum CodingKeys: String, CodingKey {
        case name, category, quantity, unit
        case locationId = "location_id"
        case expiryDate = "expiry_date"
    }
}

// MARK: - API Response
struct ApiError: Codable {
    let detail: String
}

struct PaginatedResponse<T: Codable>: Codable {
    let items: [T]
    let total: Int
    let page: Int
    let size: Int
    let pages: Int
}

// Made with Bob
