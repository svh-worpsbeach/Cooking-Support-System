import SwiftUI

// MARK: - Extended Event Form View
struct EventFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let event: Event?
    let onSave: (Event) -> Void
    
    @State private var name: String
    @State private var description: String
    @State private var theme: String
    @State private var date: Date
    @State private var participants: [ParticipantEdit]
    @State private var courses: [CourseEdit]
    @State private var showingAddParticipant = false
    @State private var showingAddCourse = false
    @State private var editingParticipant: ParticipantEdit?
    @State private var editingCourse: CourseEdit?
    
    init(event: Event?, onSave: @escaping (Event) -> Void) {
        self.event = event
        self.onSave = onSave
        _name = State(initialValue: event?.name ?? "")
        _description = State(initialValue: event?.description ?? "")
        _theme = State(initialValue: event?.theme ?? "")
        
        let eventDate: Date
        if let dateString = event?.eventDate {
            let formatter = ISO8601DateFormatter()
            eventDate = formatter.date(from: dateString) ?? Date()
        } else {
            eventDate = Date()
        }
        _date = State(initialValue: eventDate)
        
        _participants = State(initialValue: event?.participants?.map { participant in
            ParticipantEdit(
                id: participant.id,
                name: participant.name,
                dietaryRestrictions: participant.dietaryRestrictions
            )
        } ?? [])
        
        _courses = State(initialValue: event?.courses?.sorted(by: { $0.courseNumber < $1.courseNumber }).map { course in
            CourseEdit(
                id: course.id,
                courseNumber: course.courseNumber,
                courseName: course.courseName,
                recipeIds: course.recipes?.map { $0.recipeId } ?? []
            )
        } ?? [])
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("common.name".localized(appState.currentLanguage), text: $name)
                    TextField("common.description".localized(appState.currentLanguage), text: $description)
                    TextField("events.theme".localized(appState.currentLanguage), text: $theme)
                }
                
                Section("common.date".localized(appState.currentLanguage)) {
                    DatePicker("common.date".localized(appState.currentLanguage), selection: $date, displayedComponents: [.date, .hourAndMinute])
                }
                
                Section {
                    HStack {
                        Text("events.participants".localized(appState.currentLanguage))
                            .font(.headline)
                        Spacer()
                        Button(action: { showingAddParticipant = true }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if participants.isEmpty {
                        Text("empty.participants".localized(appState.currentLanguage))
                            .foregroundColor(.secondary)
                            .font(.caption)
                    } else {
                        ForEach(participants.indices, id: \.self) { index in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(participants[index].name)
                                        .font(.subheadline)
                                    if let dietary = participants[index].dietaryRestrictions {
                                        Text(dietary)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                Spacer()
                                Button(action: { editingParticipant = participants[index] }) {
                                    Image(systemName: "pencil")
                                        .foregroundColor(.blue)
                                }
                                Button(action: { participants.remove(at: index) }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                    }
                }
                
                Section {
                    HStack {
                        Text("events.courses".localized(appState.currentLanguage))
                            .font(.headline)
                        Spacer()
                        Button(action: { showingAddCourse = true }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if courses.isEmpty {
                        Text("empty.courses".localized(appState.currentLanguage))
                            .foregroundColor(.secondary)
                            .font(.caption)
                    } else {
                        ForEach(courses.indices, id: \.self) { index in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("\(courses[index].courseNumber). \(courses[index].courseName)")
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                    Text("\(courses[index].recipeIds.count) Rezepte")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                Button(action: { editingCourse = courses[index] }) {
                                    Image(systemName: "pencil")
                                        .foregroundColor(.blue)
                                }
                                Button(action: { 
                                    courses.remove(at: index)
                                    updateCourseNumbers()
                                }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                        .onMove { from, to in
                            courses.move(fromOffsets: from, toOffset: to)
                            updateCourseNumbers()
                        }
                    }
                }
            }
            .navigationTitle(event == nil ? "events.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        saveEvent()
                    }
                    .disabled(name.isEmpty)
                }
            }
            .sheet(isPresented: $showingAddParticipant) {
                ParticipantFormView(participant: nil) { newParticipant in
                    participants.append(newParticipant)
                }
            }
            .sheet(item: $editingParticipant) { participant in
                ParticipantFormView(participant: participant) { updatedParticipant in
                    if let index = participants.firstIndex(where: { $0.id == updatedParticipant.id }) {
                        participants[index] = updatedParticipant
                    }
                }
            }
            .sheet(isPresented: $showingAddCourse) {
                CourseFormView(course: nil, courseNumber: courses.count + 1) { newCourse in
                    courses.append(newCourse)
                    updateCourseNumbers()
                }
            }
            .sheet(item: $editingCourse) { course in
                CourseFormView(course: course, courseNumber: course.courseNumber) { updatedCourse in
                    if let index = courses.firstIndex(where: { $0.id == updatedCourse.id }) {
                        courses[index] = updatedCourse
                    }
                }
            }
        }
    }
    
    private func updateCourseNumbers() {
        for (index, _) in courses.enumerated() {
            courses[index].courseNumber = index + 1
        }
    }
    
    private func saveEvent() {
        let formatter = ISO8601DateFormatter()
        
        let eventParticipants = participants.map { participant in
            EventParticipant(
                id: participant.id,
                eventId: event?.id ?? 0,
                name: participant.name,
                dietaryRestrictions: participant.dietaryRestrictions
            )
        }
        
        let eventCourses = courses.map { course in
            EventCourse(
                id: course.id,
                eventId: event?.id ?? 0,
                courseNumber: course.courseNumber,
                courseName: course.courseName,
                recipes: course.recipeIds.map { recipeId in
                    CourseRecipe(id: 0, courseId: course.id, recipeId: recipeId)
                }
            )
        }
        
        let newEvent = Event(
            id: event?.id ?? 0,
            name: name,
            description: description.isEmpty ? nil : description,
            theme: theme.isEmpty ? nil : theme,
            eventDate: formatter.string(from: date),
            participants: eventParticipants.isEmpty ? nil : eventParticipants,
            courses: eventCourses.isEmpty ? nil : eventCourses,
            shoppingList: event?.shoppingList,
            createdAt: event?.createdAt,
            updatedAt: event?.updatedAt
        )
        onSave(newEvent)
        dismiss()
    }
}

// MARK: - Supporting Types
struct ParticipantEdit: Identifiable {
    let id: Int
    var name: String
    var dietaryRestrictions: String?
}

struct CourseEdit: Identifiable {
    let id: Int
    var courseNumber: Int
    var courseName: String
    var recipeIds: [Int]
}

// MARK: - Participant Form View
struct ParticipantFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let participant: ParticipantEdit?
    let onSave: (ParticipantEdit) -> Void
    
    @State private var name: String
    @State private var dietaryRestrictions: String
    
    init(participant: ParticipantEdit?, onSave: @escaping (ParticipantEdit) -> Void) {
        self.participant = participant
        self.onSave = onSave
        _name = State(initialValue: participant?.name ?? "")
        _dietaryRestrictions = State(initialValue: participant?.dietaryRestrictions ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                TextField("common.name".localized(appState.currentLanguage), text: $name)
                TextField("guests.dietary".localized(appState.currentLanguage), text: $dietaryRestrictions)
            }
            .navigationTitle(participant == nil ? "participants.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newParticipant = ParticipantEdit(
                            id: participant?.id ?? Int.random(in: 1000...9999),
                            name: name,
                            dietaryRestrictions: dietaryRestrictions.isEmpty ? nil : dietaryRestrictions
                        )
                        onSave(newParticipant)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

// MARK: - Course Form View
struct CourseFormView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    let course: CourseEdit?
    let courseNumber: Int
    let onSave: (CourseEdit) -> Void
    
    @State private var courseName: String
    @State private var recipeIds: [Int]
    
    init(course: CourseEdit?, courseNumber: Int, onSave: @escaping (CourseEdit) -> Void) {
        self.course = course
        self.courseNumber = courseNumber
        self.onSave = onSave
        _courseName = State(initialValue: course?.courseName ?? "")
        _recipeIds = State(initialValue: course?.recipeIds ?? [])
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Gang \(courseNumber)") {
                    TextField("courses.name".localized(appState.currentLanguage), text: $courseName)
                }
                
                Section("courses.recipes".localized(appState.currentLanguage)) {
                    Text("Rezept-Auswahl wird in einer zukünftigen Version implementiert")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle(course == nil ? "courses.new".localized(appState.currentLanguage) : "common.edit".localized(appState.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common.cancel".localized(appState.currentLanguage)) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("common.save".localized(appState.currentLanguage)) {
                        let newCourse = CourseEdit(
                            id: course?.id ?? Int.random(in: 1000...9999),
                            courseNumber: courseNumber,
                            courseName: courseName,
                            recipeIds: recipeIds
                        )
                        onSave(newCourse)
                        dismiss()
                    }
                    .disabled(courseName.isEmpty)
                }
            }
        }
    }
}

// Made with Bob