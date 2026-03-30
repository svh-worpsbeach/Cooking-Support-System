# Recipe Importer Documentation

## Overview

The Recipe Importer allows you to import recipes from supported cooking websites directly into your Cooking Management System. The importer automatically extracts recipe information including title, description, ingredients, preparation steps, and images.

## Supported Websites

### Chefkoch.de
- **URL Pattern**: `https://www.chefkoch.de/rezepte/...`
- **Extracted Data**:
  - Recipe title
  - Description
  - Preparation time
  - Cooking time
  - Number of servings
  - Difficulty level
  - Ingredients list (with amounts)
  - Preparation steps
  - Main recipe image
  - Categories/tags

## API Endpoints

### Import Recipe from URL

**Endpoint**: `POST /api/recipes/import`

**Request**:
```http
POST /api/recipes/import
Content-Type: multipart/form-data

url=https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "name": "Der perfekte Pfannkuchen - gelingt einfach immer",
  "description": "Von Kindern geliebt und auch für Kochneulige super geeignet",
  "prep_time": 5,
  "cook_time": null,
  "servings": 4,
  "difficulty": "easy",
  "categories": [
    {
      "id": 1,
      "category_name": "Pfannkuchen"
    }
  ],
  "ingredients": [
    {
      "id": 1,
      "name": "Mehl",
      "amount": "250 g",
      "unit": "",
      "order_index": 0
    },
    {
      "id": 2,
      "name": "Milch",
      "amount": "500 ml",
      "unit": "",
      "order_index": 1
    }
  ],
  "steps": [
    {
      "id": 1,
      "step_number": 1,
      "content": "Alle Zutaten zu einem glatten Teig verrühren..."
    }
  ],
  "images": [
    {
      "id": 1,
      "filename": "imported_1_abc123.jpg",
      "filepath": "recipes/imported_1_abc123.jpg",
      "is_process_image": true,
      "order_index": 0
    }
  ],
  "title_image_id": 1
}
```

### Get Supported Sites

**Endpoint**: `GET /api/recipes/import/supported-sites`

**Response**: `200 OK`
```json
{
  "supported_sites": [
    "Chefkoch.de"
  ],
  "example_urls": [
    "https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html"
  ]
}
```

## Usage Examples

### Using cURL

```bash
# Import a recipe from Chefkoch.de
curl -X POST "http://localhost:8000/api/recipes/import" \
  -F "url=https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html"

# Get supported sites
curl "http://localhost:8000/api/recipes/import/supported-sites"
```

### Using Python

```python
import requests

# Import recipe
url = "http://localhost:8000/api/recipes/import"
data = {
    "url": "https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html"
}
response = requests.post(url, data=data)
recipe = response.json()
print(f"Imported: {recipe['name']}")
```

### Using JavaScript/Fetch

```javascript
// Import recipe
const formData = new FormData();
formData.append('url', 'https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html');

fetch('http://localhost:8000/api/recipes/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(recipe => {
  console.log('Imported:', recipe.name);
})
.catch(error => console.error('Error:', error));
```

## Implementation Details

### Architecture

The importer uses a modular architecture with:

1. **RecipeImporter** (Base Class): Abstract base class for all importers
2. **ChefkochImporter**: Specific implementation for Chefkoch.de
3. **RecipeImporterService**: Main service that routes URLs to appropriate importers

### Adding New Importers

To add support for a new website:

1. Create a new importer class in `backend/app/services/recipe_importer.py`:

```python
class NewSiteImporter(RecipeImporter):
    def can_import(self, url: str) -> bool:
        parsed = urlparse(url)
        return 'newsite.com' in parsed.netloc.lower()
    
    def import_recipe(self, url: str) -> Dict:
        # Implement extraction logic
        pass
```

2. Register the importer in `RecipeImporterService`:

```python
def __init__(self):
    self.importers = [
        ChefkochImporter(),
        NewSiteImporter(),  # Add here
    ]
```

### Web Scraping Strategy

The importer uses BeautifulSoup4 with lxml parser for HTML parsing:

- **Robust Selectors**: Uses regex patterns to find elements by class names
- **Fallback Mechanisms**: Multiple strategies for finding data (meta tags, structured data, etc.)
- **Error Handling**: Graceful degradation if certain data is not available

### Image Handling

Images are:
1. Downloaded from the source website
2. Saved to the local filesystem
3. Automatically resized to create thumbnails
4. Linked to the recipe in the database

## Error Handling

### Common Errors

**400 Bad Request**: Unsupported website
```json
{
  "detail": "No importer available for URL: https://unsupported-site.com/recipe"
}
```

**500 Internal Server Error**: Import failed
```json
{
  "detail": "Failed to import recipe: Connection timeout"
}
```

### Troubleshooting

1. **Website Structure Changed**: Update the CSS selectors in the importer
2. **Connection Issues**: Check network connectivity and website availability
3. **Image Download Failed**: Recipe will be imported without image (warning logged)

## Dependencies

Required Python packages:
- `beautifulsoup4>=4.12.0` - HTML parsing
- `lxml>=5.0.0` - Fast XML/HTML parser
- `requests>=2.31.0` - HTTP requests
- `pillow>=10.3.0` - Image processing

## Limitations

- Only publicly accessible recipes can be imported
- Some websites may block automated scraping
- Recipe formatting may vary depending on source website
- Not all recipe metadata may be available on all sites

## Future Enhancements

Planned features:
- Support for more cooking websites (AllRecipes, Food Network, etc.)
- Batch import from multiple URLs
- Import from recipe JSON-LD structured data
- Import from PDF files
- Import from images using OCR

## Legal Considerations

When importing recipes:
- Respect website terms of service
- Attribute the source (source_url is stored)
- Don't overload servers with requests
- Consider copyright and fair use

---

*Made with Bob*