//
//  RecipeFormView.swift
//  CookingApp
//
//  Created by Bob
//

import SwiftUI

struct RecipeFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    let recipe: Recipe?
    let onSave: (RecipeCreate) -> Void
    
    @State private var name = ""
    @State private var description = ""
    @State private var preparationTime = ""
    @State private var cookingTime = ""
    @State private var categories: [String] = []
    @State private var newCategory = ""
    @State private var ingredients: [RecipeIngredientCreate] = []
    @State private var steps: [RecipeStepCreate] = []
    
    init(recipe: Recipe? = nil, onSave: @escaping (RecipeCreate) -> Void) {
        self.recipe = recipe
        self.onSave = onSave
        
        if let recipe = recipe {
            _name = State(initialValue: recipe.name)
            _description = State(initialValue: recipe.description ?? "")
            _preparationTime = State(initialValue: recipe.preparationTime)
            _cookingTime = State(initialValue: recipe.cookingTime)
            _categories = State(initialValue: recipe.categories.map { $0.categoryName })
            _ingredients = State(initialValue: recipe.ingredients.map { ingredient in
                RecipeIngredientCreate(
                    name: ingredient.name,
                    description: ingredient.description,
                    amount: ingredient.amount,
                    unit: ingredient.unit,
                    orderIndex: ingredient.orderIndex
                )
            })
            _steps = State(initialValue: recipe.steps.map { step in
                RecipeStepCreate(
                    stepNumber: step.stepNumber,
                    content: step.content,
                    stepImageId: step.stepImageId
                )
            })
        }
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Grundinformationen")) {
                    TextField("recipes.recipeName".localized(appState.currentLanguage), text: $name)
                    
                    TextField("recipes.description".localized(appState.currentLanguage), text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    
                    TextField("recipes.preparationTime".localized(appState.currentLanguage), text: $preparationTime)
                        .keyboardType(.numbersAndPunctuation)
                    
                    TextField("recipes.cookingTime".localized(appState.currentLanguage), text: $cookingTime)
                        .keyboardType(.numbersAndPunctuation)
                }
                
                Section(header: Text("recipes.categories".localized(appState.currentLanguage))) {
                    ForEach(categories, id: \.self) { category in
                        HStack {
                            Text(category)
                            Spacer()
                            Button(action: {
                                categories.removeAll { $0 == category }
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                    }
                    
                    HStack {
                        TextField("Neue Kategorie", text: $newCategory)
                        Button(action: {
                            if !newCategory.isEmpty {
                                categories.append(newCategory)
                                newCategory = ""
                            }
                        }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                        .disabled(newCategory.isEmpty)
                    }
                }
                
                Section(header: Text("recipes.ingredients".localized(appState.currentLanguage))) {
                    ForEach(ingredients.indices, id: \.self) { index in
                        VStack(alignment: .leading, spacing: 8) {
                            TextField("Zutat", text: $ingredients[index].name)
                            
                            HStack {
                                TextField("Menge", value: $ingredients[index].amount, format: .number)
                                    .keyboardType(.decimalPad)
                                    .frame(width: 80)
                                
                                TextField("Einheit", text: Binding(
                                    get: { ingredients[index].unit ?? "" },
                                    set: { ingredients[index].unit = $0.isEmpty ? nil : $0 }
                                ))
                                .frame(width: 80)
                            }
                            
                            Button(action: {
                                ingredients.remove(at: index)
                            }) {
                                Text("common.remove".localized(appState.currentLanguage))
                                    .foregroundColor(.red)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    Button(action: {
                        ingredients.append(RecipeIngredientCreate(
                            name: "",
                            description: nil,
                            amount: nil,
                            unit: nil,
                            orderIndex: ingredients.count
                        ))
                    }) {
                        Label("recipes.addIngredient".localized(appState.currentLanguage), systemImage: "plus.circle")
                    }
                }
                
                Section(header: Text("recipes.steps".localized(appState.currentLanguage))) {
                    ForEach(steps.indices, id: \.self) { index in
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Schritt \(index + 1)")
                                .font(.headline)
                            
                            TextField("Anleitung", text: $steps[index].content, axis: .vertical)
                                .lineLimit(3...10)
                            
                            Button(action: {
                                steps.remove(at: index)
                            }) {
                                Text("common.remove".localized(appState.currentLanguage))
                                    .foregroundColor(.red)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    Button(action: {
                        steps.append(RecipeStepCreate(
                            stepNumber: steps.count + 1,
                            content: "",
                            stepImageId: nil
                        ))
                    }) {
                        Label("recipes.addStep".localized(appState.currentLanguage), systemImage: "plus.circle")
                    }
                }
            }
            .navigationTitle(recipe == nil ? "recipes.createRecipe".localized(appState.currentLanguage) : "recipes.editRecipe".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("common.cancel".localized(appState.currentLanguage)) {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        saveRecipe()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func saveRecipe() {
        let recipeCreate = RecipeCreate(
            name: name,
            description: description.isEmpty ? nil : description,
            preparationTime: preparationTime.isEmpty ? nil : preparationTime,
            cookingTime: cookingTime.isEmpty ? nil : cookingTime,
            categories: categories.isEmpty ? nil : categories,
            ingredients: ingredients.isEmpty ? nil : ingredients,
            steps: steps.isEmpty ? nil : steps
        )
        
        onSave(recipeCreate)
        dismiss()
    }
}

// Made with Bob
