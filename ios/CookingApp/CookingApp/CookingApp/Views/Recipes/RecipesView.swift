//
//  RecipesView.swift
//  CookingApp
//
//  Created by Bob
//

import SwiftUI

struct RecipesView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = RecipesViewModel()
    @State private var searchText = ""
    @State private var showingCreateSheet = false
    
    var filteredRecipes: [Recipe] {
        if searchText.isEmpty {
            return viewModel.recipes
        }
        return viewModel.recipes.filter { recipe in
            recipe.name.localizedCaseInsensitiveContains(searchText) ||
            (recipe.description?.localizedCaseInsensitiveContains(searchText) ?? false)
        }
    }
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if filteredRecipes.isEmpty {
                    EmptyStateView(
                        icon: "book.fill",
                        title: "recipes.noRecipes".localized(appState.currentLanguage),
                        message: "Erstelle dein erstes Rezept"
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredRecipes) { recipe in
                                NavigationLink(destination: RecipeDetailView(recipeId: recipe.id)) {
                                    RecipeCard(recipe: recipe)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("nav.recipes".localized(appState.currentLanguage))
            .searchable(text: $searchText, prompt: "recipes.searchPlaceholder".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateSheet = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateSheet) {
                RecipeFormView(onSave: { recipe in
                    Task {
                        await viewModel.createRecipe(recipe)
                        showingCreateSheet = false
                    }
                })
            }
            .task {
                await viewModel.loadRecipes()
            }
            .refreshable {
                await viewModel.loadRecipes()
            }
        }
    }
}

// MARK: - Recipe Card
struct RecipeCard: View {
    let recipe: Recipe
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Image placeholder or actual image
            if let titleImageId = recipe.titleImageId,
               let image = recipe.images.first(where: { $0.id == titleImageId }) {
                AsyncImage(url: URL(string: APIService.shared.baseURL.replacingOccurrences(of: "/api", with: "") + image.filepath)) { phase in
                    switch phase {
                    case .empty:
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 200)
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 200)
                            .clipped()
                    case .failure:
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 200)
                            .overlay(
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundColor(.gray)
                            )
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 200)
                    .overlay(
                        Image(systemName: "book.fill")
                            .font(.largeTitle)
                            .foregroundColor(.gray)
                    )
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text(recipe.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if let description = recipe.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                HStack {
                    if !recipe.preparationTime.isEmpty {
                        Label(recipe.preparationTime, systemImage: "clock")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    if !recipe.cookingTime.isEmpty {
                        Label(recipe.cookingTime, systemImage: "flame")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                if !recipe.categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(recipe.categories) { category in
                                Text(category.categoryName)
                                    .font(.caption)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.2))
                                    .foregroundColor(.blue)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color(uiColor: .secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - View Model
@MainActor
class RecipesViewModel: ObservableObject {
    @Published var recipes: [Recipe] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadRecipes() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            recipes = try await APIService.shared.getRecipes()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func createRecipe(_ recipe: RecipeCreate) async {
        do {
            let newRecipe = try await APIService.shared.createRecipe(recipe)
            recipes.append(newRecipe)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteRecipe(_ recipe: Recipe) async {
        do {
            try await APIService.shared.deleteRecipe(id: recipe.id)
            recipes.removeAll { $0.id == recipe.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    RecipesView()
        .environmentObject(AppState())
}

// Made with Bob
