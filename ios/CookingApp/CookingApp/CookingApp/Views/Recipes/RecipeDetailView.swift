//
//  RecipeDetailView.swift
//  CookingApp
//
//  Created by Bob
//

import SwiftUI

struct RecipeDetailView: View {
    @EnvironmentObject var appState: AppState
    let recipeId: Int
    
    @StateObject private var viewModel = RecipeDetailViewModel()
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        ScrollView {
            if let recipe = viewModel.recipe {
                VStack(alignment: .leading, spacing: 20) {
                    // Title Image
                    if let titleImageId = recipe.titleImageId,
                       let image = recipe.images.first(where: { $0.id == titleImageId }) {
                        AsyncImage(url: URL(string: APIService.shared.baseURL.replacingOccurrences(of: "/api", with: "") + image.filepath)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 300)
                                    .clipped()
                            default:
                                Rectangle()
                                    .fill(Color.gray.opacity(0.3))
                                    .frame(height: 300)
                            }
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 16) {
                        // Description
                        if let description = recipe.description {
                            Text(description)
                                .font(.body)
                        }
                        
                        // Times
                        HStack(spacing: 20) {
                            if !recipe.preparationTime.isEmpty {
                                VStack(alignment: .leading) {
                                    Text("recipes.preparationTime".localized(appState.currentLanguage))
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text(recipe.preparationTime)
                                        .font(.headline)
                                }
                            }
                            
                            if !recipe.cookingTime.isEmpty {
                                VStack(alignment: .leading) {
                                    Text("recipes.cookingTime".localized(appState.currentLanguage))
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text(recipe.cookingTime)
                                        .font(.headline)
                                }
                            }
                        }
                        
                        // Categories
                        if !recipe.categories.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("recipes.categories".localized(appState.currentLanguage))
                                    .font(.headline)
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(recipe.categories) { category in
                                            Text(category.categoryName)
                                                .font(.subheadline)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 6)
                                                .background(Color.blue.opacity(0.2))
                                                .foregroundColor(.blue)
                                                .cornerRadius(16)
                                        }
                                    }
                                }
                            }
                        }
                        
                        Divider()
                        
                        // Ingredients
                        VStack(alignment: .leading, spacing: 12) {
                            Text("recipes.ingredients".localized(appState.currentLanguage))
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            ForEach(recipe.ingredients.sorted(by: { $0.orderIndex < $1.orderIndex })) { ingredient in
                                HStack(alignment: .top) {
                                    Image(systemName: "circle.fill")
                                        .font(.system(size: 6))
                                        .foregroundColor(.blue)
                                        .padding(.top, 6)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            if let amount = ingredient.amount {
                                                Text("\(String(format: "%.1f", amount))")
                                                    .fontWeight(.semibold)
                                            }
                                            if let unit = ingredient.unit {
                                                Text(unit)
                                                    .foregroundColor(.secondary)
                                            }
                                            Text(ingredient.name)
                                        }
                                        
                                        if let description = ingredient.description {
                                            Text(description)
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                }
                            }
                        }
                        
                        Divider()
                        
                        // Steps
                        VStack(alignment: .leading, spacing: 16) {
                            Text("recipes.steps".localized(appState.currentLanguage))
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            ForEach(recipe.steps.sorted(by: { $0.stepNumber < $1.stepNumber })) { step in
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text("\(step.stepNumber)")
                                            .font(.title3)
                                            .fontWeight(.bold)
                                            .foregroundColor(.white)
                                            .frame(width: 32, height: 32)
                                            .background(Color.blue)
                                            .clipShape(Circle())
                                        
                                        Text("Schritt \(step.stepNumber)")
                                            .font(.headline)
                                    }
                                    
                                    Text(step.content)
                                        .font(.body)
                                    
                                    if let stepImage = step.stepImage {
                                        AsyncImage(url: URL(string: APIService.shared.baseURL.replacingOccurrences(of: "/api", with: "") + stepImage.filepath)) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .aspectRatio(contentMode: .fill)
                                                    .frame(height: 200)
                                                    .clipped()
                                                    .cornerRadius(8)
                                            default:
                                                EmptyView()
                                            }
                                        }
                                    }
                                }
                                .padding()
                                .background(Color(uiColor: .secondarySystemBackground))
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                }
            } else if viewModel.isLoading {
                ProgressView("common.loading".localized(appState.currentLanguage))
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle(viewModel.recipe?.name ?? "")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button(action: { showingEditSheet = true }) {
                        Label("common.edit".localized(appState.currentLanguage), systemImage: "pencil")
                    }
                    
                    Button(role: .destructive, action: { showingDeleteAlert = true }) {
                        Label("common.delete".localized(appState.currentLanguage), systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .task {
            await viewModel.loadRecipe(id: recipeId)
        }
        .alert("common.delete".localized(appState.currentLanguage), isPresented: $showingDeleteAlert) {
            Button("common.cancel".localized(appState.currentLanguage), role: .cancel) { }
            Button("common.delete".localized(appState.currentLanguage), role: .destructive) {
                Task {
                    await viewModel.deleteRecipe()
                }
            }
        } message: {
            Text("Möchtest du dieses Rezept wirklich löschen?")
        }
    }
}

// MARK: - View Model
@MainActor
class RecipeDetailViewModel: ObservableObject {
    @Published var recipe: Recipe?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadRecipe(id: Int) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            recipe = try await APIService.shared.getRecipe(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteRecipe() async {
        guard let recipe = recipe else { return }
        
        do {
            try await APIService.shared.deleteRecipe(id: recipe.id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// Made with Bob
