import SwiftUI

// MARK: - Extended Recipe Form View
struct RecipeFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let recipe: Recipe?
    let onSave: (Recipe) -> Void
    
    @State private var name: String
    @State private var description: String
    @State private var prepTime: String
    @State private var cookTime: String
    @State private var ingredients: [IngredientEdit]
    @State private var steps: [StepEdit]
    @State private var showingAddIngredient = false
    @State private var showingAddStep = false
    @State private var editingIngredient: IngredientEdit?
    @State private var editingStep: StepEdit?
    
    init(recipe: Recipe?, onSave: @escaping (Recipe) -> Void) {
        self.recipe = recipe
        self.onSave = onSave
        _name = State(initialValue: recipe?.name ?? "")
        _description = State(initialValue: recipe?.description ?? "")
        _prepTime = State(initialValue: recipe?.preparationTime ?? "0:00")
        _cookTime = State(initialValue: recipe?.cookingTime ?? "0:00")
        _ingredients = State(initialValue: recipe?.ingredients?.enumerated().map { index, ing in
            IngredientEdit(
                id: ing.id,
                name: ing.name,
                description: ing.description,
                amount: ing.amount,
                unit: ing.unit,
                orderIndex: ing.orderIndex
            )
        } ?? [])
        _steps = State(initialValue: recipe?.steps?.sorted(by: { $0.stepNumber < $1.stepNumber }).enumerated().map { index, step in
            StepEdit(
                id: step.id,
                stepNumber: step.stepNumber,
                content: step.content
            )
        } ?? [])
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
                
                Section {
                    HStack {
                        Text("recipes.ingredients".localized(appState.currentLanguage))
                            .font(.headline)
                        Spacer()
                        Button(action: { showingAddIngredient = true }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if ingredients.isEmpty {
                        Text("empty.ingredients".localized(appState.currentLanguage))
                            .foregroundColor(.secondary)
                            .font(.caption)
                    } else {
                        ForEach(ingredients.indices, id: \.self) { index in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(ingredients[index].name)
                                        .font(.subheadline)
                                    Text("\(formatAmount(ingredients[index].amount)) \(ingredients[index].unit)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                Button(action: { editingIngredient = ingredients[index] }) {
                                    Image(systemName: "pencil")
                                        .foregroundColor(.blue)
                                }
                                Button(action: { ingredients.remove(at: index) }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                        .onMove { from, to in
                            ingredients.move(fromOffsets: from, toOffset: to)
                            updateIngredientOrder()
                        }
                    }
                }
                
                Section {
                    HStack {
                        Text("recipes.steps".localized(appState.currentLanguage))
                            .font(.headline)
                        Spacer()
                        Button(action: { showingAddStep = true }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if steps.isEmpty {
                        Text("empty.steps".localized(appState.currentLanguage))
                            .foregroundColor(.secondary)
                            .font(.caption)
                    } else {
                        ForEach(steps.indices, id: \.self) { index in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Schritt \(steps[index].stepNumber)")
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                    Text(steps[index].content)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .lineLimit(2)
                                }
                                Spacer()
                                Button(action: { editingStep = steps[index] }) {
                                    Image(systemName: "pencil")
                                        .foregroundColor(.blue)
                                }
                                Button(action: { 
                                    steps.remove(at: index)
                                    updateStepNumbers()
                                }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                        .onMove { from, to in
                            steps.move(fromOffsets: from, toOffset: to)
                            updateStepNumbers()
                        }
                    }
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
            .sheet(isPresented: $showingAddIngredient) {
                IngredientFormView(ingredient: nil) { newIngredient in
                    ingredients.append(newIngredient)
                    updateIngredientOrder()
                }
            }
            .sheet(item: $editingIngredient) { ingredient in
                IngredientFormView(ingredient: ingredient) { updatedIngredient in
                    if let index = ingredients.firstIndex(where: { $0.id == updatedIngredient.id }) {
                        ingredients[index] = updatedIngredient
                    }
                }
            }
            .sheet(isPresented: $showingAddStep) {
                StepFormView(step: nil, stepNumber: steps.count + 1) { newStep in
                    steps.append(newStep)
                    updateStepNumbers()
                }
            }
            .sheet(item: $editingStep) { step in
                StepFormView(step: step, stepNumber: step.stepNumber) { updatedStep in
                    if let index = steps.firstIndex(where: { $0.id == updatedStep.id }) {
                        steps[index] = updatedStep
                    }
                }
            }
        }
    }
    
    private func formatAmount(_ amount: Double) -> String {
        if amount.truncatingRemainder(dividingBy: 1) == 0 {
            return String(format: "%.0f", amount)
        } else {
            return String(format: "%.1f", amount)
        }
    }
    
    private func updateIngredientOrder() {
        for (index, _) in ingredients.enumerated() {
            ingredients[index].orderIndex = index
        }
    }
    
    private func updateStepNumbers() {
        for (index, _) in steps.enumerated() {
            steps[index].stepNumber = index + 1
        }
    }
    
    private func saveRecipe() {
        let recipeIngredients = ingredients.map { ing in
            Ingredient(
                id: ing.id,
                recipeId: recipe?.id ?? 0,
                name: ing.name,
                description: ing.description,
                amount: ing.amount,
                unit: ing.unit,
                orderIndex: ing.orderIndex
            )
        }
        
        let recipeSteps = steps.map { step in
            RecipeStep(
                id: step.id,
                recipeId: recipe?.id ?? 0,
                stepNumber: step.stepNumber,
                content: step.content,
                stepImageId: nil,
                createdAt: nil
            )
        }
        
        let newRecipe = Recipe(
            id: recipe?.id ?? 0,
            name: name,
            description: description.isEmpty ? nil : description,
            preparationTime: prepTime.isEmpty ? "0:00" : prepTime,
            cookingTime: cookTime.isEmpty ? "0:00" : cookTime,
            titleImageId: recipe?.titleImageId,
            categories: recipe?.categories,
            ingredients: recipeIngredients.isEmpty ? nil : recipeIngredients,
            steps: recipeSteps.isEmpty ? nil : recipeSteps,
            images: recipe?.images,
            createdAt: recipe?.createdAt,
            updatedAt: recipe?.updatedAt
        )
        onSave(newRecipe)
        dismiss()
    }
}

// MARK: - Supporting Types
struct IngredientEdit: Identifiable {
    let id: Int
    var name: String
    var description: String?
    var amount: Double
    var unit: String
    var orderIndex: Int
}

struct StepEdit: Identifiable {
    let id: Int
    var stepNumber: Int
    var content: String
}

// MARK: - Ingredient Form View
struct IngredientFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let ingredient: IngredientEdit?
    let onSave: (IngredientEdit) -> Void
    
    @State private var name: String
    @State private var description: String
    @State private var amount: String
    @State private var unit: String
    
    init(ingredient: IngredientEdit?, onSave: @escaping (IngredientEdit) -> Void) {
        self.ingredient = ingredient
        self.onSave = onSave
        _name = State(initialValue: ingredient?.name ?? "")
        _description = State(initialValue: ingredient?.description ?? "")
        _amount = State(initialValue: ingredient.map { String(format: "%.1f", $0.amount) } ?? "")
        _unit = State(initialValue: ingredient?.unit ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("common.description".localized(appState.currentLanguage), text: $description)
                TextField("common.quantity".localized(appState.currentLanguage), text: $amount)
                    .keyboardType(.decimalPad)
                TextField("common.unit".localized(appState.currentLanguage), text: $unit)
            }
            .navigationTitle(ingredient == nil ? "ingredients.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newIngredient = IngredientEdit(
                            id: ingredient?.id ?? Int.random(in: 1000...9999),
                            name: name,
                            description: description.isEmpty ? nil : description,
                            amount: Double(amount) ?? 0.0,
                            unit: unit,
                            orderIndex: ingredient?.orderIndex ?? 0
                        )
                        onSave(newIngredient)
                        dismiss()
                    }
                    .disabled(name.isEmpty || amount.isEmpty || unit.isEmpty)
                }
            }
        }
    }
}

// MARK: - Step Form View
struct StepFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let step: StepEdit?
    let stepNumber: Int
    let onSave: (StepEdit) -> Void
    
    @State private var content: String
    
    init(step: StepEdit?, stepNumber: Int, onSave: @escaping (StepEdit) -> Void) {
        self.step = step
        self.stepNumber = stepNumber
        self.onSave = onSave
        _content = State(initialValue: step?.content ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Schritt \(stepNumber)") {
                    TextEditor(text: $content)
                        .frame(minHeight: 150)
                }
            }
            .navigationTitle(step == nil ? "steps.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newStep = StepEdit(
                            id: step?.id ?? Int.random(in: 1000...9999),
                            stepNumber: stepNumber,
                            content: content
                        )
                        onSave(newStep)
                        dismiss()
                    }
                    .disabled(content.isEmpty)
                }
            }
        }
    }
}

// Made with Bob