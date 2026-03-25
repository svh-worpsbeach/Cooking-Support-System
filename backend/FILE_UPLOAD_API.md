# File Upload Service API Documentation

## Overview

The File Upload Service provides a centralized system for handling image uploads in the Cooking Management System. It includes automatic thumbnail generation, file validation, and organized storage.

## Features

- **Automatic Thumbnail Generation**: Creates 300x300px thumbnails for all uploaded images
- **File Validation**: Validates file types and sizes before upload
- **Organized Storage**: Separates files by category (recipes, tools)
- **Unique Filenames**: Uses UUID to prevent filename conflicts
- **Safe Deletion**: Removes both original images and thumbnails

## Supported File Types

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

## File Size Limit

Maximum file size: **10MB**

## Directory Structure

```
uploads/
├── recipes/
│   ├── thumbnails/
│   └── [image files]
└── tools/
    ├── thumbnails/
    └── [image files]
```

## API Endpoints

### Recipe Image Endpoints

#### Upload Recipe Image

Upload an image for a recipe with automatic thumbnail generation.

**Endpoint:** `POST /api/recipes/{recipe_id}/images`

**Parameters:**
- `recipe_id` (path, required): Recipe ID
- `file` (form-data, required): Image file to upload
- `is_process_image` (form-data, optional): Whether this is a process image (default: false)
- `order_index` (form-data, optional): Display order index (default: 0)

**Request:**
```bash
curl -X POST "http://localhost:8000/api/recipes/1/images" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@recipe_image.jpg" \
  -F "is_process_image=false" \
  -F "order_index=0"
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "recipe_id": 1,
  "filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "filepath": "recipes/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "is_process_image": false,
  "order_index": 0,
  "created_at": "2026-03-24T10:00:00Z"
}
```

#### Get Recipe Image URL

Get the URL for a recipe image or its thumbnail.

**Endpoint:** `GET /api/recipes/{recipe_id}/images/{image_id}/url`

**Parameters:**
- `recipe_id` (path, required): Recipe ID
- `image_id` (path, required): Image ID
- `thumbnail` (query, optional): Return thumbnail URL if true (default: false)

**Request:**
```bash
curl "http://localhost:8000/api/recipes/1/images/1/url?thumbnail=true"
```

**Response:** `200 OK`
```json
{
  "url": "/uploads/recipes/thumbnails/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
}
```

#### Delete Recipe Image

Delete a recipe image and its thumbnail.

**Endpoint:** `DELETE /api/recipes/{recipe_id}/images/{image_id}`

**Parameters:**
- `recipe_id` (path, required): Recipe ID
- `image_id` (path, required): Image ID

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/recipes/1/images/1"
```

**Response:** `204 No Content`

#### Set Recipe Title Image

Set the title image for a recipe.

**Endpoint:** `PUT /api/recipes/{recipe_id}/title-image`

**Parameters:**
- `recipe_id` (path, required): Recipe ID
- `image_id` (query, required): Image ID to set as title

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/recipes/1/title-image?image_id=1"
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake",
  "title_image_id": 1,
  "created_at": "2026-03-24T10:00:00Z",
  "updated_at": "2026-03-24T10:30:00Z"
}
```

### Tool Image Endpoints

#### Upload Tool Image

Upload an image for a cooking tool with automatic thumbnail generation.

**Endpoint:** `POST /api/tools/{tool_id}/image`

**Parameters:**
- `tool_id` (path, required): Tool ID
- `file` (form-data, required): Image file to upload

**Request:**
```bash
curl -X POST "http://localhost:8000/api/tools/1/image" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@tool_image.jpg"
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Chef's Knife",
  "description": "Professional chef's knife",
  "location_id": 1,
  "storage_location": "Drawer 1",
  "image_path": "tools/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg",
  "created_at": "2026-03-24T10:00:00Z",
  "updated_at": "2026-03-24T10:30:00Z"
}
```

#### Get Tool Image URL

Get the URL for a tool's image or its thumbnail.

**Endpoint:** `GET /api/tools/{tool_id}/image/url`

**Parameters:**
- `tool_id` (path, required): Tool ID
- `thumbnail` (query, optional): Return thumbnail URL if true (default: false)

**Request:**
```bash
curl "http://localhost:8000/api/tools/1/image/url?thumbnail=true"
```

**Response:** `200 OK`
```json
{
  "url": "/uploads/tools/thumbnails/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg"
}
```

#### Delete Tool Image

Delete a cooking tool's image and its thumbnail.

**Endpoint:** `DELETE /api/tools/{tool_id}/image`

**Parameters:**
- `tool_id` (path, required): Tool ID

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/tools/1/image"
```

**Response:** `204 No Content`

## File Service Class

### FileService

The `FileService` class provides the core functionality for file uploads.

#### Methods

##### `save_upload(file, category, create_thumbnail=True)`

Save an uploaded file and optionally create a thumbnail.

**Parameters:**
- `file` (UploadFile): The uploaded file
- `category` (str): Category ('recipes' or 'tools')
- `create_thumbnail` (bool): Whether to create a thumbnail (default: True)

**Returns:**
- Tuple[str, str]: (filename, filepath)

**Raises:**
- `HTTPException(400)`: Invalid file type or size
- `HTTPException(500)`: File save failed

##### `delete_file(filepath, category)`

Delete a file and its thumbnail.

**Parameters:**
- `filepath` (str): Relative filepath
- `category` (str): Category ('recipes' or 'tools')

**Returns:**
- bool: True if successful, False otherwise

##### `get_file_url(filepath)`

Get the URL for accessing a file.

**Parameters:**
- `filepath` (str): Relative filepath

**Returns:**
- str: URL path for the file

##### `get_thumbnail_url(filepath)`

Get the URL for accessing a thumbnail.

**Parameters:**
- `filepath` (str): Relative filepath of the original image

**Returns:**
- Optional[str]: URL path for the thumbnail, or None if it doesn't exist

## Error Responses

### 400 Bad Request

**Invalid File Type:**
```json
{
  "detail": "File type .txt not allowed. Allowed types: .jpg, .jpeg, .png, .gif, .webp"
}
```

**File Too Large:**
```json
{
  "detail": "File too large. Maximum size: 10.0MB"
}
```

**No Filename:**
```json
{
  "detail": "No filename provided"
}
```

### 404 Not Found

**Recipe Not Found:**
```json
{
  "detail": "Recipe with id 1 not found"
}
```

**Image Not Found:**
```json
{
  "detail": "Image with id 1 not found in recipe 1"
}
```

**Tool Not Found:**
```json
{
  "detail": "Tool with id 1 not found"
}
```

**No Image:**
```json
{
  "detail": "Tool has no image"
}
```

### 500 Internal Server Error

**File Save Failed:**
```json
{
  "detail": "Failed to save file: [error message]"
}
```

## Usage Examples

### Python (requests)

```python
import requests

# Upload recipe image
with open('recipe_image.jpg', 'rb') as f:
    files = {'file': f}
    data = {'is_process_image': False, 'order_index': 0}
    response = requests.post(
        'http://localhost:8000/api/recipes/1/images',
        files=files,
        data=data
    )
    print(response.json())

# Get thumbnail URL
response = requests.get(
    'http://localhost:8000/api/recipes/1/images/1/url',
    params={'thumbnail': True}
)
print(response.json())
```

### JavaScript (fetch)

```javascript
// Upload tool image
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/tools/1/image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);

// Get image URL
const urlResponse = await fetch(
  'http://localhost:8000/api/tools/1/image/url?thumbnail=true'
);
const urlData = await urlResponse.json();
console.log(urlData.url);
```

### cURL

```bash
# Upload recipe image
curl -X POST "http://localhost:8000/api/recipes/1/images" \
  -F "file=@recipe_image.jpg" \
  -F "is_process_image=false" \
  -F "order_index=0"

# Get thumbnail URL
curl "http://localhost:8000/api/recipes/1/images/1/url?thumbnail=true"

# Delete image
curl -X DELETE "http://localhost:8000/api/recipes/1/images/1"

# Upload tool image
curl -X POST "http://localhost:8000/api/tools/1/image" \
  -F "file=@tool_image.jpg"
```

## Best Practices

1. **Always validate file types on the client side** before uploading to improve user experience
2. **Use thumbnails for list views** to improve performance
3. **Handle upload errors gracefully** and provide user feedback
4. **Delete old images** when uploading new ones to prevent storage bloat
5. **Use appropriate image formats**: JPEG for photos, PNG for graphics with transparency
6. **Optimize images before upload** to reduce file size and upload time

## Security Considerations

1. **File Type Validation**: Only allowed image types can be uploaded
2. **File Size Limits**: Maximum 10MB per file
3. **Unique Filenames**: UUID-based naming prevents conflicts and path traversal
4. **Isolated Storage**: Files are stored in dedicated directories
5. **No Executable Files**: Only image files are accepted

## Performance Tips

1. **Use thumbnails** for list views and galleries
2. **Lazy load images** in the frontend
3. **Implement caching** for frequently accessed images
4. **Consider CDN** for production deployments
5. **Compress images** before upload when possible

## Troubleshooting

### Upload Fails with 400 Error

- Check file type is supported
- Verify file size is under 10MB
- Ensure filename is provided

### Thumbnail Not Generated

- Check PIL/Pillow is installed
- Verify write permissions on uploads directory
- Check server logs for errors

### Image Not Accessible

- Verify static files are mounted correctly in main.py
- Check file exists in uploads directory
- Ensure correct URL path is used

## Made with Bob