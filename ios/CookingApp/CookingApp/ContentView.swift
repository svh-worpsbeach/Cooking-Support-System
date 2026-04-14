//
//  ContentView.swift
//  CookingApp
//
//  Created by Bob
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("nav.home".localized(appState.currentLanguage), systemImage: "house.fill")
                }
                .tag(0)
            
            RecipesView()
                .tabItem {
                    Label("nav.recipes".localized(appState.currentLanguage), systemImage: "book.fill")
                }
                .tag(1)
            
            EventsView()
                .tabItem {
                    Label("nav.events".localized(appState.currentLanguage), systemImage: "calendar")
                }
                .tag(2)
            
            ToolsView()
                .tabItem {
                    Label("nav.tools".localized(appState.currentLanguage), systemImage: "wrench.and.screwdriver.fill")
                }
                .tag(3)
            
            StorageView()
                .tabItem {
                    Label("nav.storage".localized(appState.currentLanguage), systemImage: "archivebox.fill")
                }
                .tag(4)
            
            MoreView()
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle.fill")
                }
                .tag(5)
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Welcome Section
                    VStack(alignment: .leading, spacing: 8) {
                        Text("common.appName".localized(appState.currentLanguage))
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Willkommen in deinem Kochmanagement-System")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    
                    // Quick Actions
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        QuickActionCard(
                            title: "nav.recipes".localized(appState.currentLanguage),
                            icon: "book.fill",
                            color: .blue
                        )
                        
                        QuickActionCard(
                            title: "nav.events".localized(appState.currentLanguage),
                            icon: "calendar",
                            color: .green
                        )
                        
                        QuickActionCard(
                            title: "nav.shoppingLists".localized(appState.currentLanguage),
                            icon: "cart.fill",
                            color: .orange
                        )
                        
                        QuickActionCard(
                            title: "nav.tools".localized(appState.currentLanguage),
                            icon: "wrench.and.screwdriver.fill",
                            color: .purple
                        )
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .navigationTitle("nav.home".localized(appState.currentLanguage))
        }
    }
}

struct QuickActionCard: View {
    let title: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(color)
            
            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 120)
        .background(Color(uiColor: .secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - More View
struct MoreView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    NavigationLink(destination: LocationsView()) {
                        Label("nav.locations".localized(appState.currentLanguage), systemImage: "mappin.and.ellipse")
                    }
                    
                    NavigationLink(destination: GuestsView()) {
                        Label("nav.guests".localized(appState.currentLanguage), systemImage: "person.2.fill")
                    }
                    
                    NavigationLink(destination: ShoppingListsView()) {
                        Label("nav.shoppingLists".localized(appState.currentLanguage), systemImage: "cart.fill")
                    }
                }
                
                Section {
                    NavigationLink(destination: SettingsView()) {
                        Label("nav.settings".localized(appState.currentLanguage), systemImage: "gear")
                    }
                }
            }
            .navigationTitle("More")
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}

// Made with Bob
