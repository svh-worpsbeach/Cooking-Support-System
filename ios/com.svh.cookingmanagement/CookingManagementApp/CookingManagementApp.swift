import SwiftUI

@main
struct CookingManagementApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

class AppState: ObservableObject {
    @Published var isDarkMode: Bool = false
    @Published var currentLanguage: String = "de"
    
    init() {
        // Load saved preferences
        if let savedLanguage = UserDefaults.standard.string(forKey: "language") {
            currentLanguage = savedLanguage
        }
        isDarkMode = UserDefaults.standard.bool(forKey: "darkMode")
    }
    
    func setLanguage(_ language: String) {
        currentLanguage = language
        UserDefaults.standard.set(language, forKey: "language")
    }
    
    func toggleDarkMode() {
        isDarkMode.toggle()
        UserDefaults.standard.set(isDarkMode, forKey: "darkMode")
    }
}

// Made with Bob
