//
//  AllViews.swift
//  CookingApp
//
//  Created by Bob
//  This file contains placeholder implementations for all remaining views
//

import SwiftUI

// MARK: - Events Views

struct EventsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = EventsViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.events) { event in
                NavigationLink(destination: EventDetailView(eventId: event.id)) {
                    VStack(alignment: .leading) {
                        Text(event.name)
                            .font(.headline)
                        if let date = event.eventDate {
                            Text(date)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("nav.events".localized(appState.currentLanguage))
            .task {
                await viewModel.loadEvents()
            }
        }
    }
}

struct EventDetailView: View {
    let eventId: Int
    @StateObject private var viewModel = EventDetailViewModel()
    
    var body: some View {
        ScrollView {
            if let event = viewModel.event {
                VStack(alignment: .leading, spacing: 16) {
                    Text(event.name)
                        .font(.title)
                    
                    if let description = event.description {
                        Text(description)
                    }
                    
                    if !event.courses.isEmpty {
                        Text("Gänge")
                            .font(.headline)
                        ForEach(event.courses) { course in
                            Text("\(course.courseNumber). \(course.courseName)")
                        }
                    }
                }
                .padding()
            }
        }
        .task {
            await viewModel.loadEvent(id: eventId)
        }
    }
}

@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    
    func loadEvents() async {
        do {
            events = try await APIService.shared.getEvents()
        } catch {
            print("Error loading events: \(error)")
        }
    }
}

@MainActor
class EventDetailViewModel: ObservableObject {
    @Published var event: Event?
    
    func loadEvent(id: Int) async {
        do {
            event = try await APIService.shared.getEvent(id: id)
        } catch {
            print("Error loading event: \(error)")
        }
    }
}

// MARK: - Tools Views

struct ToolsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = ToolsViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.tools) { tool in
                NavigationLink(destination: ToolDetailView(toolId: tool.id)) {
                    HStack {
                        if let imagePath = tool.imagePath {
                            AsyncImage(url: URL(string: APIService.shared.baseURL.replacingOccurrences(of: "/api", with: "") + imagePath)) { image in
                                image.resizable()
                            } placeholder: {
                                Color.gray
                            }
                            .frame(width: 50, height: 50)
                            .cornerRadius(8)
                        }
                        
                        VStack(alignment: .leading) {
                            Text(tool.name)
                                .font(.headline)
                            if let location = tool.location {
                                Text(location.name)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("nav.tools".localized(appState.currentLanguage))
            .task {
                await viewModel.loadTools()
            }
        }
    }
}

struct ToolDetailView: View {
    let toolId: Int
    @StateObject private var viewModel = ToolDetailViewModel()
    
    var body: some View {
        ScrollView {
            if let tool = viewModel.tool {
                VStack(alignment: .leading, spacing: 16) {
                    if let imagePath = tool.imagePath {
                        AsyncImage(url: URL(string: APIService.shared.baseURL.replacingOccurrences(of: "/api", with: "") + imagePath)) { image in
                            image.resizable()
                        } placeholder: {
                            Color.gray
                        }
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 300)
                    }
                    
                    Text(tool.name)
                        .font(.title)
                    
                    if let description = tool.description {
                        Text(description)
                    }
                }
                .padding()
            }
        }
        .task {
            await viewModel.loadTool(id: toolId)
        }
    }
}

@MainActor
class ToolsViewModel: ObservableObject {
    @Published var tools: [CookingTool] = []
    
    func loadTools() async {
        do {
            tools = try await APIService.shared.getTools()
        } catch {
            print("Error loading tools: \(error)")
        }
    }
}

@MainActor
class ToolDetailViewModel: ObservableObject {
    @Published var tool: CookingTool?
    
    func loadTool(id: Int) async {
        do {
            tool = try await APIService.shared.getTool(id: id)
        } catch {
            print("Error loading tool: \(error)")
        }
    }
}

// MARK: - Storage Views

struct StorageView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = StorageViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.items) { item in
                NavigationLink(destination: StorageDetailView(itemId: item.id)) {
                    VStack(alignment: .leading) {
                        Text(item.name)
                            .font(.headline)
                        HStack {
                            Text(item.category)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            if let quantity = item.quantity, let unit = item.unit {
                                Text("• \(String(format: "%.1f", quantity)) \(unit)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("nav.storage".localized(appState.currentLanguage))
            .task {
                await viewModel.loadItems()
            }
        }
    }
}

struct StorageDetailView: View {
    let itemId: Int
    @StateObject private var viewModel = StorageDetailViewModel()
    
    var body: some View {
        ScrollView {
            if let item = viewModel.item {
                VStack(alignment: .leading, spacing: 16) {
                    Text(item.name)
                        .font(.title)
                    
                    Text("Kategorie: \(item.category)")
                    
                    if let quantity = item.quantity, let unit = item.unit {
                        Text("Menge: \(String(format: "%.1f", quantity)) \(unit)")
                    }
                    
                    if let expiryDate = item.expiryDate {
                        Text("Ablaufdatum: \(expiryDate)")
                    }
                }
                .padding()
            }
        }
        .task {
            await viewModel.loadItem(id: itemId)
        }
    }
}

@MainActor
class StorageViewModel: ObservableObject {
    @Published var items: [StorageItem] = []
    
    func loadItems() async {
        do {
            items = try await APIService.shared.getStorageItems()
        } catch {
            print("Error loading storage items: \(error)")
        }
    }
}

@MainActor
class StorageDetailViewModel: ObservableObject {
    @Published var item: StorageItem?
    
    func loadItem(id: Int) async {
        do {
            item = try await APIService.shared.getStorageItem(id: id)
        } catch {
            print("Error loading storage item: \(error)")
        }
    }
}

// MARK: - Locations Views

struct LocationsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = LocationsViewModel()
    
    var body: some View {
        List(viewModel.locations) { location in
            VStack(alignment: .leading) {
                Text(location.name)
                    .font(.headline)
                if let description = location.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("nav.locations".localized(appState.currentLanguage))
        .task {
            await viewModel.loadLocations()
        }
    }
}

@MainActor
class LocationsViewModel: ObservableObject {
    @Published var locations: [Location] = []
    
    func loadLocations() async {
        do {
            locations = try await APIService.shared.getLocations()
        } catch {
            print("Error loading locations: \(error)")
        }
    }
}

// MARK: - Guests Views

struct GuestsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = GuestsViewModel()
    
    var body: some View {
        List(viewModel.guests) { guest in
            NavigationLink(destination: GuestDetailView(guestId: guest.id)) {
                VStack(alignment: .leading) {
                    Text("\(guest.firstName) \(guest.lastName)")
                        .font(.headline)
                    if let email = guest.email {
                        Text(email)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .navigationTitle("nav.guests".localized(appState.currentLanguage))
        .task {
            await viewModel.loadGuests()
        }
    }
}

struct GuestDetailView: View {
    let guestId: Int
    @StateObject private var viewModel = GuestDetailViewModel()
    
    var body: some View {
        ScrollView {
            if let guest = viewModel.guest {
                VStack(alignment: .leading, spacing: 16) {
                    Text("\(guest.firstName) \(guest.lastName)")
                        .font(.title)
                    
                    if let email = guest.email {
                        Text("E-Mail: \(email)")
                    }
                    
                    if let phone = guest.phone {
                        Text("Telefon: \(phone)")
                    }
                    
                    if let intolerances = guest.intolerances {
                        Text("Unverträglichkeiten: \(intolerances)")
                    }
                }
                .padding()
            }
        }
        .task {
            await viewModel.loadGuest(id: guestId)
        }
    }
}

@MainActor
class GuestsViewModel: ObservableObject {
    @Published var guests: [Guest] = []
    
    func loadGuests() async {
        do {
            guests = try await APIService.shared.getGuests()
        } catch {
            print("Error loading guests: \(error)")
        }
    }
}

@MainActor
class GuestDetailViewModel: ObservableObject {
    @Published var guest: Guest?
    
    func loadGuest(id: Int) async {
        do {
            guest = try await APIService.shared.getGuest(id: id)
        } catch {
            print("Error loading guest: \(error)")
        }
    }
}

// MARK: - Shopping Lists Views

struct ShoppingListsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = ShoppingListsViewModel()
    
    var body: some View {
        List(viewModel.lists) { list in
            NavigationLink(destination: ShoppingListDetailView(listId: list.id)) {
                VStack(alignment: .leading) {
                    Text(list.title)
                        .font(.headline)
                    Text("Fällig: \(list.dueDate)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("nav.shoppingLists".localized(appState.currentLanguage))
        .task {
            await viewModel.loadLists()
        }
    }
}

struct ShoppingListDetailView: View {
    let listId: Int
    @StateObject private var viewModel = ShoppingListDetailViewModel()
    
    var body: some View {
        List {
            if let list = viewModel.list, let items = list.items {
                ForEach(items) { item in
                    HStack {
                        Button(action: {
                            Task {
                                await viewModel.toggleItem(listId: listId, itemId: item.id, checked: item.checked == 0)
                            }
                        }) {
                            Image(systemName: item.checked == 1 ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(item.checked == 1 ? .green : .gray)
                        }
                        
                        VStack(alignment: .leading) {
                            Text(item.name)
                                .strikethrough(item.checked == 1)
                            if let amount = item.amount, let unit = item.unit {
                                Text("\(String(format: "%.1f", amount)) \(unit)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle(viewModel.list?.title ?? "")
        .task {
            await viewModel.loadList(id: listId)
        }
    }
}

@MainActor
class ShoppingListsViewModel: ObservableObject {
    @Published var lists: [ShoppingList] = []
    
    func loadLists() async {
        do {
            lists = try await APIService.shared.getShoppingLists()
        } catch {
            print("Error loading shopping lists: \(error)")
        }
    }
}

@MainActor
class ShoppingListDetailViewModel: ObservableObject {
    @Published var list: ShoppingList?
    
    func loadList(id: Int) async {
        do {
            list = try await APIService.shared.getShoppingList(id: id)
        } catch {
            print("Error loading shopping list: \(error)")
        }
    }
    
    func toggleItem(listId: Int, itemId: Int, checked: Bool) async {
        do {
            _ = try await APIService.shared.updateShoppingListItem(listId: listId, itemId: itemId, checked: checked)
            await loadList(id: listId)
        } catch {
            print("Error updating item: \(error)")
        }
    }
}

// MARK: - Settings View

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var apiURL = ""
    
    var body: some View {
        Form {
            Section(header: Text("settings.language".localized(appState.currentLanguage))) {
                Picker("Sprache", selection: $appState.currentLanguage) {
                    Text("Deutsch").tag("de")
                    Text("English").tag("en")
                }
            }
            
            Section(header: Text("settings.darkMode".localized(appState.currentLanguage))) {
                Toggle("Dark Mode", isOn: $appState.isDarkMode)
            }
            
            Section(header: Text("settings.apiURL".localized(appState.currentLanguage))) {
                TextField("API URL", text: $apiURL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                
                Button("common.save".localized(appState.currentLanguage)) {
                    APIService.shared.updateBaseURL(apiURL)
                }
            }
            
            Section(header: Text("settings.about".localized(appState.currentLanguage))) {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Made with")
                    Spacer()
                    Text("❤️ and Bob")
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("nav.settings".localized(appState.currentLanguage))
        .onAppear {
            apiURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8000/api"
        }
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text(title)
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// Made with Bob
