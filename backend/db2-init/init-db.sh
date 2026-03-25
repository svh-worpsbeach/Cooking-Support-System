#!/bin/bash
# DB2 Database Initialization Script for Cooking Management System

set -e

echo "Waiting for DB2 to be ready..."
sleep 30

echo "Creating database schema..."

# Connect to DB2 and create tables
db2 connect to COOKDB

# Create Locations table
db2 "CREATE TABLE IF NOT EXISTS locations (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name VARCHAR(255) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)"

# Create Recipes table
db2 "CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name VARCHAR(255) NOT NULL,
    description CLOB,
    preparation_time VARCHAR(10) DEFAULT '0:00',
    cooking_time VARCHAR(10) DEFAULT '0:00',
    title_image_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)"

# Create Recipe Categories table
db2 "CREATE TABLE IF NOT EXISTS recipe_categories (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    recipe_id INTEGER NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)"

# Create Recipe Ingredients table
db2 "CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    recipe_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description CLOB,
    amount DECIMAL(10,2),
    unit VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)"

# Create Recipe Steps table
db2 "CREATE TABLE IF NOT EXISTS recipe_steps (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    recipe_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    content CLOB NOT NULL,
    step_image_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)"

# Create Recipe Images table
db2 "CREATE TABLE IF NOT EXISTS recipe_images (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    recipe_id INTEGER NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)"

# Create Events table
db2 "CREATE TABLE IF NOT EXISTS events (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name VARCHAR(255) NOT NULL,
    description CLOB,
    theme VARCHAR(255),
    event_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)"

# Create Event Participants table
db2 "CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    dietary_restrictions CLOB,
    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)"

# Create Event Courses table
db2 "CREATE TABLE IF NOT EXISTS event_courses (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    event_id INTEGER NOT NULL,
    course_number INTEGER NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)"

# Create Event Course Recipes table
db2 "CREATE TABLE IF NOT EXISTS event_course_recipes (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    course_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (course_id) REFERENCES event_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)"

# Create Shopping Lists table
db2 "CREATE TABLE IF NOT EXISTS shopping_lists (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    event_id INTEGER NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    purchased SMALLINT DEFAULT 0,
    source VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)"

# Create Cooking Tools table
db2 "CREATE TABLE IF NOT EXISTS cooking_tools (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name VARCHAR(255) NOT NULL,
    description CLOB,
    location_id INTEGER,
    image_path VARCHAR(500),
    is_wishlist SMALLINT DEFAULT 0,
    priority VARCHAR(50),
    estimated_price DECIMAL(10,2),
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
)"

# Create Storage Items table
db2 "CREATE TABLE IF NOT EXISTS storage_items (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    expiry_date DATE,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
)"

# Create indexes for better performance
db2 "CREATE INDEX IF NOT EXISTS idx_recipe_categories_recipe_id ON recipe_categories(recipe_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps(recipe_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_id ON recipe_images(recipe_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_event_courses_event_id ON event_courses(event_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_shopping_lists_event_id ON shopping_lists(event_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_cooking_tools_location_id ON cooking_tools(location_id)"
db2 "CREATE INDEX IF NOT EXISTS idx_storage_items_location_id ON storage_items(location_id)"

db2 "COMMIT"

echo "Database schema created successfully!"

db2 disconnect COOKDB

echo "DB2 initialization complete!"

# Made with Bob
