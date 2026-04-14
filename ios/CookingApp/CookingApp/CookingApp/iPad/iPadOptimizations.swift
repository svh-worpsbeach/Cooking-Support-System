//
//  iPadOptimizations.swift
//  CookingApp
//
//  Created by Bob
//  iPad-specific optimizations and layouts
//

import SwiftUI

// MARK: - iPad Adaptive Layout

struct AdaptiveLayout<Content: View>: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        if horizontalSizeClass == .regular {
            // iPad layout
            content
                .frame(maxWidth: 1200)
        } else {
            // iPhone layout
            content
        }
    }
}

// MARK: - iPad Split View for Recipes

struct iPadRecipesView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = RecipesViewModel()
    @State private var selectedRecipe: Recipe?
    
    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(viewModel.recipes, selection: $selectedRecipe) { recipe in
                NavigationLink(value: recipe) {
                    RecipeCard(recipe: recipe)
                }
            }
            .navigationTitle("nav.recipes".localized(appState.currentLanguage))
            .task {
                await viewModel.loadRecipes()
            }
        } detail: {
            // Detail view
            if let recipe = selectedRecipe {
                RecipeDetailView(recipeId: recipe.id)
            } else {
                EmptyStateView(
                    icon: "book.fill",
                    title: "Wähle ein Rezept",
                    message: "Wähle ein Rezept aus der Liste, um Details anzuzeigen"
                )
            }
        }
    }
}

// MARK: - iPad Grid Layout

struct iPadGridLayout<Item: Identifiable, Content: View>: View {
    let items: [Item]
    let columns: Int
    let content: (Item) -> Content
    
    init(items: [Item], columns: Int = 3, @ViewBuilder content: @escaping (Item) -> Content) {
        self.items = items
        self.columns = columns
        self.content = content
    }
    
    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: columns), spacing: 16) {
            ForEach(items) { item in
                content(item)
            }
        }
        .padding()
    }
}

// MARK: - iPad Keyboard Shortcuts

struct iPadKeyboardShortcuts: ViewModifier {
    func body(content: Content) -> some View {
        content
    }
}

extension View {
    func iPadKeyboardShortcuts() -> some View {
        self.modifier(iPadKeyboardShortcuts())
    }
}

// MARK: - iPad Context Menu

struct iPadContextMenu: ViewModifier {
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onShare: () -> Void
    
    func body(content: Content) -> some View {
        content
            .contextMenu {
                Button(action: onEdit) {
                    Label("Bearbeiten", systemImage: "pencil")
                }
                
                Button(action: onShare) {
                    Label("Teilen", systemImage: "square.and.arrow.up")
                }
                
                Divider()
                
                Button(role: .destructive, action: onDelete) {
                    Label("Löschen", systemImage: "trash")
                }
            }
    }
}

// MARK: - iPad Drag and Drop

struct iPadDragAndDrop<Item: Identifiable & Codable>: ViewModifier {
    let item: Item
    let onDrop: (Item) -> Void
    
    func body(content: Content) -> some View {
        content
            .onDrag {
                let data = try? JSONEncoder().encode(item)
                return NSItemProvider(item: data as? NSSecureCoding, typeIdentifier: "com.cookingapp.item")
            }
            .onDrop(of: ["com.cookingapp.item"], delegate: DropDelegate(onDrop: onDrop))
    }
}

struct DropDelegate<Item: Codable>: SwiftUI.DropDelegate {
    let onDrop: (Item) -> Void
    
    func performDrop(info: DropInfo) -> Bool {
        guard let itemProvider = info.itemProviders(for: ["com.cookingapp.item"]).first else {
            return false
        }
        
        itemProvider.loadItem(forTypeIdentifier: "com.cookingapp.item", options: nil) { data, error in
            guard let data = data as? Data,
                  let item = try? JSONDecoder().decode(Item.self, from: data) else {
                return
            }
            
            DispatchQueue.main.async {
                onDrop(item)
            }
        }
        
        return true
    }
}

// MARK: - iPad Multitasking Support

struct iPadMultitaskingView: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    var isCompact: Bool {
        horizontalSizeClass == .compact || verticalSizeClass == .compact
    }
    
    var body: some View {
        Group {
            if isCompact {
                // Compact layout for Split View or Slide Over
                CompactLayout()
            } else {
                // Full layout
                RegularLayout()
            }
        }
    }
}

struct CompactLayout: View {
    var body: some View {
        VStack {
            Text("Compact Layout")
            Text("Optimiert für Split View")
        }
    }
}

struct RegularLayout: View {
    var body: some View {
        HStack {
            Text("Regular Layout")
            Text("Volle iPad-Ansicht")
        }
    }
}

// MARK: - iPad Pointer Interactions

struct iPadPointerStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .hoverEffect(.lift)
            .contentShape(RoundedRectangle(cornerRadius: 12))
    }
}

extension View {
    func iPadPointerStyle() -> some View {
        modifier(iPadPointerStyle())
    }
}

// MARK: - iPad Toolbar Customization

struct iPadToolbar: ToolbarContent {
    let onNew: () -> Void
    let onSearch: () -> Void
    let onFilter: () -> Void
    let onSettings: () -> Void
    
    var body: some ToolbarContent {
        ToolbarItemGroup(placement: .navigationBarLeading) {
            Button(action: onNew) {
                Label("Neu", systemImage: "plus")
            }
            .keyboardShortcut("n", modifiers: .command)
        }
        
        ToolbarItemGroup(placement: .navigationBarTrailing) {
            Button(action: onSearch) {
                Label("Suchen", systemImage: "magnifyingglass")
            }
            .keyboardShortcut("f", modifiers: .command)
            
            Button(action: onFilter) {
                Label("Filtern", systemImage: "line.3.horizontal.decrease.circle")
            }
            
            Button(action: onSettings) {
                Label("Einstellungen", systemImage: "gear")
            }
            .keyboardShortcut(",", modifiers: .command)
        }
    }
}

// MARK: - iPad Sidebar

struct iPadSidebar: View {
    @Binding var selection: String?
    
    var body: some View {
        List(selection: $selection) {
            Section("Hauptmenü") {
                NavigationLink(value: "home") {
                    Label("Startseite", systemImage: "house.fill")
                }
                NavigationLink(value: "recipes") {
                    Label("Rezepte", systemImage: "book.fill")
                }
                NavigationLink(value: "events") {
                    Label("Events", systemImage: "calendar")
                }
            }
            
            Section("Verwaltung") {
                NavigationLink(value: "tools") {
                    Label("Werkzeuge", systemImage: "wrench.and.screwdriver.fill")
                }
                NavigationLink(value: "storage") {
                    Label("Lager", systemImage: "archivebox.fill")
                }
                NavigationLink(value: "locations") {
                    Label("Standorte", systemImage: "mappin.and.ellipse")
                }
            }
            
            Section("Weitere") {
                NavigationLink(value: "guests") {
                    Label("Gäste", systemImage: "person.2.fill")
                }
                NavigationLink(value: "shopping") {
                    Label("Einkaufslisten", systemImage: "cart.fill")
                }
                NavigationLink(value: "settings") {
                    Label("Einstellungen", systemImage: "gear")
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Cooking App")
    }
}

// MARK: - iPad Window Management

struct iPadWindowGroup: Scene {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Neues Rezept") {
                    // Action
                }
                .keyboardShortcut("n", modifiers: .command)
            }
            
            CommandGroup(after: .sidebar) {
                Button("Sidebar umschalten") {
                    // Action
                }
                .keyboardShortcut("s", modifiers: [.command, .control])
            }
        }
    }
}

// Made with Bob
