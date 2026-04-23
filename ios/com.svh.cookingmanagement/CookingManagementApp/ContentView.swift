import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        ZStack {
            // Background layer - always behind everything
            BackgroundImageView(isDarkMode: appState.isDarkMode)
            
            // Content layer - TabView with all tabs
            TabView(selection: $selectedTab) {
            HomeView()
                .background(Color.clear)
                .tabItem {
                    Label("nav.home".localized(appState.currentLanguage), systemImage: "house.fill")
                }
                .tag(0)
            
            RecipesView()
                .background(Color.clear)
                .tabItem {
                    Label("nav.recipes".localized(appState.currentLanguage), systemImage: "book.fill")
                }
                .tag(1)
            
            EventsView()
                .background(Color.clear)
                .tabItem {
                    Label("nav.events".localized(appState.currentLanguage), systemImage: "calendar")
                }
                .tag(2)
            
            ShoppingListsView()
                .background(Color.clear)
                .tabItem {
                    Label("shopping.title".localized(appState.currentLanguage), systemImage: "cart.fill")
                }
                .tag(3)
            
            StorageView()
                .background(Color.clear)
                .tabItem {
                    Label("nav.storage".localized(appState.currentLanguage), systemImage: "archivebox.fill")
                }
                .tag(4)
            
            MoreView()
                .background(Color.clear)
                .tabItem {
                    Label("nav.more".localized(appState.currentLanguage), systemImage: "ellipsis.circle.fill")
                }
                .tag(5)
            }
            .onAppear {
                // Make TabView background transparent
                let appearance = UITabBarAppearance()
                appearance.configureWithTransparentBackground()
                appearance.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.8)
                
                UITabBar.appearance().standardAppearance = appearance
                if #available(iOS 15.0, *) {
                    UITabBar.appearance().scrollEdgeAppearance = appearance
                }
            }
            .preferredColorScheme(appState.isDarkMode ? .dark : .light)
        }
    }
}

// MARK: - Background Image View
struct BackgroundImageView: View {
    let isDarkMode: Bool
    
    var body: some View {
        ZStack {
            // Try to load the image, fallback to color if not found
            if let image = UIImage(named: isDarkMode ? "KitchenDark" : "KitchenLight") {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
                    .opacity(0.3)
            } else {
                // Fallback gradient if image is not found
                LinearGradient(
                    gradient: Gradient(colors: [
                        isDarkMode ? Color(red: 0.1, green: 0.08, blue: 0.06) : Color(red: 0.97, green: 0.97, blue: 0.95),
                        isDarkMode ? Color(red: 0.15, green: 0.12, blue: 0.08) : Color(red: 0.95, green: 0.95, blue: 0.93)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            
            // Subtle overlay for better readability
            Color.black
                .opacity(isDarkMode ? 0.2 : 0.05)
        }
        .ignoresSafeArea()
    }
}

struct MoreView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            List {
                NavigationLink(destination: ToolsView()) {
                    Label("nav.tools".localized(appState.currentLanguage), systemImage: "wrench.fill")
                }
                
                NavigationLink(destination: LocationsView()) {
                    Label("locations.title".localized(appState.currentLanguage), systemImage: "mappin.circle.fill")
                }
                
                NavigationLink(destination: GuestsView()) {
                    Label("guests.title".localized(appState.currentLanguage), systemImage: "person.2.fill")
                }
                
                Section {
                    Button(action: {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Label("settings.title".localized(appState.currentLanguage), systemImage: "gear")
                            Spacer()
                            Image(systemName: "arrow.up.forward.app")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("nav.more".localized(appState.currentLanguage))
        }
    }
}

// Made with Bob
