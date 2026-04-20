import SwiftUI

// MARK: - Events Views
struct EventsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = EventsViewModel()
    @State private var showingAddEvent = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if viewModel.events.isEmpty {
                    EmptyStateView(icon: "calendar", message: "empty.events".localized(appState.currentLanguage))
                } else {
                    List(viewModel.events) { event in
                        NavigationLink(destination: EventDetailView(event: event)) {
                            VStack(alignment: .leading) {
                                Text(event.name).font(.headline)
                                if let eventDate = event.eventDate {
                                    Text(eventDate.toGermanDateTime()).font(.caption).foregroundColor(.secondary)
                                }
                                if let theme = event.theme {
                                    Text(theme).font(.caption2).foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("events.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddEvent = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddEvent) {
                EventFormView(event: nil) { newEvent in
                    Task { await viewModel.createEvent(newEvent) }
                }
            }
        }
        .task {
            await viewModel.loadEvents()
        }
    }
}

struct EventDetailView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: EventDetailViewModel
    
    init(event: Event) {
        _viewModel = StateObject(wrappedValue: EventDetailViewModel(event: event))
    }
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Loading...")
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(viewModel.event.name).font(.title).fontWeight(.bold)
                
                        if let description = viewModel.event.description {
                            Text(description).foregroundColor(.secondary)
                        }
                        
                        if let theme = viewModel.event.theme {
                            HStack {
                                Label(theme, systemImage: "sparkles")
                            }
                        }
                        
                        if let eventDate = viewModel.event.eventDate {
                            HStack {
                                Label(eventDate.toGermanDateTime(), systemImage: "calendar")
                            }
                        }
                        
                        if let participants = viewModel.event.participants, !participants.isEmpty {
                            Divider()
                            Text("Teilnehmer (\(participants.count))")
                                .font(.headline)
                            ForEach(participants, id: \.id) { participant in
                                VStack(alignment: .leading) {
                                    Text(participant.name)
                                    if let dietary = participant.dietaryRestrictions {
                                        Text(dietary)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .padding(.vertical, 2)
                            }
                        }
                        
                        if let courses = viewModel.event.courses, !courses.isEmpty {
                            Divider()
                            Text("Gänge (\(courses.count))")
                                .font(.headline)
                            ForEach(courses.sorted(by: { $0.courseNumber < $1.courseNumber }), id: \.id) { course in
                                VStack(alignment: .leading) {
                                    Text("\(course.courseNumber). \(course.courseName)")
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .task {
            await viewModel.loadEventDetails()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

@MainActor
class EventDetailViewModel: ObservableObject {
    @Published var event: Event
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    init(event: Event) {
        self.event = event
    }
    
    func loadEventDetails() async {
        isLoading = true
        do {
            event = try await APIService.shared.getEvent(id: event.id)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct EventFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let event: Event?
    let onSave: (Event) -> Void
    @State private var name: String
    @State private var description: String
    @State private var date: Date
    
    init(event: Event?, onSave: @escaping (Event) -> Void) {
        self.event = event
        self.onSave = onSave
        _name = State(initialValue: event?.name ?? "")
        _description = State(initialValue: event?.description ?? "")
        _date = State(initialValue: Date())
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("common.description".localized(appState.currentLanguage), text: $description)
                DatePicker("common.date".localized(appState.currentLanguage), selection: $date, displayedComponents: .date)
            }
            .navigationTitle(event == nil ? "events.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let formatter = ISO8601DateFormatter()
                        let newEvent = Event(
                            id: event?.id ?? 0,
                            name: name,
                            description: description.isEmpty ? nil : description,
                            theme: nil,
                            eventDate: formatter.string(from: date),
                            participants: event?.participants,
                            courses: event?.courses,
                            shoppingList: event?.shoppingList,
                            createdAt: event?.createdAt,
                            updatedAt: event?.updatedAt
                        )
                        onSave(newEvent)
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false
    
    func loadEvents() async {
        isLoading = true
        defer { isLoading = false }
        do {
            events = try await APIService.shared.getEvents()
        } catch {}
    }
    
    func createEvent(_ event: Event) async {
        do {
            let newEvent = try await APIService.shared.createEvent(event)
            events.append(newEvent)
        } catch {}
    }
}

// MARK: - Tools Views
struct ToolsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = ToolsViewModel()
    @State private var showingAddTool = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if viewModel.tools.isEmpty {
                    EmptyStateView(icon: "wrench.fill", message: "empty.tools".localized(appState.currentLanguage))
                } else {
                    List(viewModel.tools) { tool in
                        NavigationLink(destination: ToolDetailView(tool: tool)) {
                            VStack(alignment: .leading) {
                                Text(tool.name).font(.headline)
                                if let description = tool.description {
                                    Text(description).font(.caption).foregroundColor(.secondary)
                                }
                                Text("Menge: \(tool.quantity)").font(.caption2)
                            }
                        }
                    }
                }
            }
            .navigationTitle("tools.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTool = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTool) {
                ToolFormView(tool: nil) { newTool in
                    Task { await viewModel.createTool(newTool) }
                }
            }
        }
        .task {
            await viewModel.loadTools()
        }
    }
}

struct ToolDetailView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: ToolDetailViewModel
    
    init(tool: Tool) {
        _viewModel = StateObject(wrappedValue: ToolDetailViewModel(tool: tool))
    }
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("common.loading".localized(appState.currentLanguage))
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if let imageUrl = viewModel.tool.imageUrl {
                            AsyncImage(url: URL(string: imageUrl)) { image in
                                image.resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Color.gray
                            }
                            .frame(height: 200)
                            .clipped()
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text(viewModel.tool.name)
                                .font(.title)
                                .fontWeight(.bold)
                            
                            if let description = viewModel.tool.description {
                                Text(description)
                                    .foregroundColor(.secondary)
                            }
                            
                            HStack {
                                Label("Menge: \(viewModel.tool.quantity)", systemImage: "number")
                            }
                            
                            if let location = viewModel.tool.location {
                                Divider()
                                Text("Standort: \(location.name)")
                                    .font(.subheadline)
                            }
                        }
                        .padding()
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadToolDetails()
        }
    }
}

@MainActor
class ToolDetailViewModel: ObservableObject {
    @Published var tool: Tool
    @Published var isLoading = false
    
    init(tool: Tool) {
        self.tool = tool
    }
    
    func loadToolDetails() async {
        isLoading = true
        do {
            tool = try await APIService.shared.getTool(id: tool.id)
        } catch {
            print("Error loading tool details: \(error)")
        }
        isLoading = false
    }
}

struct ToolFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let tool: Tool?
    let onSave: (Tool) -> Void
    @State private var name: String
    @State private var description: String
    @State private var quantity: String
    
    init(tool: Tool?, onSave: @escaping (Tool) -> Void) {
        self.tool = tool
        self.onSave = onSave
        _name = State(initialValue: tool?.name ?? "")
        _description = State(initialValue: tool?.description ?? "")
        _quantity = State(initialValue: tool.map { String($0.quantity) } ?? "1")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("common.description".localized(appState.currentLanguage), text: $description)
                TextField("common.quantity".localized(appState.currentLanguage), text: $quantity)
                    .keyboardType(.numberPad)
            }
            .navigationTitle(tool == nil ? "tools.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newTool = Tool(
                            id: tool?.id ?? 0,
                            name: name,
                            description: description.isEmpty ? nil : description,
                            quantity: Int(quantity) ?? 1,
                            locationId: tool?.locationId,
                            location: tool?.location,
                            imageUrl: tool?.imageUrl
                        )
                        onSave(newTool)
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
class ToolsViewModel: ObservableObject {
    @Published var tools: [Tool] = []
    @Published var isLoading = false
    
    func loadTools() async {
        isLoading = true
        defer { isLoading = false }
        do {
            tools = try await APIService.shared.getTools()
        } catch {}
    }
    
    func createTool(_ tool: Tool) async {
        do {
            let newTool = try await APIService.shared.createTool(tool)
            tools.append(newTool)
        } catch {}
    }
}

// MARK: - Storage Views
struct StorageView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = StorageViewModel()
    @State private var showingAddItem = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if viewModel.items.isEmpty {
                    EmptyStateView(icon: "archivebox.fill", message: "empty.storage".localized(appState.currentLanguage))
                } else {
                    List(viewModel.items) { item in
                        NavigationLink(destination: StorageDetailView(item: item)) {
                            VStack(alignment: .leading) {
                                Text(item.name).font(.headline)
                                if let quantity = item.quantity, let unit = item.unit {
                                    Text("\(quantity) \(unit)").font(.caption).foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("storage.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddItem = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddItem) {
                StorageFormView(item: nil) { newItem in
                    Task { await viewModel.createItem(newItem) }
                }
            }
        }
        .task {
            await viewModel.loadItems()
        }
    }
}

struct StorageDetailView: View {
    @EnvironmentObject var appState: AppState
    let item: Storage
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(item.name)
                    .font(.title)
                    .fontWeight(.bold)
                
                if let description = item.description {
                    Text(description)
                        .foregroundColor(.secondary)
                }
                
                if let quantity = item.quantity, let unit = item.unit {
                    HStack {
                        Label("\(quantity) \(unit)", systemImage: "scalemass")
                    }
                }
                
                if let category = item.category {
                    HStack {
                        Label(category, systemImage: "tag")
                    }
                }
                
                if let expiryDate = item.expiryDate {
                    HStack {
                        Label(expiryDate, systemImage: "calendar")
                    }
                }
                
                if let location = item.location {
                    Divider()
                    Text("Standort: \(location.name)")
                        .font(.subheadline)
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct StorageFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let item: Storage?
    let onSave: (Storage) -> Void
    @State private var name: String
    @State private var quantity: String
    @State private var unit: String
    
    init(item: Storage?, onSave: @escaping (Storage) -> Void) {
        self.item = item
        self.onSave = onSave
        _name = State(initialValue: item?.name ?? "")
        _quantity = State(initialValue: item?.quantity ?? "")
        _unit = State(initialValue: item?.unit ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("common.quantity".localized(appState.currentLanguage), text: $quantity)
                TextField("common.unit".localized(appState.currentLanguage), text: $unit)
            }
            .navigationTitle(item == nil ? "storage.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newItem = Storage(
                            id: item?.id ?? 0,
                            name: name,
                            description: item?.description,
                            quantity: quantity.isEmpty ? nil : quantity,
                            unit: unit.isEmpty ? nil : unit,
                            expiryDate: item?.expiryDate,
                            locationId: item?.locationId,
                            location: item?.location,
                            category: item?.category
                        )
                        onSave(newItem)
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
class StorageViewModel: ObservableObject {
    @Published var items: [Storage] = []
    @Published var isLoading = false
    
    func loadItems() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await APIService.shared.getStorageItems()
        } catch {}
    }
    
    func createItem(_ item: Storage) async {
        do {
            let newItem = try await APIService.shared.createStorageItem(item)
            items.append(newItem)
        } catch {}
    }
}

// MARK: - Locations Views
struct LocationsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = LocationsViewModel()
    @State private var showingAddLocation = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if viewModel.locations.isEmpty {
                    EmptyStateView(icon: "mappin.circle.fill", message: "empty.locations".localized(appState.currentLanguage))
                } else {
                    List(viewModel.locations) { location in
                        NavigationLink(destination: LocationDetailView(location: location)) {
                            VStack(alignment: .leading) {
                                Text(location.name).font(.headline)
                                if let description = location.description {
                                    Text(description).font(.caption).foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("locations.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddLocation = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddLocation) {
                LocationFormView(location: nil) { newLocation in
                    Task { await viewModel.createLocation(newLocation) }
                }
            }
        }
        .task {
            await viewModel.loadLocations()
        }
    }
}

struct LocationDetailView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: LocationDetailViewModel
    
    init(location: Location) {
        _viewModel = StateObject(wrappedValue: LocationDetailViewModel(location: location))
    }
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("common.loading".localized(appState.currentLanguage))
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if let imagePath = viewModel.location.imagePath {
                            AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(imagePath)")) { image in
                                image.resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Color.gray
                            }
                            .frame(height: 200)
                            .clipped()
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text(viewModel.location.name)
                                .font(.title)
                                .fontWeight(.bold)
                            
                            if let description = viewModel.location.description {
                                Text(description)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadLocationDetails()
        }
    }
}

@MainActor
class LocationDetailViewModel: ObservableObject {
    @Published var location: Location
    @Published var isLoading = false
    
    init(location: Location) {
        self.location = location
    }
    
    func loadLocationDetails() async {
        isLoading = true
        do {
            location = try await APIService.shared.getLocation(id: location.id)
        } catch {
            print("Error loading location details: \(error)")
        }
        isLoading = false
    }
}

struct LocationFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let location: Location?
    let onSave: (Location) -> Void
    @State private var name: String
    @State private var description: String
    
    init(location: Location?, onSave: @escaping (Location) -> Void) {
        self.location = location
        self.onSave = onSave
        _name = State(initialValue: location?.name ?? "")
        _description = State(initialValue: location?.description ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("common.description".localized(appState.currentLanguage), text: $description)
            }
            .navigationTitle(location == nil ? "locations.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newLocation = Location(
                            id: location?.id ?? 0,
                            name: name,
                            description: description.isEmpty ? nil : description,
                            imagePath: location?.imagePath,
                            createdAt: location?.createdAt,
                            updatedAt: location?.updatedAt
                        )
                        onSave(newLocation)
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
class LocationsViewModel: ObservableObject {
    @Published var locations: [Location] = []
    @Published var isLoading = false
    
    func loadLocations() async {
        isLoading = true
        defer { isLoading = false }
        do {
            locations = try await APIService.shared.getLocations()
        } catch {}
    }
    
    func createLocation(_ location: Location) async {
        do {
            let newLocation = try await APIService.shared.createLocation(location)
            locations.append(newLocation)
        } catch {}
    }
}

// MARK: - Guests Views
struct GuestsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = GuestsViewModel()
    @State private var showingAddGuest = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("common.loading".localized(appState.currentLanguage))
                } else if viewModel.guests.isEmpty {
                    EmptyStateView(icon: "person.2.fill", message: "empty.guests".localized(appState.currentLanguage))
                } else {
                    List(viewModel.guests) { guest in
                        NavigationLink(destination: GuestDetailView(guest: guest)) {
                            HStack {
                                if let imagePath = guest.imagePath {
                                    AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(imagePath)")) { image in
                                        image.resizable()
                                            .aspectRatio(contentMode: .fill)
                                    } placeholder: {
                                        Color.gray
                                    }
                                    .frame(width: 50, height: 50)
                                    .cornerRadius(25)
                                }
                                
                                VStack(alignment: .leading) {
                                    Text(guest.fullName).font(.headline)
                                    if let email = guest.email {
                                        Text(email).font(.caption).foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("guests.title".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddGuest = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddGuest) {
                GuestFormView(guest: nil) { newGuest in
                    Task { await viewModel.createGuest(newGuest) }
                }
            }
        }
        .task {
            await viewModel.loadGuests()
        }
    }
}

struct GuestDetailView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: GuestDetailViewModel
    
    init(guest: Guest) {
        _viewModel = StateObject(wrappedValue: GuestDetailViewModel(guest: guest))
    }
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("common.loading".localized(appState.currentLanguage))
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if let imagePath = viewModel.guest.imagePath {
                            AsyncImage(url: URL(string: "\(UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580")/\(imagePath)")) { image in
                                image.resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Color.gray
                            }
                            .frame(width: 120, height: 120)
                            .cornerRadius(60)
                        }
                        
                        Text(viewModel.guest.fullName)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        if let email = viewModel.guest.email {
                            HStack {
                                Label(email, systemImage: "envelope")
                            }
                        }
                        
                        if let phone = viewModel.guest.phone {
                            HStack {
                                Label(phone, systemImage: "phone")
                            }
                        }
                        
                        if let street = viewModel.guest.street, let city = viewModel.guest.city {
                            Divider()
                            Text("Adresse:")
                                .font(.headline)
                            Text(street)
                            if let postalCode = viewModel.guest.postalCode {
                                Text("\(postalCode) \(city)")
                            } else {
                                Text(city)
                            }
                            if let country = viewModel.guest.country {
                                Text(country)
                            }
                        }
                        
                        if let intolerances = viewModel.guest.intolerances {
                            Divider()
                            Text("Unverträglichkeiten:")
                                .font(.headline)
                            Text(intolerances)
                                .foregroundColor(.secondary)
                        }
                        
                        if let favorites = viewModel.guest.favorites {
                            Divider()
                            Text("Favoriten:")
                                .font(.headline)
                            Text(favorites)
                                .foregroundColor(.secondary)
                        }
                        
                        if let dietaryNotes = viewModel.guest.dietaryNotes {
                            Divider()
                            Text("Ernährungshinweise:")
                                .font(.headline)
                            Text(dietaryNotes)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadGuestDetails()
        }
    }
}

@MainActor
class GuestDetailViewModel: ObservableObject {
    @Published var guest: Guest
    @Published var isLoading = false
    
    init(guest: Guest) {
        self.guest = guest
    }
    
    func loadGuestDetails() async {
        isLoading = true
        do {
            guest = try await APIService.shared.getGuest(id: guest.id)
        } catch {
            print("Error loading guest details: \(error)")
        }
        isLoading = false
    }
}

struct GuestFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let guest: Guest?
    let onSave: (Guest) -> Void
    @State private var name: String
    @State private var email: String
    @State private var phone: String
    
    init(guest: Guest?, onSave: @escaping (Guest) -> Void) {
        self.guest = guest
        self.onSave = onSave
        _name = State(initialValue: guest?.fullName ?? "")
        _email = State(initialValue: guest?.email ?? "")
        _phone = State(initialValue: guest?.phone ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("guests.email".localized(appState.currentLanguage), text: $email)
                TextField("guests.phone".localized(appState.currentLanguage), text: $phone)
            }
            .navigationTitle(guest == nil ? "guests.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newGuest = Guest(
                            id: guest?.id ?? 0,
                            firstName: name.components(separatedBy: " ").first ?? name,
                            lastName: name.components(separatedBy: " ").dropFirst().joined(separator: " "),
                            email: email.isEmpty ? nil : email,
                            phone: phone.isEmpty ? nil : phone,
                            street: guest?.street,
                            city: guest?.city,
                            postalCode: guest?.postalCode,
                            country: guest?.country,
                            intolerances: guest?.intolerances,
                            favorites: guest?.favorites,
                            dietaryNotes: guest?.dietaryNotes,
                            imagePath: guest?.imagePath,
                            createdAt: guest?.createdAt,
                            updatedAt: guest?.updatedAt
                        )
                        onSave(newGuest)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

@MainActor
class GuestsViewModel: ObservableObject {
    @Published var guests: [Guest] = []
    @Published var isLoading = false
    
    func loadGuests() async {
        isLoading = true
        defer { isLoading = false }
        do {
            guests = try await APIService.shared.getGuests()
        } catch {}
    }
    
    func createGuest(_ guest: Guest) async {
        do {
            let newGuest = try await APIService.shared.createGuest(guest)
            guests.append(newGuest)
        } catch {}
    }
}

// MARK: - Shopping Lists Views
struct ShoppingListsView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = ShoppingListsViewModel()
    @State private var showingAddList = false
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("common.loading".localized(appState.currentLanguage))
            } else if viewModel.lists.isEmpty {
                EmptyStateView(icon: "cart.fill", message: "empty.shopping".localized(appState.currentLanguage))
            } else {
                List(viewModel.lists) { list in
                    NavigationLink(destination: ShoppingListDetailView(list: list)) {
                        VStack(alignment: .leading) {
                            Text(list.name).font(.headline)
                            Text("\(list.items.count) Artikel").font(.caption).foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .navigationTitle("shopping.title".localized(appState.currentLanguage))
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingAddList = true }) {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddList) {
            ShoppingListFormView(list: nil) { newList in
                Task { await viewModel.createList(newList) }
            }
        }
        .task {
            await viewModel.loadLists()
        }
    }
}

struct ShoppingListDetailView: View {
    @EnvironmentObject var appState: AppState
    let list: ShoppingList
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(list.name)
                    .font(.title)
                    .fontWeight(.bold)
                
                if let createdAt = list.createdAt {
                    Text("Erstellt: \(createdAt.toGermanDateTime())")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                Text("Artikel (\(list.items.count))")
                    .font(.headline)
                
                ForEach(list.items) { item in
                    HStack {
                        Image(systemName: item.checked ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(item.checked ? .green : .secondary)
                        
                        VStack(alignment: .leading) {
                            Text(item.name)
                                .strikethrough(item.checked)
                            if let quantity = item.quantity, let unit = item.unit {
                                Text("\(quantity) \(unit)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                        
                        if let category = item.category {
                            Text(category)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.secondary.opacity(0.2))
                                .cornerRadius(8)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ShoppingListFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    let list: ShoppingList?
    let onSave: (ShoppingList) -> Void
    @State private var name: String
    
    init(list: ShoppingList?, onSave: @escaping (ShoppingList) -> Void) {
        self.list = list
        self.onSave = onSave
        _name = State(initialValue: list?.name ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
            }
            .navigationTitle(list == nil ? "shopping.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newList = ShoppingList(
                            id: list?.id ?? 0,
                            name: name,
                            items: list?.items ?? [],
                            createdAt: list?.createdAt
                        )
                        onSave(newList)
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
class ShoppingListsViewModel: ObservableObject {
    @Published var lists: [ShoppingList] = []
    @Published var isLoading = false
    
    func loadLists() async {
        isLoading = true
        defer { isLoading = false }
        do {
            lists = try await APIService.shared.getShoppingLists()
        } catch {}
    }
    
    func createList(_ list: ShoppingList) async {
        do {
            let newList = try await APIService.shared.createShoppingList(list)
            lists.append(newList)
        } catch {}
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var apiUrl: String = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580"
    @State private var showingConnectionDialog = false
    
    var body: some View {
        Form {
            Section("settings.language".localized(appState.currentLanguage)) {
                Picker("settings.language".localized(appState.currentLanguage), selection: Binding(
                    get: { appState.currentLanguage },
                    set: { appState.setLanguage($0) }
                )) {
                    Text("Deutsch").tag("de")
                    Text("English").tag("en")
                }
            }
            
            Section("settings.darkMode".localized(appState.currentLanguage)) {
                Toggle("settings.darkMode".localized(appState.currentLanguage), isOn: Binding(
                    get: { appState.isDarkMode },
                    set: { _ in appState.toggleDarkMode() }
                ))
            }
            
            Section("settings.apiUrl".localized(appState.currentLanguage)) {
                Button(action: { showingConnectionDialog = true }) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("settings.configureBackend".localized(appState.currentLanguage))
                                .foregroundColor(.primary)
                            Text(apiUrl)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Section("settings.about".localized(appState.currentLanguage)) {
                Text("Cooking Management System")
                Text("Version 1.0.0")
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("settings.title".localized(appState.currentLanguage))
        .sheet(isPresented: $showingConnectionDialog) {
            BackendConfigurationView(currentUrl: $apiUrl)
                .environmentObject(appState)
        }
    }
}

// MARK: - Backend Configuration View
struct BackendConfigurationView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    @Binding var currentUrl: String
    @State private var urlInput: String
    @State private var isTestingConnection = false
    @State private var connectionStatus: ConnectionStatus = .notTested
    @State private var connectionMessage: String = ""
    
    enum ConnectionStatus {
        case notTested
        case testing
        case success
        case failed
    }
    
    init(currentUrl: Binding<String>) {
        self._currentUrl = currentUrl
        self._urlInput = State(initialValue: currentUrl.wrappedValue)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("settings.backendUrl".localized(appState.currentLanguage))
                            .font(.headline)
                        Text("settings.backendUrlDescription".localized(appState.currentLanguage))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
                
                Section("settings.urlInput".localized(appState.currentLanguage)) {
                    TextField("settings.urlPlaceholder".localized(appState.currentLanguage), text: $urlInput)
                        .autocapitalization(.none)
                        .keyboardType(.URL)
                        .textContentType(.URL)
                    
                    // Quick presets
                    VStack(alignment: .leading, spacing: 8) {
                        Text("settings.quickPresets".localized(appState.currentLanguage))
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        HStack(spacing: 8) {
                            Button("Localhost") {
                                urlInput = "http://localhost:5580"
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                            
                            Button("192.168.1.x") {
                                urlInput = "http://192.168.1.100:8000"
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                Section {
                    Button(action: testConnection) {
                        HStack {
                            if isTestingConnection {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                Text("settings.testing".localized(appState.currentLanguage))
                            } else {
                                Image(systemName: "network")
                                Text("settings.testConnection".localized(appState.currentLanguage))
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(urlInput.isEmpty || isTestingConnection)
                    
                    if connectionStatus != .notTested {
                        HStack {
                            Image(systemName: connectionStatus == .success ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundColor(connectionStatus == .success ? .green : .red)
                            Text(connectionMessage)
                                .font(.caption)
                        }
                    }
                }
                
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("settings.examples".localized(appState.currentLanguage))
                            .font(.headline)
                        
                        ExampleRow(title: "settings.exampleLocal".localized(appState.currentLanguage),
                                  url: "http://localhost:5580")
                        ExampleRow(title: "settings.exampleNetwork".localized(appState.currentLanguage),
                                  url: "http://192.168.1.100:8000")
                        ExampleRow(title: "settings.exampleProduction".localized(appState.currentLanguage),
                                  url: "https://api.example.com")
                    }
                }
            }
            .navigationTitle("settings.configureBackend".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        saveConfiguration()
                    }
                    .disabled(urlInput.isEmpty)
                }
            }
        }
    }
    
    private func testConnection() {
        isTestingConnection = true
        connectionStatus = .testing
        connectionMessage = ""
        
        Task {
            do {
                // Test connection by trying to fetch recipes
                guard let url = URL(string: "\(urlInput)/api/recipes") else {
                    throw URLError(.badURL)
                }
                
                var request = URLRequest(url: url)
                request.timeoutInterval = 5.0
                
                let (_, response) = try await URLSession.shared.data(for: request)
                
                if let httpResponse = response as? HTTPURLResponse {
                    if (200...299).contains(httpResponse.statusCode) {
                        await MainActor.run {
                            connectionStatus = .success
                            connectionMessage = "settings.connectionSuccess".localized(appState.currentLanguage)
                            isTestingConnection = false
                        }
                    } else {
                        throw URLError(.badServerResponse)
                    }
                }
            } catch {
                await MainActor.run {
                    connectionStatus = .failed
                    connectionMessage = "settings.connectionFailed".localized(appState.currentLanguage) + ": \(error.localizedDescription)"
                    isTestingConnection = false
                }
            }
        }
    }
    
    private func saveConfiguration() {
        UserDefaults.standard.set(urlInput, forKey: "apiBaseURL")
        currentUrl = urlInput
        dismiss()
    }
}

struct ExampleRow: View {
    let title: String
    let url: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(url)
                .font(.system(.caption, design: .monospaced))
                .foregroundColor(.blue)
        }
    }
}

// Made with Bob
