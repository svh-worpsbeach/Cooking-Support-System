//
//  APIService.swift
//  CookingApp
//
//  Created by Bob
//

import Foundation
import UIKit

class APIService {
    static let shared = APIService()
    
    private let baseURL: String
    private let session: URLSession
    
    private init() {
        // Default to localhost, can be configured via Settings
        self.baseURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8000/api"
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: config)
    }
    
    func updateBaseURL(_ url: String) {
        UserDefaults.standard.set(url, forKey: "apiBaseURL")
    }
    
    // MARK: - Generic Request Methods
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        var urlComponents = URLComponents(string: "\(baseURL)\(endpoint)")!
        urlComponents.queryItems = queryItems
        
        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            if let apiError = try? JSONDecoder().decode(ApiError.self, from: data) {
                throw APIError.serverError(apiError.detail)
            }
            throw APIError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }
    
    private func requestWithoutResponse(
        endpoint: String,
        method: String = "DELETE"
    ) async throws {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Recipes
    
    func getRecipes(search: String? = nil, category: String? = nil) async throws -> [Recipe] {
        var queryItems: [URLQueryItem] = []
        if let search = search {
            queryItems.append(URLQueryItem(name: "search", value: search))
        }
        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category))
        }
        
        return try await request(
            endpoint: "/recipes",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
    }
    
    func getRecipe(id: Int) async throws -> Recipe {
        return try await request(endpoint: "/recipes/\(id)")
    }
    
    func createRecipe(_ recipe: RecipeCreate) async throws -> Recipe {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(recipe)
        return try await request(endpoint: "/recipes", method: "POST", body: data)
    }
    
    func updateRecipe(id: Int, recipe: RecipeCreate) async throws -> Recipe {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(recipe)
        return try await request(endpoint: "/recipes/\(id)", method: "PUT", body: data)
    }
    
    func deleteRecipe(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/recipes/\(id)")
    }
    
    func uploadRecipeImage(recipeId: Int, image: UIImage) async throws -> RecipeImage {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.invalidImage
        }
        
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "\(baseURL)/recipes/\(recipeId)/images")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.uploadFailed
        }
        
        return try JSONDecoder().decode(RecipeImage.self, from: data)
    }
    
    // MARK: - Events
    
    func getEvents() async throws -> [Event] {
        return try await request(endpoint: "/events")
    }
    
    func getEvent(id: Int) async throws -> Event {
        return try await request(endpoint: "/events/\(id)")
    }
    
    func createEvent(_ event: EventCreate) async throws -> Event {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(event)
        return try await request(endpoint: "/events", method: "POST", body: data)
    }
    
    func updateEvent(id: Int, event: EventCreate) async throws -> Event {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(event)
        return try await request(endpoint: "/events/\(id)", method: "PUT", body: data)
    }
    
    func deleteEvent(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/events/\(id)")
    }
    
    // MARK: - Tools
    
    func getTools(locationId: Int? = nil) async throws -> [CookingTool] {
        var queryItems: [URLQueryItem] = []
        if let locationId = locationId {
            queryItems.append(URLQueryItem(name: "location_id", value: String(locationId)))
        }
        
        return try await request(
            endpoint: "/tools",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
    }
    
    func getTool(id: Int) async throws -> CookingTool {
        return try await request(endpoint: "/tools/\(id)")
    }
    
    func createTool(_ tool: CookingToolCreate) async throws -> CookingTool {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(tool)
        return try await request(endpoint: "/tools", method: "POST", body: data)
    }
    
    func updateTool(id: Int, tool: CookingToolCreate) async throws -> CookingTool {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(tool)
        return try await request(endpoint: "/tools/\(id)", method: "PUT", body: data)
    }
    
    func deleteTool(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/tools/\(id)")
    }
    
    func uploadToolImage(toolId: Int, image: UIImage) async throws -> CookingTool {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.invalidImage
        }
        
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "\(baseURL)/tools/\(toolId)/image")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.uploadFailed
        }
        
        return try JSONDecoder().decode(CookingTool.self, from: data)
    }
    
    // MARK: - Storage
    
    func getStorageItems(locationId: Int? = nil, category: String? = nil) async throws -> [StorageItem] {
        var queryItems: [URLQueryItem] = []
        if let locationId = locationId {
            queryItems.append(URLQueryItem(name: "location_id", value: String(locationId)))
        }
        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category))
        }
        
        return try await request(
            endpoint: "/storage",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
    }
    
    func getStorageItem(id: Int) async throws -> StorageItem {
        return try await request(endpoint: "/storage/\(id)")
    }
    
    func createStorageItem(_ item: StorageItemCreate) async throws -> StorageItem {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(item)
        return try await request(endpoint: "/storage", method: "POST", body: data)
    }
    
    func updateStorageItem(id: Int, item: StorageItemCreate) async throws -> StorageItem {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(item)
        return try await request(endpoint: "/storage/\(id)", method: "PUT", body: data)
    }
    
    func deleteStorageItem(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/storage/\(id)")
    }
    
    // MARK: - Locations
    
    func getLocations() async throws -> [Location] {
        return try await request(endpoint: "/locations")
    }
    
    func getLocation(id: Int) async throws -> Location {
        return try await request(endpoint: "/locations/\(id)")
    }
    
    func createLocation(_ location: LocationCreate) async throws -> Location {
        let data = try JSONEncoder().encode(location)
        return try await request(endpoint: "/locations", method: "POST", body: data)
    }
    
    func updateLocation(id: Int, location: LocationCreate) async throws -> Location {
        let data = try JSONEncoder().encode(location)
        return try await request(endpoint: "/locations/\(id)", method: "PUT", body: data)
    }
    
    func deleteLocation(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/locations/\(id)")
    }
    
    // MARK: - Guests
    
    func getGuests() async throws -> [Guest] {
        return try await request(endpoint: "/guests")
    }
    
    func getGuest(id: Int) async throws -> Guest {
        return try await request(endpoint: "/guests/\(id)")
    }
    
    func createGuest(_ guest: GuestCreate) async throws -> Guest {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(guest)
        return try await request(endpoint: "/guests", method: "POST", body: data)
    }
    
    func updateGuest(id: Int, guest: GuestCreate) async throws -> Guest {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(guest)
        return try await request(endpoint: "/guests/\(id)", method: "PUT", body: data)
    }
    
    func deleteGuest(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/guests/\(id)")
    }
    
    // MARK: - Shopping Lists
    
    func getShoppingLists() async throws -> [ShoppingList] {
        return try await request(endpoint: "/shopping-lists")
    }
    
    func getShoppingList(id: Int) async throws -> ShoppingList {
        return try await request(endpoint: "/shopping-lists/\(id)")
    }
    
    func createShoppingList(_ list: ShoppingListCreate) async throws -> ShoppingList {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(list)
        return try await request(endpoint: "/shopping-lists", method: "POST", body: data)
    }
    
    func updateShoppingList(id: Int, list: ShoppingListCreate) async throws -> ShoppingList {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(list)
        return try await request(endpoint: "/shopping-lists/\(id)", method: "PUT", body: data)
    }
    
    func deleteShoppingList(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/shopping-lists/\(id)")
    }
    
    func updateShoppingListItem(listId: Int, itemId: Int, checked: Bool) async throws -> ShoppingListItem {
        let body = ["checked": checked ? 1 : 0]
        let data = try JSONSerialization.data(withJSONObject: body)
        return try await request(
            endpoint: "/shopping-lists/\(listId)/items/\(itemId)",
            method: "PATCH",
            body: data
        )
    }
    
    func createShoppingListFromEvent(eventId: Int, title: String?, dueDate: String?) async throws -> ShoppingList {
        var body: [String: Any] = [:]
        if let title = title {
            body["title"] = title
        }
        if let dueDate = dueDate {
            body["due_date"] = dueDate
        }
        let data = try JSONSerialization.data(withJSONObject: body)
        return try await request(
            endpoint: "/events/\(eventId)/shopping-list",
            method: "POST",
            body: data
        )
    }
    
    func createShoppingListFromRecipe(recipeId: Int, title: String?, dueDate: String?, servingsMultiplier: Double?) async throws -> ShoppingList {
        var body: [String: Any] = [:]
        if let title = title {
            body["title"] = title
        }
        if let dueDate = dueDate {
            body["due_date"] = dueDate
        }
        if let servingsMultiplier = servingsMultiplier {
            body["servings_multiplier"] = servingsMultiplier
        }
        let data = try JSONSerialization.data(withJSONObject: body)
        return try await request(
            endpoint: "/recipes/\(recipeId)/shopping-list",
            method: "POST",
            body: data
        )
    }
    
    // MARK: - Image Loading
    
    func loadImage(from path: String) async throws -> UIImage {
        let urlString = path.hasPrefix("http") ? path : "\(baseURL.replacingOccurrences(of: "/api", with: ""))\(path)"
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await session.data(from: url)
        
        guard let image = UIImage(data: data) else {
            throw APIError.invalidImage
        }
        
        return image
    }
}

// MARK: - API Error
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case serverError(String)
    case decodingError
    case invalidImage
    case uploadFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Ungültige URL"
        case .invalidResponse:
            return "Ungültige Antwort vom Server"
        case .httpError(let code):
            return "HTTP Fehler: \(code)"
        case .serverError(let message):
            return message
        case .decodingError:
            return "Fehler beim Dekodieren der Daten"
        case .invalidImage:
            return "Ungültiges Bild"
        case .uploadFailed:
            return "Upload fehlgeschlagen"
        }
    }
}

// Made with Bob
