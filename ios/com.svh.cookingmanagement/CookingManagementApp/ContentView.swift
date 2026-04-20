import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            RecipesView()
                .tabItem {
                    Label("nav.recipes".localized(appState.currentLanguage), systemImage: "book.fill")
                }
                .tag(0)
            
            EventsView()
                .tabItem {
                    Label("nav.events".localized(appState.currentLanguage), systemImage: "calendar")
                }
                .tag(1)
            
            ShoppingListsView()
                .tabItem {
                    Label("shopping.title".localized(appState.currentLanguage), systemImage: "cart.fill")
                }
                .tag(2)
            
            StorageView()
                .tabItem {
                    Label("nav.storage".localized(appState.currentLanguage), systemImage: "archivebox.fill")
                }
                .tag(3)
            
            MoreView()
                .tabItem {
                    Label("nav.more".localized(appState.currentLanguage), systemImage: "ellipsis.circle.fill")
                }
                .tag(4)
        }
        .preferredColorScheme(appState.isDarkMode ? .dark : .light)
    }
}

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Cooking Management System")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding()
                    
                    Text("Willkommen in Ihrer Kochverwaltung")
                        .font(.title3)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("nav.home".localized(appState.currentLanguage))
        }
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
