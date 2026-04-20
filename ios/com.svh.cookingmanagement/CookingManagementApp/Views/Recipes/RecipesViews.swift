import SwiftUI

// MARK: - Recipes List View
struct RecipesView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = RecipesViewModel()
    @State private var searchText = ""
    @State private var showingAddRecipe = false
    
    var filteredRecipes: [Recipe] {
        if searchText.isEmpty {
            return viewModel.recipes
        }
        return viewModel.recipes.filter { recipe in
            recipe.name.localizedCaseInsensitiveContains(searchText) ||
            recipe.description?.localizedCaseInsensitiveContains(searchText) == true
        }
    }
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if let errorMessage = viewModel.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.orange)
                        Text("common.error".localized(appState.currentLanguage))
                            .font(.headline)
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Retry") {
                            Task {
                                await viewModel.loadRecipes()
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                } else if filteredRecipes.isEmpty {
                    EmptyStateView(
                        icon: "book.fill",
                        message: "empty.recipes".localized(appState.currentLanguage)
                    )
                } else {
                    List(filteredRecipes) { recipe in
                        NavigationLink(destination: RecipeDetailView(recipe: recipe)) {
                            RecipeRow(recipe: recipe)
                        }
                    }
                    .searchable(text: $searchText, prompt: "common.search".localized(appState.currentLanguage))
                    .refreshable {
                        await viewModel.loadRecipes()
                    }
                }
            }
            .navigationTitle("recipes.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddRecipe = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddRecipe) {
                RecipeFormView(recipe: nil) { newRecipe in
                    Task {
                        await viewModel.createRecipe(newRecipe)
                    }
                }
            }
        }
        .task {
            await viewModel.loadRecipes()
        }
    }
}

struct RecipeRow: View {
    let recipe: Recipe
    
    var body: some View {
        HStack {
            // Show first image if available
            if let images = recipe.images, let firstImage = images.first {
                AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(firstImage.filepath)")) { image in
                    image.resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray
                }
                .frame(width: 60, height: 60)
                .cornerRadius(8)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(recipe.name)
                    .font(.headline)
                
                if let description = recipe.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                HStack {
                    if let prepTime = recipe.preparationTime, prepTime != "0:00" {
                        Label(prepTime, systemImage: "clock")
                            .font(.caption2)
                    }
                    if let cookTime = recipe.cookingTime, cookTime != "0:00" {
                        Label(cookTime, systemImage: "flame")
                            .font(.caption2)
                    }
                }
                .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Recipe Detail View
struct RecipeDetailView: View {
    // Helper function to format ingredient amounts
    private func formatAmount(_ amount: Double) -> String {
        if amount.truncatingRemainder(dividingBy: 1) == 0 {
            return String(format: "%.0f", amount)
        } else {
            return String(format: "%.1f", amount)
        }
    }
    
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: RecipeDetailViewModel
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    @Environment(\.dismiss) private var dismiss
    
    init(recipe: Recipe) {
        _viewModel = StateObject(wrappedValue: RecipeDetailViewModel(recipe: recipe))
    }
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Loading...")
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Show first image if available
                        if let images = viewModel.recipe.images, let firstImage = images.first {
                    AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(firstImage.filepath)")) { image in
                        image.resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color.gray
                    }
                    .frame(height: 250)
                    .clipped()
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text(viewModel.recipe.name)
                        .font(.title)
                        .fontWeight(.bold)
                    
                    if let description = viewModel.recipe.description {
                        Text(description)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack(spacing: 20) {
                        if let prepTime = viewModel.recipe.preparationTime, prepTime != "0:00" {
                            InfoBadge(icon: "clock", text: prepTime)
                        }
                        if let cookTime = viewModel.recipe.cookingTime, cookTime != "0:00" {
                            InfoBadge(icon: "flame", text: cookTime)
                        }
                    }
                    
                    if let ingredients = viewModel.recipe.ingredients, !ingredients.isEmpty {
                        Divider()
                        
                        Text("recipes.ingredients".localized(appState.currentLanguage))
                            .font(.headline)
                        
                        ForEach(ingredients.sorted(by: { $0.orderIndex < $1.orderIndex }), id: \.id) { ingredient in
                            HStack {
                                Text("•")
                                Text("\(formatAmount(ingredient.amount)) \(ingredient.unit) \(ingredient.name)")
                            }
                        }
                    }
                    
                    if let steps = viewModel.recipe.steps, !steps.isEmpty {
                        Divider()
                        
                        Text("recipes.steps".localized(appState.currentLanguage))
                            .font(.headline)
                        
                        ForEach(steps.sorted(by: { $0.stepNumber < $1.stepNumber }), id: \.id) { step in
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Schritt \(step.stepNumber)")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text(step.content)
                                if let stepImageId = step.stepImageId,
                                   let images = viewModel.recipe.images,
                                   let stepImage = images.first(where: { $0.id == stepImageId }) {
                                    AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(stepImage.filepath)")) { image in
                                        image.resizable()
                                            .aspectRatio(contentMode: .fit)
                                    } placeholder: {
                                        Color.gray
                                    }
                                    .frame(maxHeight: 200)
                                    .cornerRadius(8)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
                        .padding()
                    }
                }
            }
        }
        .task {
            await viewModel.loadRecipeDetails()
        }
        .navigationBarTitleDisplayMode(.inline)
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
        .sheet(isPresented: $showingEditSheet) {
            RecipeFormView(recipe: viewModel.recipe) { updatedRecipe in
                Task {
                    await viewModel.updateRecipe(updatedRecipe)
                }
            }
        }
        .alert("common.delete".localized(appState.currentLanguage), isPresented: $showingDeleteAlert) {
            Button("common.cancel".localized(appState.currentLanguage), role: .cancel) { }
            Button("common.delete".localized(appState.currentLanguage), role: .destructive) {
                Task {
                    await viewModel.deleteRecipe()
                    dismiss()
                }
            }
        }
    }
}

struct InfoBadge: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
            Text(text)
        }
        .font(.caption)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.secondary.opacity(0.2))
        .cornerRadius(8)
    }
}

// MARK: - Recipe Form View
struct RecipeFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let recipe: Recipe?
    let onSave: (Recipe) -> Void
    
    @State private var name: String
    @State private var description: String
    @State private var prepTime: String
    @State private var cookTime: String
    
    init(recipe: Recipe?, onSave: @escaping (Recipe) -> Void) {
        self.recipe = recipe
        self.onSave = onSave
        _name = State(initialValue: recipe?.name ?? "")
        _description = State(initialValue: recipe?.description ?? "")
        _prepTime = State(initialValue: recipe?.preparationTime ?? "0:00")
        _cookTime = State(initialValue: recipe?.cookingTime ?? "0:00")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("common.name".localized(appState.currentLanguage), text: $name)
                    TextField("common.description".localized(appState.currentLanguage), text: $description)
                }
                
                Section("recipes.times".localized(appState.currentLanguage)) {
                    TextField("recipes.prepTime".localized(appState.currentLanguage), text: $prepTime)
                        .keyboardType(.decimalPad)
                    TextField("recipes.cookTime".localized(appState.currentLanguage), text: $cookTime)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle(recipe == nil ? "recipes.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        saveRecipe()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func saveRecipe() {
        let newRecipe = Recipe(
            id: recipe?.id ?? 0,
            name: name,
            description: description.isEmpty ? nil : description,
            preparationTime: prepTime.isEmpty ? "0:00" : prepTime,
            cookingTime: cookTime.isEmpty ? "0:00" : cookTime,
            titleImageId: recipe?.titleImageId,
            categories: recipe?.categories,
            ingredients: recipe?.ingredients,
            steps: recipe?.steps,
            images: recipe?.images,
            createdAt: recipe?.createdAt,
            updatedAt: recipe?.updatedAt
        )
        onSave(newRecipe)
        dismiss()
    }
}

// MARK: - View Models
@MainActor
class RecipesViewModel: ObservableObject {
    @Published var recipes: [Recipe] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadRecipes() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            recipes = try await APIService.shared.getRecipes()
            print("✅ Loaded \(recipes.count) recipes")
        } catch {
            errorMessage = error.localizedDescription
            print("❌ Error loading recipes: \(error.localizedDescription)")
            // Show empty array on error
            recipes = []
        }
    }
    
    func createRecipe(_ recipe: Recipe) async {
        do {
            let newRecipe = try await APIService.shared.createRecipe(recipe)
            recipes.append(newRecipe)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

@MainActor
class RecipeDetailViewModel: ObservableObject {
    @Published var recipe: Recipe
    @Published var errorMessage: String?
    @Published var isLoading = false
    
    init(recipe: Recipe) {
        self.recipe = recipe
    }
    
    func loadRecipeDetails() async {
        isLoading = true
        do {
            recipe = try await APIService.shared.getRecipe(id: recipe.id)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
    
    func updateRecipe(_ updatedRecipe: Recipe) async {
        do {
            recipe = try await APIService.shared.updateRecipe(updatedRecipe)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteRecipe() async {
        do {
            try await APIService.shared.deleteRecipe(id: recipe.id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let icon: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            Text(message)
                .font(.headline)
                .foregroundColor(.secondary)
        }
    }
}

// Made with Bob
