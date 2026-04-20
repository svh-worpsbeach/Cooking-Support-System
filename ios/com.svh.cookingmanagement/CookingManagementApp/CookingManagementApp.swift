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
        // Register default values for Settings.bundle
        registerSettingsBundle()
        
        // Load preferences from iOS Settings
        loadSettings()
        
        // Observe changes to settings
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(settingsChanged),
            name: UserDefaults.didChangeNotification,
            object: nil
        )
    }
    
    private func registerSettingsBundle() {
        let defaults: [String: Any] = [
            "apiBaseURL": "http://localhost:5580",
            "isDarkMode": false,
            "appLanguage": "de"
        ]
        UserDefaults.standard.register(defaults: defaults)
    }
    
    @objc private func settingsChanged() {
        loadSettings()
    }
    
    private func loadSettings() {
        // Load from iOS Settings app
        isDarkMode = UserDefaults.standard.bool(forKey: "isDarkMode")
        currentLanguage = UserDefaults.standard.string(forKey: "appLanguage") ?? "de"
    }
    
    func setLanguage(_ language: String) {
        currentLanguage = language
        UserDefaults.standard.set(language, forKey: "appLanguage")
    }
    
    func toggleDarkMode() {
        isDarkMode.toggle()
        UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
    }
}

// Made with Bob
