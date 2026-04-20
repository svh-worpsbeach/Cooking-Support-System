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
            if let imageUrl = recipe.imageUrl {
                AsyncImage(url: URL(string: imageUrl)) { image in
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
                    if let prepTime = recipe.prepTime {
                        Label("\(prepTime) min", systemImage: "clock")
                            .font(.caption2)
                    }
                    if let servings = recipe.servings {
                        Label("\(servings)", systemImage: "person.2")
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
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: RecipeDetailViewModel
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    @Environment(\.dismiss) private var dismiss
    
    init(recipe: Recipe) {
        _viewModel = StateObject(wrappedValue: RecipeDetailViewModel(recipe: recipe))
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let imageUrl = viewModel.recipe.imageUrl {
                    AsyncImage(url: URL(string: imageUrl)) { image in
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
                        if let prepTime = viewModel.recipe.prepTime {
                            InfoBadge(icon: "clock", text: "\(prepTime) min")
                        }
                        if let cookTime = viewModel.recipe.cookTime {
                            InfoBadge(icon: "flame", text: "\(cookTime) min")
                        }
                        if let servings = viewModel.recipe.servings {
                            InfoBadge(icon: "person.2", text: "\(servings)")
                        }
                    }
                    
                    if !viewModel.recipe.ingredients.isEmpty {
                        Divider()
                        
                        Text("recipes.ingredients".localized(appState.currentLanguage))
                            .font(.headline)
                        
                        ForEach(viewModel.recipe.ingredients, id: \.name) { ingredient in
                            HStack {
                                Text("•")
                                Text("\(ingredient.amount) \(ingredient.unit ?? "") \(ingredient.name)")
                            }
                        }
                    }
                    
                    if !viewModel.recipe.steps.isEmpty {
                        Divider()
                        
                        Text("recipes.steps".localized(appState.currentLanguage))
                            .font(.headline)
                        
                        ForEach(viewModel.recipe.steps.sorted(by: { $0.stepNumber < $1.stepNumber }), id: \.stepNumber) { step in
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Schritt \(step.stepNumber)")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text(step.instruction)
                                if let imageUrl = step.imageUrl {
                                    AsyncImage(url: URL(string: imageUrl)) { image in
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
    @State private var servings: String
    @State private var difficulty: String
    @State private var category: String
    
    init(recipe: Recipe?, onSave: @escaping (Recipe) -> Void) {
        self.recipe = recipe
        self.onSave = onSave
        _name = State(initialValue: recipe?.name ?? "")
        _description = State(initialValue: recipe?.description ?? "")
        _prepTime = State(initialValue: recipe?.prepTime.map(String.init) ?? "")
        _cookTime = State(initialValue: recipe?.cookTime.map(String.init) ?? "")
        _servings = State(initialValue: recipe?.servings.map(String.init) ?? "")
        _difficulty = State(initialValue: recipe?.difficulty ?? "")
        _category = State(initialValue: recipe?.category ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("common.name".localized(appState.currentLanguage), text: $name)
                    TextField("common.description".localized(appState.currentLanguage), text: $description)
                }
                
                Section("recipes.prepTime".localized(appState.currentLanguage)) {
                    TextField("recipes.prepTime".localized(appState.currentLanguage), text: $prepTime)
                        .keyboardType(.numberPad)
                    TextField("recipes.cookTime".localized(appState.currentLanguage), text: $cookTime)
                        .keyboardType(.numberPad)
                    TextField("recipes.servings".localized(appState.currentLanguage), text: $servings)
                        .keyboardType(.numberPad)
                }
                
                Section {
                    TextField("recipes.difficulty".localized(appState.currentLanguage), text: $difficulty)
                    TextField("common.category".localized(appState.currentLanguage), text: $category)
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
            ingredients: recipe?.ingredients ?? [],
            steps: recipe?.steps ?? [],
            prepTime: Int(prepTime),
            cookTime: Int(cookTime),
            servings: Int(servings),
            difficulty: difficulty.isEmpty ? nil : difficulty,
            category: category.isEmpty ? nil : category,
            tags: recipe?.tags ?? [],
            imageUrl: recipe?.imageUrl,
            sourceUrl: recipe?.sourceUrl
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
    
    init(recipe: Recipe) {
        self.recipe = recipe
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
