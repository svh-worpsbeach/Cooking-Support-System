"""
Script to populate the database with test data.
"""

import requests
import json
import io
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from additional_recipes import ITALIAN_FRENCH_RECIPES

import os
BASE_URL = os.getenv("API_URL", "http://localhost:8000/api")

def create_placeholder_image(text, size=(800, 600), bg_color=(200, 200, 200), text_color=(50, 50, 50)):
    """Create a placeholder image with text."""
    img = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fall back to default if not available
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    
    draw.text(position, text, fill=text_color, font=font)
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG', quality=85)
    img_byte_arr.seek(0)
    
    return img_byte_arr

def create_locations():
    """Create test locations."""
    locations = [
        {
            "name": "Kitchen",
            "description": "Main kitchen area"
        },
        {
            "name": "Pantry",
            "description": "Food storage pantry"
        },
        {
            "name": "Garage",
            "description": "Additional storage in garage"
        }
    ]
    
    created_locations = []
    for location in locations:
        response = requests.post(f"{BASE_URL}/locations", json=location)
        if response.status_code in [200, 201]:
            created_locations.append(response.json())
            print(f"✓ Created location: {location['name']}")
        else:
            print(f"✗ Failed to create location: {location['name']} - Status: {response.status_code}, Response: {response.text}")
            # Location might already exist, try to fetch it
            get_response = requests.get(f"{BASE_URL}/locations")
            if get_response.status_code == 200:
                existing_locations = get_response.json()
                matching = next((loc for loc in existing_locations if loc['name'] == location['name']), None)
                if matching:
                    created_locations.append(matching)
                    print(f"✓ Using existing location: {location['name']}")
    
    return created_locations


def create_recipes():
    """Create test recipes."""
    recipes = [
        {
            "name": "Classic Spaghetti Carbonara",
            "description": "Traditional Italian pasta dish with eggs, cheese, and pancetta",
            "categories": ["Italian", "Pasta", "Main Course"],
            "ingredients": [
                {
                    "name": "Spaghetti",
                    "amount": 400,
                    "unit": "g",
                    "order_index": 0
                },
                {
                    "name": "Pancetta",
                    "amount": 200,
                    "unit": "g",
                    "order_index": 1
                },
                {
                    "name": "Eggs",
                    "amount": 4,
                    "unit": "pieces",
                    "order_index": 2
                },
                {
                    "name": "Parmesan cheese",
                    "amount": 100,
                    "unit": "g",
                    "order_index": 3
                },
                {
                    "name": "Black pepper",
                    "description": "Freshly ground",
                    "amount": 1,
                    "unit": "tsp",
                    "order_index": 4
                }
            ],
            "steps": [
                {
                    "step_number": 1,
                    "content": "Bring a large pot of salted water to boil and cook spaghetti according to package directions."
                },
                {
                    "step_number": 2,
                    "content": "While pasta cooks, cut pancetta into small cubes and fry in a large pan until crispy."
                },
                {
                    "step_number": 3,
                    "content": "In a bowl, whisk together eggs, grated Parmesan, and black pepper."
                },
                {
                    "step_number": 4,
                    "content": "Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the pan with pancetta."
                },
                {
                    "step_number": 5,
                    "content": "Remove from heat and quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce."
                }
            ]
        },
        {
            "name": "Chocolate Chip Cookies",
            "description": "Soft and chewy homemade chocolate chip cookies",
            "categories": ["Dessert", "Baking", "American"],
            "ingredients": [
                {
                    "name": "All-purpose flour",
                    "amount": 280,
                    "unit": "g",
                    "order_index": 0
                },
                {
                    "name": "Butter",
                    "description": "Softened",
                    "amount": 225,
                    "unit": "g",
                    "order_index": 1
                },
                {
                    "name": "Brown sugar",
                    "amount": 200,
                    "unit": "g",
                    "order_index": 2
                },
                {
                    "name": "White sugar",
                    "amount": 100,
                    "unit": "g",
                    "order_index": 3
                },
                {
                    "name": "Eggs",
                    "amount": 2,
                    "unit": "pieces",
                    "order_index": 4
                },
                {
                    "name": "Vanilla extract",
                    "amount": 2,
                    "unit": "tsp",
                    "order_index": 5
                },
                {
                    "name": "Baking soda",
                    "amount": 1,
                    "unit": "tsp",
                    "order_index": 6
                },
                {
                    "name": "Salt",
                    "amount": 0.5,
                    "unit": "tsp",
                    "order_index": 7
                },
                {
                    "name": "Chocolate chips",
                    "amount": 340,
                    "unit": "g",
                    "order_index": 8
                }
            ],
            "steps": [
                {
                    "step_number": 1,
                    "content": "Preheat oven to 375°F (190°C)."
                },
                {
                    "step_number": 2,
                    "content": "Cream together butter and both sugars until light and fluffy."
                },
                {
                    "step_number": 3,
                    "content": "Beat in eggs one at a time, then stir in vanilla."
                },
                {
                    "step_number": 4,
                    "content": "In a separate bowl, combine flour, baking soda, and salt."
                },
                {
                    "step_number": 5,
                    "content": "Gradually blend dry ingredients into butter mixture. Fold in chocolate chips."
                },
                {
                    "step_number": 6,
                    "content": "Drop rounded tablespoons of dough onto ungreased cookie sheets."
                },
                {
                    "step_number": 7,
                    "content": "Bake for 9-11 minutes or until golden brown. Cool on baking sheet for 2 minutes before transferring to a wire rack."
                }
            ]
        },
        {
            "name": "Thai Green Curry",
            "description": "Aromatic and spicy Thai curry with vegetables",
            "categories": ["Thai", "Curry", "Main Course", "Vegetarian"],
            "ingredients": [
                {
                    "name": "Green curry paste",
                    "amount": 3,
                    "unit": "tbsp",
                    "order_index": 0
                },
                {
                    "name": "Coconut milk",
                    "amount": 400,
                    "unit": "ml",
                    "order_index": 1
                },
                {
                    "name": "Bell peppers",
                    "description": "Mixed colors, sliced",
                    "amount": 2,
                    "unit": "pieces",
                    "order_index": 2
                },
                {
                    "name": "Bamboo shoots",
                    "amount": 200,
                    "unit": "g",
                    "order_index": 3
                },
                {
                    "name": "Thai basil",
                    "amount": 1,
                    "unit": "bunch",
                    "order_index": 4
                },
                {
                    "name": "Fish sauce",
                    "amount": 2,
                    "unit": "tbsp",
                    "order_index": 5
                },
                {
                    "name": "Palm sugar",
                    "amount": 1,
                    "unit": "tbsp",
                    "order_index": 6
                }
            ],
            "steps": [
                {
                    "step_number": 1,
                    "content": "Heat a wok or large pan over medium-high heat."
                },
                {
                    "step_number": 2,
                    "content": "Add curry paste and fry for 1-2 minutes until fragrant."
                },
                {
                    "step_number": 3,
                    "content": "Pour in half the coconut milk and stir to combine with the paste."
                },
                {
                    "step_number": 4,
                    "content": "Add vegetables and remaining coconut milk. Bring to a simmer."
                },
                {
                    "step_number": 5,
                    "content": "Season with fish sauce and palm sugar. Simmer for 10 minutes."
                },
                {
                    "step_number": 6,
                    "content": "Stir in Thai basil leaves just before serving. Serve with jasmine rice."
                }
            ]
        }
    ] + ITALIAN_FRENCH_RECIPES  # Add Italian and French recipes
    
    created_recipes = []
    for recipe in recipes:
        response = requests.post(f"{BASE_URL}/recipes", json=recipe)
        if response.status_code in [200, 201]:
            recipe_data = response.json()
            created_recipes.append(recipe_data)
            print(f"✓ Created recipe: {recipe['name']}")
            
            recipe_id = recipe_data['id']
            
            # Add title image
            title_img_data = create_placeholder_image(
                f"{recipe['name']}\nTitle Image",
                bg_color=(180, 200, 220)
            )
            
            title_files = {'file': ('title.jpg', title_img_data, 'image/jpeg')}
            title_data = {
                'is_process_image': 'false',
                'order_index': '0'
            }
            
            title_response = requests.post(
                f"{BASE_URL}/recipes/{recipe_id}/images",
                files=title_files,
                data=title_data
            )
            
            if title_response.status_code == 201:
                title_image_id = title_response.json()['id']
                
                # Set as title image
                set_title_response = requests.put(
                    f"{BASE_URL}/recipes/{recipe_id}/title-image",
                    params={'image_id': title_image_id}
                )
                
                if set_title_response.status_code == 200:
                    print(f"  ✓ Added title image")
                else:
                    print(f"  ✗ Failed to set title image")
            else:
                print(f"  ✗ Failed to upload title image")
            
            # Add sample images for some steps
            steps_with_images = [1, 3, 5]  # Add images to steps 1, 3, and 5
            
            for step_num in steps_with_images:
                if step_num <= len(recipe['steps']):
                    # Create placeholder image
                    img_data = create_placeholder_image(
                        f"{recipe['name']}\nStep {step_num}",
                        bg_color=(220, 230, 240)
                    )
                    
                    # Upload image
                    files = {'file': (f'step_{step_num}.jpg', img_data, 'image/jpeg')}
                    data = {
                        'is_process_image': 'true',
                        'order_index': str(step_num - 1)
                    }
                    
                    img_response = requests.post(
                        f"{BASE_URL}/recipes/{recipe_id}/images",
                        files=files,
                        data=data
                    )
                    
                    if img_response.status_code == 201:
                        image_id = img_response.json()['id']
                        
                        # Get the step and update it with the image
                        steps = recipe_data.get('steps', [])
                        matching_step = next((s for s in steps if s['step_number'] == step_num), None)
                        
                        if matching_step:
                            step_id = matching_step['id']
                            update_data = {
                                'step_number': step_num,
                                'content': matching_step['content'],
                                'step_image_id': image_id
                            }
                            
                            update_response = requests.put(
                                f"{BASE_URL}/recipes/{recipe_id}/steps/{step_id}",
                                json=update_data
                            )
                            
                            if update_response.status_code == 200:
                                print(f"  ✓ Added image to step {step_num}")
                            else:
                                print(f"  ✗ Failed to link image to step {step_num}")
                    else:
                        print(f"  ✗ Failed to upload image for step {step_num}")
        else:
            print(f"✗ Failed to create recipe: {recipe['name']} - {response.text}")
    
    return created_recipes


def create_events(recipes):
    """Create test events."""
    if not recipes:
        print("No recipes available to create events")
        return []
    
    # Calculate dates
    next_week = (datetime.now() + timedelta(days=7)).isoformat()
    next_month = (datetime.now() + timedelta(days=30)).isoformat()
    
    events = [
        {
            "name": "Italian Night Dinner Party",
            "description": "A cozy evening with friends featuring Italian cuisine",
            "theme": "Italian",
            "event_date": next_week,
            "participants": [
                {
                    "name": "John Doe",
                    "dietary_restrictions": "None"
                },
                {
                    "name": "Jane Smith",
                    "dietary_restrictions": "Vegetarian"
                },
                {
                    "name": "Bob Johnson",
                    "dietary_restrictions": "Gluten-free"
                }
            ],
            "courses": [
                {
                    "course_number": 1,
                    "course_name": "Main Course"
                },
                {
                    "course_number": 2,
                    "course_name": "Dessert"
                }
            ]
        },
        {
            "name": "Summer BBQ Party",
            "description": "Outdoor barbecue celebration",
            "theme": "BBQ",
            "event_date": next_month,
            "participants": [
                {
                    "name": "Alice Brown",
                    "dietary_restrictions": "None"
                },
                {
                    "name": "Charlie Davis",
                    "dietary_restrictions": "Pescatarian"
                }
            ],
            "courses": [
                {
                    "course_number": 1,
                    "course_name": "Appetizers"
                },
                {
                    "course_number": 2,
                    "course_name": "Main Course"
                }
            ]
        }
    ]
    
    created_events = []
    for event in events:
        response = requests.post(f"{BASE_URL}/events", json=event)
        if response.status_code in [200, 201]:
            created_events.append(response.json())
            print(f"✓ Created event: {event['name']}")
        else:
            print(f"✗ Failed to create event: {event['name']} - {response.text}")
    
    return created_events


def create_tools(locations):
    """Create test cooking tools."""
    location_id = locations[0]["id"] if locations else None
    
    tools = [
        {
            "name": "Chef's Knife",
            "description": "8-inch professional chef's knife",
            "location_id": location_id,
            "storage_location": "Knife block on counter"
        },
        {
            "name": "Cast Iron Skillet",
            "description": "12-inch Lodge cast iron skillet",
            "location_id": location_id,
            "storage_location": "Hanging on pot rack"
        },
        {
            "name": "Stand Mixer",
            "description": "KitchenAid 5-quart stand mixer",
            "location_id": location_id,
            "storage_location": "Counter next to stove"
        },
        {
            "name": "Food Processor",
            "description": "Cuisinart 14-cup food processor",
            "location_id": location_id,
            "storage_location": "Cabinet under counter"
        },
        {
            "name": "Dutch Oven",
            "description": "6-quart enameled cast iron Dutch oven",
            "location_id": location_id,
            "storage_location": "Lower cabinet"
        }
    ]
    
    created_tools = []
    for tool in tools:
        response = requests.post(f"{BASE_URL}/tools", json=tool)
        if response.status_code in [200, 201]:
            created_tools.append(response.json())
            print(f"✓ Created tool: {tool['name']}")
        else:
            print(f"✗ Failed to create tool: {tool['name']} - {response.text}")
    
    return created_tools


def create_storage_items(locations):
    """Create test storage items."""
    location_id = locations[1]["id"] if len(locations) > 1 else (locations[0]["id"] if locations else None)
    
    # Calculate expiry dates
    next_month = (datetime.now() + timedelta(days=30)).date().isoformat()
    next_year = (datetime.now() + timedelta(days=365)).date().isoformat()
    
    items = [
        {
            "name": "Basil",
            "category": "Herbs",
            "quantity": 50,
            "unit": "g",
            "location_id": location_id,
            "expiry_date": next_month
        },
        {
            "name": "Oregano",
            "category": "Herbs",
            "quantity": 30,
            "unit": "g",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Black Pepper",
            "category": "Spices",
            "quantity": 100,
            "unit": "g",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Paprika",
            "category": "Spices",
            "quantity": 75,
            "unit": "g",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Cumin",
            "category": "Spices",
            "quantity": 60,
            "unit": "g",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Olive Oil",
            "category": "Oils",
            "quantity": 1,
            "unit": "L",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Balsamic Vinegar",
            "category": "Vinegars",
            "quantity": 500,
            "unit": "ml",
            "location_id": location_id,
            "expiry_date": next_year
        },
        {
            "name": "Soy Sauce",
            "category": "Sauces",
            "quantity": 250,
            "unit": "ml",
            "location_id": location_id,
            "expiry_date": next_year
        }
    ]
    
    created_items = []
    for item in items:
        response = requests.post(f"{BASE_URL}/storage", json=item)
        if response.status_code in [200, 201]:
            created_items.append(response.json())
            print(f"✓ Created storage item: {item['name']}")
        else:
            print(f"✗ Failed to create storage item: {item['name']} - {response.text}")
    
    return created_items


def main():
    """Main function to populate all test data."""
    print("=" * 50)
    print("Populating database with test data...")
    print("=" * 50)
    
    print("\n📍 Creating locations...")
    locations = create_locations()
    
    print("\n📖 Creating recipes...")
    recipes = create_recipes()
    
    print("\n🎉 Creating events...")
    events = create_events(recipes)
    
    print("\n🔪 Creating cooking tools...")
    tools = create_tools(locations)
    
    print("\n🏺 Creating storage items...")
    storage_items = create_storage_items(locations)
    
    print("\n" + "=" * 50)
    print("✅ Test data population complete!")
    print("=" * 50)
    print(f"Created: {len(locations)} locations, {len(recipes)} recipes, {len(events)} events, {len(tools)} tools, {len(storage_items)} storage items")


if __name__ == "__main__":
    main()

# Made with Bob