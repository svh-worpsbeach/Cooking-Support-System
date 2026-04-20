# Backend Configuration for iOS App

## Problem
The iOS app is configured to use port 8000, but the backend runs on port 5580.

## Solution

### Option 1: Configure in App Settings (Recommended)
The app reads the API base URL from `UserDefaults` with key `apiBaseURL`.

1. Open the iOS app
2. Go to Settings (if available)
3. Set API Base URL to: `http://localhost:5580`

### Option 2: Modify Source Code
If you need to change the default port in the source code:

1. Open `ios/com.svh.cookingmanagement/CookingManagementApp/Services/APIService.swift`
2. Change line 8 from:
   ```swift
   UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8000"
   ```
   to:
   ```swift
   UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:5580"
   ```

3. Also update `ios/com.svh.cookingmanagement/CookingManagementApp/Views/Recipes/RecipesViews.swift` line 144:
   ```swift
   AsyncImage(url: URL(string: "http://localhost:5580/\(firstImage.filepath)"))
   ```

### Option 3: Use Device IP Address
For testing on a physical device, use your computer's IP address:

```swift
"http://192.168.1.XXX:5580"
```

Replace `192.168.1.XXX` with your actual IP address.

## Current Status

### ✅ Views that exist and work correctly:
- **LocationsView** (line 516 in AllOtherViews.swift) - Shows locations list
- **ToolsView** (line 189 in AllOtherViews.swift) - Shows tools list  
- **GuestsView** (line 661 in AllOtherViews.swift) - Shows guests list
- **RecipeDetailView** (line 128 in RecipesViews.swift) - Shows:
  - Ingredients (lines 173-184)
  - Steps (lines 187-199)
  - Images (lines 143-152, 199-210)
- **EventDetailView** (line 52 in AllOtherViews.swift) - Shows:
  - Participants (lines 77-92)
  - Courses (lines 94-110)

### ⚠️ Known Issues:
1. **Port mismatch**: App uses 8000, backend uses 5580
2. **Hardcoded URLs**: Image URLs in RecipeDetailView use hardcoded port 8000
3. **Date formatting**: Timestamps shown as technical strings instead of localized dates

## Date Formatting Issue

The iOS app shows dates as raw strings (e.g., "2026-04-13T05:58:21.247248Z") instead of formatted dates.

### Solution:
Add a date formatter extension in Swift:

```swift
extension String {
    func toFormattedDate() -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        guard let date = isoFormatter.date(from: self) else {
            return self
        }
        
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "de_DE")
        formatter.timeZone = TimeZone(identifier: "Europe/Berlin")
        
        return formatter.string(from: date)
    }
}
```

Then use it in views:
```swift
Text(event.eventDate?.toFormattedDate() ?? "")