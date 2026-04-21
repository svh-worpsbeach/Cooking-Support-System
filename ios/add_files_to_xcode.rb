#!/usr/bin/env ruby

require 'xcodeproj'

# Pfad zum Xcode-Projekt
project_path = 'com.svh.cookingmanagement/CookingManagementApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Haupttarget finden
target = project.targets.first

# Views-Gruppe finden oder erstellen
views_group = project.main_group.find_subpath('CookingManagementApp/Views', true)

# Recipes-Gruppe finden oder erstellen
recipes_group = views_group.find_subpath('Recipes', true)

# Events-Gruppe finden oder erstellen
events_group = views_group.find_subpath('Events', true)

# ShoppingLists-Gruppe finden oder erstellen
shopping_lists_group = views_group.find_subpath('ShoppingLists', true)

# Dateien hinzufügen
files_to_add = [
  {
    path: 'com.svh.cookingmanagement/CookingManagementApp/Views/Recipes/RecipeFormView.swift',
    group: recipes_group
  },
  {
    path: 'com.svh.cookingmanagement/CookingManagementApp/Views/Events/EventFormView.swift',
    group: events_group
  },
  {
    path: 'com.svh.cookingmanagement/CookingManagementApp/Views/ShoppingLists/ShoppingListFormView.swift',
    group: shopping_lists_group
  }
]

files_to_add.each do |file_info|
  file_path = file_info[:path]
  group = file_info[:group]
  
  # Prüfen, ob Datei bereits existiert
  existing_file = group.files.find { |f| f.path == File.basename(file_path) }
  
  unless existing_file
    # Datei zur Gruppe hinzufügen
    file_ref = group.new_reference(file_path)
    
    # Datei zum Build hinzufügen
    target.add_file_references([file_ref])
    
    puts "✓ Hinzugefügt: #{file_path}"
  else
    puts "○ Bereits vorhanden: #{file_path}"
  end
end

# Assets-Gruppe finden
assets_group = project.main_group.find_subpath('CookingManagementApp/Assets.xcassets', true)

# Asset-Ordner hinzufügen (falls noch nicht vorhanden)
asset_folders = [
  'KitchenLight.imageset',
  'KitchenDark.imageset'
]

asset_folders.each do |folder|
  folder_path = "com.svh.cookingmanagement/CookingManagementApp/Assets.xcassets/#{folder}"
  
  # Prüfen, ob Ordner bereits existiert
  existing_folder = assets_group.groups.find { |g| g.name == folder }
  
  unless existing_folder
    # Ordner zur Assets-Gruppe hinzufügen
    folder_group = assets_group.new_group(folder, folder_path)
    puts "✓ Asset-Ordner hinzugefügt: #{folder}"
  else
    puts "○ Asset-Ordner bereits vorhanden: #{folder}"
  end
end

# Projekt speichern
project.save

puts "\n✅ Xcode-Projekt erfolgreich aktualisiert!"
puts "Öffne das Projekt in Xcode und baue es neu (Cmd+B)"

# Made with Bob
