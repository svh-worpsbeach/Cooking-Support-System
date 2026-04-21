import SwiftUI

// MARK: - Home View with Statistics
struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome Section
                    VStack(spacing: 8) {
                        Text("Cooking Management System")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)
                        
                        Text("home.welcome".localized(appState.currentLanguage))
                            .font(.title3)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top)
                    
                    // Statistics Section
                    if viewModel.isLoading {
                        ProgressView("common.loading".localized(appState.currentLanguage))
                            .padding()
                    } else {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("home.statistics".localized(appState.currentLanguage))
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 16) {
                                StatCard(
                                    title: "nav.recipes".localized(appState.currentLanguage),
                                    count: viewModel.recipesCount,
                                    icon: "book.fill",
                                    color: .blue
                                )
                                
                                StatCard(
                                    title: "nav.events".localized(appState.currentLanguage),
                                    count: viewModel.eventsCount,
                                    icon: "calendar",
                                    color: .purple
                                )
                                
                                StatCard(
                                    title: "nav.tools".localized(appState.currentLanguage),
                                    count: viewModel.toolsCount,
                                    icon: "wrench.fill",
                                    color: .orange
                                )
                                
                                StatCard(
                                    title: "nav.storage".localized(appState.currentLanguage),
                                    count: viewModel.storageCount,
                                    icon: "archivebox.fill",
                                    color: .green
                                )
                                
                                StatCard(
                                    title: "locations.title".localized(appState.currentLanguage),
                                    count: viewModel.locationsCount,
                                    icon: "mappin.circle.fill",
                                    color: .red
                                )
                                
                                StatCard(
                                    title: "guests.title".localized(appState.currentLanguage),
                                    count: viewModel.guestsCount,
                                    icon: "person.2.fill",
                                    color: .pink
                                )
                            }
                            .padding(.horizontal)
                        }
                    }
                    
                    Spacer(minLength: 20)
                }
                .padding(.vertical)
            }
            .navigationTitle("nav.home".localized(appState.currentLanguage))
            .refreshable {
                await viewModel.loadStatistics()
            }
        }
        .task {
            await viewModel.loadStatistics()
        }
    }
}

// MARK: - Stat Card Component
struct StatCard: View {
    let title: String
    let count: Int
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(color)
            
            Text("\(count)")
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(.primary)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.secondary.opacity(0.1))
        )
    }
}

// MARK: - Home View Model
@MainActor
class HomeViewModel: ObservableObject {
    @Published var recipesCount = 0
    @Published var eventsCount = 0
    @Published var toolsCount = 0
    @Published var storageCount = 0
    @Published var locationsCount = 0
    @Published var guestsCount = 0
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadStatistics() async {
        isLoading = true
        defer { isLoading = false }
        
        async let recipes = loadRecipesCount()
        async let events = loadEventsCount()
        async let tools = loadToolsCount()
        async let storage = loadStorageCount()
        async let locations = loadLocationsCount()
        async let guests = loadGuestsCount()
        
        let results = await (recipes, events, tools, storage, locations, guests)
        
        recipesCount = results.0
        eventsCount = results.1
        toolsCount = results.2
        storageCount = results.3
        locationsCount = results.4
        guestsCount = results.5
    }
    
    private func loadRecipesCount() async -> Int {
        do {
            let recipes = try await APIService.shared.getRecipes()
            return recipes.count
        } catch {
            print("Error loading recipes count: \(error)")
            return 0
        }
    }
    
    private func loadEventsCount() async -> Int {
        do {
            let events = try await APIService.shared.getEvents()
            return events.count
        } catch {
            print("Error loading events count: \(error)")
            return 0
        }
    }
    
    private func loadToolsCount() async -> Int {
        do {
            let tools = try await APIService.shared.getTools()
            return tools.count
        } catch {
            print("Error loading tools count: \(error)")
            return 0
        }
    }
    
    private func loadStorageCount() async -> Int {
        do {
            let items = try await APIService.shared.getStorageItems()
            return items.count
        } catch {
            print("Error loading storage count: \(error)")
            return 0
        }
    }
    
    private func loadLocationsCount() async -> Int {
        do {
            let locations = try await APIService.shared.getLocations()
            return locations.count
        } catch {
            print("Error loading locations count: \(error)")
            return 0
        }
    }
    
    private func loadGuestsCount() async -> Int {
        do {
            let guests = try await APIService.shared.getGuests()
            return guests.count
        } catch {
            print("Error loading guests count: \(error)")
            return 0
        }
    }
}

// Made with Bob