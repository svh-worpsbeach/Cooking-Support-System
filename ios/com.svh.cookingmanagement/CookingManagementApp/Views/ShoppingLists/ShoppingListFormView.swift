import SwiftUI

// MARK: - Extended Shopping List Form View
struct ShoppingListFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let list: ShoppingList?
    let onSave: (ShoppingList) -> Void
    
    @State private var name: String
    @State private var items: [ShoppingListItemEdit]
    @State private var showingAddItem = false
    @State private var editingItem: ShoppingListItemEdit?
    
    init(list: ShoppingList?, onSave: @escaping (ShoppingList) -> Void) {
        self.list = list
        self.onSave = onSave
        _name = State(initialValue: list?.name ?? "")
        _items = State(initialValue: list?.items.map { item in
            ShoppingListItemEdit(
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                checked: item.checked,
                category: item.category
            )
        } ?? [])
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("common.name".localized(appState.currentLanguage), text: $name)
                }
                
                Section {
                    HStack {
                        Text("shopping.items".localized(appState.currentLanguage))
                            .font(.headline)
                        Spacer()
                        Button(action: { showingAddItem = true }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if items.isEmpty {
                        Text("empty.items".localized(appState.currentLanguage))
                            .foregroundColor(.secondary)
                            .font(.caption)
                    } else {
                        ForEach(items.indices, id: \.self) { index in
                            HStack {
                                Button(action: {
                                    items[index].checked.toggle()
                                }) {
                                    Image(systemName: items[index].checked ? "checkmark.circle.fill" : "circle")
                                        .foregroundColor(items[index].checked ? .green : .secondary)
                                }
                                
                                VStack(alignment: .leading) {
                                    Text(items[index].name)
                                        .font(.subheadline)
                                        .strikethrough(items[index].checked)
                                    if let quantity = items[index].quantity, let unit = items[index].unit {
                                        Text("\(quantity) \(unit)")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    if let category = items[index].category {
                                        Text(category)
                                            .font(.caption2)
                                            .foregroundColor(.blue)
                                    }
                                }
                                
                                Spacer()
                                
                                Button(action: { editingItem = items[index] }) {
                                    Image(systemName: "pencil")
                                        .foregroundColor(.blue)
                                }
                                Button(action: { items.remove(at: index) }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                        .onMove { from, to in
                            items.move(fromOffsets: from, toOffset: to)
                        }
                    }
                }
            }
            .navigationTitle(list == nil ? "shopping.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        saveList()
                    }
                    .disabled(name.isEmpty)
                }
            }
            .sheet(isPresented: $showingAddItem) {
                ShoppingListItemFormView(item: nil) { newItem in
                    items.append(newItem)
                }
            }
            .sheet(item: $editingItem) { item in
                ShoppingListItemFormView(item: item) { updatedItem in
                    if let index = items.firstIndex(where: { $0.id == updatedItem.id }) {
                        items[index] = updatedItem
                    }
                }
            }
        }
    }
    
    private func saveList() {
        let listItems = items.map { item in
            ShoppingListItem(
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                checked: item.checked,
                category: item.category
            )
        }
        
        let newList = ShoppingList(
            id: list?.id ?? 0,
            name: name,
            items: listItems,
            createdAt: list?.createdAt
        )
        onSave(newList)
        dismiss()
    }
}

// MARK: - Supporting Types
struct ShoppingListItemEdit: Identifiable {
    let id: Int
    var name: String
    var quantity: String?
    var unit: String?
    var checked: Bool
    var category: String?
}

// MARK: - Shopping List Item Form View
struct ShoppingListItemFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let item: ShoppingListItemEdit?
    let onSave: (ShoppingListItemEdit) -> Void
    
    @State private var name: String
    @State private var quantity: String
    @State private var unit: String
    @State private var category: String
    @State private var checked: Bool
    
    init(item: ShoppingListItemEdit?, onSave: @escaping (ShoppingListItemEdit) -> Void) {
        self.item = item
        self.onSave = onSave
        _name = State(initialValue: item?.name ?? "")
        _quantity = State(initialValue: item?.quantity ?? "")
        _unit = State(initialValue: item?.unit ?? "")
        _category = State(initialValue: item?.category ?? "")
        _checked = State(initialValue: item?.checked ?? false)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("common.name".localized(appState.currentLanguage), text: $name)
                    TextField("common.quantity".localized(appState.currentLanguage), text: $quantity)
                    TextField("common.unit".localized(appState.currentLanguage), text: $unit)
                    TextField("common.category".localized(appState.currentLanguage), text: $category)
                }
                
                Section {
                    Toggle("shopping.checked".localized(appState.currentLanguage), isOn: $checked)
                }
            }
            .navigationTitle(item == nil ? "items.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newItem = ShoppingListItemEdit(
                            id: item?.id ?? Int.random(in: 1000...9999),
                            name: name,
                            quantity: quantity.isEmpty ? nil : quantity,
                            unit: unit.isEmpty ? nil : unit,
                            checked: checked,
                            category: category.isEmpty ? nil : category
                        )
                        onSave(newItem)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

// Made with Bob