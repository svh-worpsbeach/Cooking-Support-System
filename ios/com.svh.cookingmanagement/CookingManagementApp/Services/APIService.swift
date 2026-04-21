import Foundation
import UIKit

class APIService {
    static let shared = APIService()
    
    private var baseURL: String {
        UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580"
    }
    
    private var isNetworkDebugLoggingEnabled: Bool {
        #if DEBUG
        true
        #else
        false
        #endif
    }
    
    private init() {}
    
    // MARK: - Generic Request Methods
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        
        logRequest(request, body: body)
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            logResponse(data: data, response: response, error: nil)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw URLError(.badServerResponse)
            }
            
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            logResponse(data: nil, response: nil, error: error)
            throw error
        }
    }
    
    private func requestWithoutResponse(
        endpoint: String,
        method: String = "DELETE"
    ) async throws {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        logRequest(request, body: nil)
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            logResponse(data: data, response: response, error: nil)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw URLError(.badServerResponse)
            }
        } catch {
            logResponse(data: nil, response: nil, error: error)
            throw error
        }
    }
    
    private func logRequest(_ request: URLRequest, body: Data?) {
        guard isNetworkDebugLoggingEnabled else { return }
        
        let method = request.httpMethod ?? "UNKNOWN"
        let url = request.url?.absoluteString ?? "nil"
        print("🌐 [API Request] \(method) \(url)")
        
        if let headers = request.allHTTPHeaderFields, !headers.isEmpty {
            print("🌐 [API Headers] \(headers)")
        }
        
        guard let body, !body.isEmpty else { return }
        
        if let bodyString = String(data: body, encoding: .utf8) {
            print("🌐 [API Body] \(bodyString)")
        } else {
            print("🌐 [API Body] <\(body.count) bytes binary data>")
        }
    }
    
    private func logResponse(data: Data?, response: URLResponse?, error: Error?) {
        guard isNetworkDebugLoggingEnabled else { return }
        
        if let httpResponse = response as? HTTPURLResponse {
            let url = httpResponse.url?.absoluteString ?? "nil"
            print("🌐 [API Response] \(httpResponse.statusCode) \(url)")
            print("🌐 [API Response Headers] \(httpResponse.allHeaderFields)")
        } else if let response {
            print("🌐 [API Response] \(response)")
        }
        
        if let data, !data.isEmpty {
            if let responseString = String(data: data, encoding: .utf8) {
                print("🌐 [API Response Body] \(responseString)")
            } else {
                print("🌐 [API Response Body] <\(data.count) bytes binary data>")
            }
        }
        
        if let error {
            print("❌ [API Error] \(error.localizedDescription)")
            print("❌ [API Error Details] \(error)")
        }
    }
    
    // MARK: - Recipes
    
    func getRecipes() async throws -> [Recipe] {
        try await request(endpoint: "/api/recipes")
    }
    
    func getRecipe(id: Int) async throws -> Recipe {
        try await request(endpoint: "/api/recipes/\(id)")
    }
    
    func createRecipe(_ recipe: Recipe) async throws -> Recipe {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(recipe)
        return try await request(endpoint: "/api/recipes", method: "POST", body: data)
    }
    
    func updateRecipe(_ recipe: Recipe) async throws -> Recipe {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(recipe)
        return try await request(endpoint: "/api/recipes/\(recipe.id)", method: "PUT", body: data)
    }
    
    func deleteRecipe(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/recipes/\(id)")
    }
    
    // MARK: - Events
    
    func getEvents() async throws -> [Event] {
        try await request(endpoint: "/api/events")
    }
    
    func getEvent(id: Int) async throws -> Event {
        try await request(endpoint: "/api/events/\(id)")
    }
    
    func createEvent(_ event: Event) async throws -> Event {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(event)
        return try await request(endpoint: "/api/events", method: "POST", body: data)
    }
    
    func updateEvent(_ event: Event) async throws -> Event {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(event)
        return try await request(endpoint: "/api/events/\(event.id)", method: "PUT", body: data)
    }
    
    func deleteEvent(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/events/\(id)")
    }
    
    // MARK: - Tools
    
    func getTools() async throws -> [Tool] {
        try await request(endpoint: "/api/tools")
    }
    
    func getTool(id: Int) async throws -> Tool {
        try await request(endpoint: "/api/tools/\(id)")
    }
    
    func createTool(_ tool: Tool) async throws -> Tool {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(tool)
        return try await request(endpoint: "/api/tools", method: "POST", body: data)
    }
    
    func updateTool(_ tool: Tool) async throws -> Tool {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(tool)
        return try await request(endpoint: "/api/tools/\(tool.id)", method: "PUT", body: data)
    }
    
    func deleteTool(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/tools/\(id)")
    }
    
    // MARK: - Storage
    
    func getStorageItems() async throws -> [Storage] {
        try await request(endpoint: "/api/storage")
    }
    
    func getStorageItem(id: Int) async throws -> Storage {
        try await request(endpoint: "/api/storage/\(id)")
    }
    
    func createStorageItem(_ item: Storage) async throws -> Storage {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(item)
        return try await request(endpoint: "/api/storage", method: "POST", body: data)
    }
    
    func updateStorageItem(_ item: Storage) async throws -> Storage {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(item)
        return try await request(endpoint: "/api/storage/\(item.id)", method: "PUT", body: data)
    }
    
    func deleteStorageItem(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/storage/\(id)")
    }
    
    // MARK: - Locations
    
    func getLocations() async throws -> [Location] {
        try await request(endpoint: "/api/locations")
    }
    
    func getLocation(id: Int) async throws -> Location {
        try await request(endpoint: "/api/locations/\(id)")
    }
    
    func createLocation(_ location: Location) async throws -> Location {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(location)
        return try await request(endpoint: "/api/locations", method: "POST", body: data)
    }
    
    func updateLocation(_ location: Location) async throws -> Location {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(location)
        return try await request(endpoint: "/api/locations/\(location.id)", method: "PUT", body: data)
    }
    
    func deleteLocation(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/locations/\(id)")
    }
    
    // MARK: - Guests
    
    func getGuests() async throws -> [Guest] {
        try await request(endpoint: "/api/guests")
    }
    
    func getGuest(id: Int) async throws -> Guest {
        try await request(endpoint: "/api/guests/\(id)")
    }
    
    func createGuest(_ guest: Guest) async throws -> Guest {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(guest)
        return try await request(endpoint: "/api/guests", method: "POST", body: data)
    }
    
    func updateGuest(_ guest: Guest) async throws -> Guest {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(guest)
        return try await request(endpoint: "/api/guests/\(guest.id)", method: "PUT", body: data)
    }
    
    func deleteGuest(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/guests/\(id)")
    }
    
    // MARK: - Shopping Lists
    
    func getShoppingLists() async throws -> [ShoppingList] {
        try await request(endpoint: "/api/shopping-lists")
    }
    
    func getShoppingList(id: Int) async throws -> ShoppingList {
        try await request(endpoint: "/api/shopping-lists/\(id)")
    }
    
    func createShoppingList(_ list: ShoppingList) async throws -> ShoppingList {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(list)
        return try await request(endpoint: "/api/shopping-lists", method: "POST", body: data)
    }
    
    func updateShoppingList(_ list: ShoppingList) async throws -> ShoppingList {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(list)
        return try await request(endpoint: "/api/shopping-lists/\(list.id)", method: "PUT", body: data)
    }
    
    func deleteShoppingList(id: Int) async throws {
        try await requestWithoutResponse(endpoint: "/api/shopping-lists/\(id)")
    }
    
    // MARK: - Image Upload
    
    func uploadImage(_ image: UIImage, type: String, id: Int) async throws -> String {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw URLError(.cannotDecodeContentData)
        }
        
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "\(baseURL)/api/\(type)/\(id)/image")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        logRequest(request, body: nil)
        print("🌐 [API Upload] image/jpeg \(imageData.count) bytes")
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            logResponse(data: data, response: response, error: nil)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw URLError(.badServerResponse)
            }
            
            let result = try JSONDecoder().decode([String: String].self, from: data)
            return result["image_url"] ?? ""
        } catch {
            logResponse(data: nil, response: nil, error: error)
            throw error
        }
    }
}

// Made with Bob
