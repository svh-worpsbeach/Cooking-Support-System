import Foundation

extension String {
    /// Konvertiert einen ISO8601-String in ein formatiertes deutsches Datum
    /// Beispiel: "2024-03-15T14:30:00Z" -> "15.03.2024"
    func toGermanDate() -> String {
        guard let date = self.toDate() else { return self }
        
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        
        return formatter.string(from: date)
    }
    
    /// Konvertiert einen ISO8601-String in ein formatiertes deutsches Datum mit Uhrzeit
    /// Beispiel: "2024-03-15T14:30:00Z" -> "15.03.2024, 16:30"
    func toGermanDateTime() -> String {
        guard let date = self.toDate() else { return self }
        
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        
        return formatter.string(from: date)
    }
    
    /// Konvertiert einen ISO8601-String in ein kurzes deutsches Datum
    /// Beispiel: "2024-03-15T14:30:00Z" -> "15.03.24"
    func toGermanShortDate() -> String {
        guard let date = self.toDate() else { return self }
        
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        
        return formatter.string(from: date)
    }
    
    /// Konvertiert einen ISO8601-String in eine relative Zeitangabe
    /// Beispiel: "vor 2 Stunden", "gestern", "vor 3 Tagen"
    func toRelativeTime() -> String {
        guard let date = self.toDate() else { return self }
        
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "de_DE")
        formatter.unitsStyle = .full
        
        return formatter.localizedString(for: date, relativeTo: Date())
    }
    
    /// Hilfsfunktion: Konvertiert ISO8601-String zu Date
    private func toDate() -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = formatter.date(from: self) {
            return date
        }
        
        // Fallback ohne Millisekunden
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: self)
    }
}

/// DateFormatter für konsistente Datumsformatierung in der gesamten App
struct AppDateFormatters {
    /// Formatter für deutsches Datum (z.B. "15.03.2024")
    static let germanDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        return formatter
    }()
    
    /// Formatter für deutsches Datum mit Uhrzeit (z.B. "15.03.2024, 16:30")
    static let germanDateTime: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        return formatter
    }()
    
    /// Formatter für kurzes deutsches Datum (z.B. "15.03.24")
    static let germanShortDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        return formatter
    }()
    
    /// ISO8601 Formatter für API-Kommunikation
    static let iso8601: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    /// ISO8601 Formatter ohne Millisekunden (Fallback)
    static let iso8601Simple: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()
}

// Made with Bob
