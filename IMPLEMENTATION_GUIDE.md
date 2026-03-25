# Cookies Support System - Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the Cookies Support System based on the architecture defined in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

## Phase 1: Backend Setup

### Step 1: Initialize Backend Project

```bash
# Create backend directory
mkdir -p backend
cd backend

# Initialize Poetry project
poetry init --name cooking-api --python "^3.11"

# Add dependencies
poetry add fastapi uvicorn sqlalchemy sqlite3 python-multipart pillow pydantic-settings
poetry add --group dev pytest black flake8 mypy

# Create project structure
mkdir -p app/{models,schemas,routers,services}
mkdir -p uploads/{recipes,tools}
mkdir -p tests

# Create __init__.py files
touch app/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/routers/__init__.py
touch app/services/__init__.py
```

### Step 2: Database Configuration

Create [`backend/app/database.py`](backend/app/database.py):
- Set up SQLAlchemy engine with SQLite
- Create SessionLocal for database sessions
- Define Base for declarative models
- Implement get_db dependency for FastAPI

### Step 3: Create Database Models

#### Location Model ([`backend/app/models/location.py`](backend/app/models/location.py))
```python
class Location(Base):
    __tablename__ = "locations"
    
    id: int (primary key)
    name: str (unique, indexed)
    description: str (optional)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    tools: List[CookingTool]
    storage_items: List[StorageItem]
```

#### Recipe Models ([`backend/app/models/recipe.py`](backend/app/models/recipe.py))
```python
class Recipe(Base):
    __tablename__ = "recipes"
    
    id: int (primary key)
    name: str (indexed)
    description: text
    title_image_id: int (foreign key, optional)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    categories: List[RecipeCategory]
    ingredients: List[RecipeIngredient]
    steps: List[RecipeStep]
    images: List[RecipeImage]
    title_image: RecipeImage

class RecipeCategory(Base):
    __tablename__ = "recipe_categories"
    
    id: int (primary key)
    recipe_id: int (foreign key)
    category_name: str
    
class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    id: int (primary key)
    recipe_id: int (foreign key)
    name: str
    description: str
    amount: float
    unit: str
    order_index: int
    
class RecipeStep(Base):
    __tablename__ = "recipe_steps"
    
    id: int (primary key)
    recipe_id: int (foreign key)
    step_number: int
    content: text
    created_at: datetime
    
    # Relationships
    ingredient_refs: List[StepIngredientRef]
    storage_refs: List[StepStorageRef]

class RecipeImage(Base):
    __tablename__ = "recipe_images"
    
    id: int (primary key)
    recipe_id: int (foreign key)
    filename: str
    filepath: str
    is_process_image: bool
    order_index: int
    created_at: datetime

class StepIngredientRef(Base):
    __tablename__ = "step_ingredient_refs"
    
    id: int (primary key)
    step_id: int (foreign key)
    ingredient_id: int (foreign key)

class StepStorageRef(Base):
    __tablename__ = "step_storage_refs"
    
    id: int (primary key)
    step_id: int (foreign key)
    storage_item_id: int (foreign key)
```

#### Event Models ([`backend/app/models/event.py`](backend/app/models/event.py))
```python
class Event(Base):
    __tablename__ = "events"
    
    id: int (primary key)
    name: str
    description: text
    theme: str
    event_date: datetime
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    participants: List[EventParticipant]
    courses: List[EventCourse]
    shopping_list: ShoppingList

class EventParticipant(Base):
    __tablename__ = "event_participants"
    
    id: int (primary key)
    event_id: int (foreign key)
    name: str
    dietary_restrictions: text

class EventCourse(Base):
    __tablename__ = "event_courses"
    
    id: int (primary key)
    event_id: int (foreign key)
    course_number: int
    course_name: str
    
    # Relationships
    recipes: List[CourseRecipe]

class CourseRecipe(Base):
    __tablename__ = "course_recipes"
    
    id: int (primary key)
    course_id: int (foreign key)
    recipe_id: int (foreign key)

class ShoppingList(Base):
    __tablename__ = "shopping_lists"
    
    id: int (primary key)
    event_id: int (foreign key)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    items: List[ShoppingListItem]

class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"
    
    id: int (primary key)
    shopping_list_id: int (foreign key)
    item_name: str
    quantity: float
    unit: str
    is_purchased: bool
    source: str (e.g., "recipe", "manual")
```

#### Tool Models ([`backend/app/models/tool.py`](backend/app/models/tool.py))
```python
class CookingTool(Base):
    __tablename__ = "cooking_tools"
    
    id: int (primary key)
    location_id: int (foreign key)
    name: str
    description: text
    image_path: str (optional)
    storage_location: str
    created_at: datetime
    updated_at: datetime

class ToolWishlist(Base):
    __tablename__ = "tool_wishlist"
    
    id: int (primary key)
    name: str
    description: text
    url: str (optional)
    estimated_price: float (optional)
    priority: int (1-5)
    created_at: datetime
```

#### Storage Models ([`backend/app/models/storage.py`](backend/app/models/storage.py))
```python
class StorageItem(Base):
    __tablename__ = "storage_items"
    
    id: int (primary key)
    location_id: int (foreign key)
    name: str
    category: str (e.g., "herb", "spice", "flavor")
    quantity: float
    unit: str
    expiry_date: datetime (optional)
    created_at: datetime
    updated_at: datetime
```

### Step 4: Create Pydantic Schemas

Create schemas for request/response validation in [`backend/app/schemas/`](backend/app/schemas/):
- Base schemas with common fields
- Create schemas (without id)
- Update schemas (partial updates)
- Response schemas (with id and timestamps)

### Step 5: Implement API Routers

#### Recipe Router ([`backend/app/routers/recipes.py`](backend/app/routers/recipes.py))
```python
@router.get("/recipes")
async def list_recipes(skip: int = 0, limit: int = 100, category: str = None)

@router.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: int)

@router.post("/recipes")
async def create_recipe(recipe: RecipeCreate)

@router.put("/recipes/{recipe_id}")
async def update_recipe(recipe_id: int, recipe: RecipeUpdate)

@router.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: int)

@router.post("/recipes/{recipe_id}/images")
async def upload_recipe_image(recipe_id: int, file: UploadFile)

@router.delete("/recipes/{recipe_id}/images/{image_id}")
async def delete_recipe_image(recipe_id: int, image_id: int)

@router.put("/recipes/{recipe_id}/title-image")
async def set_title_image(recipe_id: int, image_id: int)

@router.get("/categories")
async def list_categories()
```

#### Event Router ([`backend/app/routers/events.py`](backend/app/routers/events.py))
```python
@router.get("/events")
async def list_events(skip: int = 0, limit: int = 100)

@router.get("/events/{event_id}")
async def get_event(event_id: int)

@router.post("/events")
async def create_event(event: EventCreate)

@router.put("/events/{event_id}")
async def update_event(event_id: int, event: EventUpdate)

@router.delete("/events/{event_id}")
async def delete_event(event_id: int)

@router.get("/events/{event_id}/shopping-list")
async def get_shopping_list(event_id: int)

@router.post("/events/{event_id}/shopping-list/items")
async def add_shopping_list_item(event_id: int, item: ShoppingListItemCreate)

@router.put("/events/{event_id}/shopping-list/items/{item_id}")
async def update_shopping_list_item(event_id: int, item_id: int, item: ShoppingListItemUpdate)

@router.delete("/events/{event_id}/shopping-list/items/{item_id}")
async def delete_shopping_list_item(event_id: int, item_id: int)
```

#### Tools Router ([`backend/app/routers/tools.py`](backend/app/routers/tools.py))
```python
@router.get("/tools")
async def list_tools(location_id: int = None)

@router.get("/tools/{tool_id}")
async def get_tool(tool_id: int)

@router.post("/tools")
async def create_tool(tool: ToolCreate)

@router.put("/tools/{tool_id}")
async def update_tool(tool_id: int, tool: ToolUpdate)

@router.delete("/tools/{tool_id}")
async def delete_tool(tool_id: int)

@router.get("/tools/wishlist")
async def list_wishlist()

@router.post("/tools/wishlist")
async def add_to_wishlist(item: WishlistItemCreate)

@router.put("/tools/wishlist/{item_id}")
async def update_wishlist_item(item_id: int, item: WishlistItemUpdate)

@router.delete("/tools/wishlist/{item_id}")
async def delete_wishlist_item(item_id: int)
```

#### Storage Router ([`backend/app/routers/storage.py`](backend/app/routers/storage.py))
```python
@router.get("/storage")
async def list_storage_items(location_id: int = None, category: str = None)

@router.get("/storage/{item_id}")
async def get_storage_item(item_id: int)

@router.post("/storage")
async def create_storage_item(item: StorageItemCreate)

@router.put("/storage/{item_id}")
async def update_storage_item(item_id: int, item: StorageItemUpdate)

@router.delete("/storage/{item_id}")
async def delete_storage_item(item_id: int)

@router.post("/storage/check-availability")
async def check_availability(ingredients: List[IngredientCheck])

@router.post("/storage/add-to-shopping-list")
async def add_to_shopping_list(event_id: int, items: List[str])
```

#### Locations Router ([`backend/app/routers/locations.py`](backend/app/routers/locations.py))
```python
@router.get("/locations")
async def list_locations()

@router.post("/locations")
async def create_location(location: LocationCreate)

@router.put("/locations/{location_id}")
async def update_location(location_id: int, location: LocationUpdate)

@router.delete("/locations/{location_id}")
async def delete_location(location_id: int)
```

### Step 6: Implement Services

#### File Service ([`backend/app/services/file_service.py`](backend/app/services/file_service.py))
```python
class FileService:
    def save_image(file: UploadFile, category: str) -> str
    def delete_image(filepath: str) -> bool
    def generate_thumbnail(filepath: str, size: tuple) -> str
    def get_image_url(filepath: str) -> str
```

#### Shopping List Service ([`backend/app/services/shopping_list_service.py`](backend/app/services/shopping_list_service.py))
```python
class ShoppingListService:
    def check_ingredient_availability(ingredient: str, location_id: int) -> bool
    def add_missing_ingredients_to_list(event_id: int, recipe_id: int) -> List[ShoppingListItem]
    def generate_shopping_list_from_event(event_id: int) -> ShoppingList
```

### Step 7: Main Application Setup

Create [`backend/app/main.py`](backend/app/main.py):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Cookies Support System API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(storage.router, prefix="/api", tags=["storage"])
app.include_router(locations.router, prefix="/api", tags=["locations"])

@app.on_event("startup")
async def startup():
    # Create database tables
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Cookies Support System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Phase 2: Frontend Setup

### Step 1: Initialize Frontend Project

```bash
# Create frontend directory
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios react-query react-i18next i18next
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react # for icons

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Step 2: Configure Tailwind CSS

Update [`frontend/tailwind.config.js`](frontend/tailwind.config.js):
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
    },
  },
  plugins: [],
}
```

### Step 3: Set Up i18n

Create [`frontend/src/i18n.ts`](frontend/src/i18n.ts):
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import de from './locales/de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

Create translation files:
- [`frontend/src/locales/en.json`](frontend/src/locales/en.json)
- [`frontend/src/locales/de.json`](frontend/src/locales/de.json)

### Step 4: Set Up API Client

Create [`frontend/src/services/api.ts`](frontend/src/services/api.ts):
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Recipe API
export const recipeApi = {
  list: (params?) => api.get('/recipes', { params }),
  get: (id: number) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id: number, data) => api.put(`/recipes/${id}`, data),
  delete: (id: number) => api.delete(`/recipes/${id}`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/recipes/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Similar for events, tools, storage, locations
```

### Step 5: Create Type Definitions

Create [`frontend/src/types/index.ts`](frontend/src/types/index.ts):
```typescript
export interface Recipe {
  id: number;
  name: string;
  description: string;
  categories: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  images: RecipeImage[];
  title_image_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string;
  amount: number;
  unit: string;
  order_index: number;
}

// Similar for other entities
```

### Step 6: Create Common Components

#### Button Component ([`frontend/src/components/common/Button.tsx`](frontend/src/components/common/Button.tsx))
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
```

#### Input Component ([`frontend/src/components/common/Input.tsx`](frontend/src/components/common/Input.tsx))
#### Modal Component ([`frontend/src/components/common/Modal.tsx`](frontend/src/components/common/Modal.tsx))
#### Card Component ([`frontend/src/components/common/Card.tsx`](frontend/src/components/common/Card.tsx))
#### ImageUpload Component ([`frontend/src/components/common/ImageUpload.tsx`](frontend/src/components/common/ImageUpload.tsx))

### Step 7: Create Layout Components

#### Navigation ([`frontend/src/components/layout/Navigation.tsx`](frontend/src/components/layout/Navigation.tsx))
- Logo
- Menu items (Recipes, Events, Tools, Storage)
- Language switcher
- Mobile menu toggle

#### Layout ([`frontend/src/components/layout/Layout.tsx`](frontend/src/components/layout/Layout.tsx))
- Navigation
- Main content area
- Footer

### Step 8: Create Feature Components

#### Recipe Components
- [`RecipeList.tsx`](frontend/src/components/recipes/RecipeList.tsx) - Grid of recipe cards
- [`RecipeCard.tsx`](frontend/src/components/recipes/RecipeCard.tsx) - Individual recipe preview
- [`RecipeDetail.tsx`](frontend/src/components/recipes/RecipeDetail.tsx) - Full recipe view
- [`RecipeForm.tsx`](frontend/src/components/recipes/RecipeForm.tsx) - Create/edit recipe
- [`IngredientForm.tsx`](frontend/src/components/recipes/IngredientForm.tsx) - Manage ingredients
- [`StepEditor.tsx`](frontend/src/components/recipes/StepEditor.tsx) - Edit recipe steps
- [`ImageGallery.tsx`](frontend/src/components/recipes/ImageGallery.tsx) - View recipe images

#### Event Components
- [`EventList.tsx`](frontend/src/components/events/EventList.tsx)
- [`EventCard.tsx`](frontend/src/components/events/EventCard.tsx)
- [`EventDetail.tsx`](frontend/src/components/events/EventDetail.tsx)
- [`EventForm.tsx`](frontend/src/components/events/EventForm.tsx)
- [`CourseEditor.tsx`](frontend/src/components/events/CourseEditor.tsx)
- [`ShoppingList.tsx`](frontend/src/components/events/ShoppingList.tsx)

#### Tool Components
- [`ToolList.tsx`](frontend/src/components/tools/ToolList.tsx)
- [`ToolCard.tsx`](frontend/src/components/tools/ToolCard.tsx)
- [`ToolForm.tsx`](frontend/src/components/tools/ToolForm.tsx)
- [`Wishlist.tsx`](frontend/src/components/tools/Wishlist.tsx)

#### Storage Components
- [`StorageList.tsx`](frontend/src/components/storage/StorageList.tsx)
- [`StorageCard.tsx`](frontend/src/components/storage/StorageCard.tsx)
- [`StorageForm.tsx`](frontend/src/components/storage/StorageForm.tsx)

### Step 9: Set Up Routing

Create [`frontend/src/App.tsx`](frontend/src/App.tsx):
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
          {/* Similar routes for events, tools, storage */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

## Phase 3: Integration & Testing

### Backend Testing
```bash
cd backend
poetry run pytest tests/ -v --cov=app
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Create a recipe with ingredients and steps
- [ ] Upload multiple images to a recipe
- [ ] Set title image for a recipe
- [ ] Create an event with multiple courses
- [ ] Add recipes to event courses
- [ ] Generate shopping list from event
- [ ] Add tools to different locations
- [ ] Add items to tool wishlist
- [ ] Add storage items to locations
- [ ] Check ingredient availability
- [ ] Test language switching
- [ ] Test on Safari iOS
- [ ] Test on Safari iPadOS
- [ ] Test on Safari macOS

## Phase 4: Deployment

### Backend Deployment
```bash
# Create Dockerfile
# Build and run container
docker build -t cooking-api .
docker run -p 8000:8000 -v ./data:/app/data cooking-api
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, etc.)
```

## Development Commands

### Backend
```bash
# Run development server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
poetry run pytest

# Format code
poetry run black app/

# Type checking
poetry run mypy app/
```

### Frontend
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint
npm run lint
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Check CORS configuration in [`backend/app/main.py`](backend/app/main.py)
2. **Database locked**: Ensure only one process accesses SQLite at a time
3. **Image upload fails**: Check file permissions on uploads directory
4. **i18n not working**: Verify translation files are loaded correctly
5. **Safari-specific issues**: Test with Safari Web Inspector

## Next Steps

After completing the implementation:
1. Add user authentication
2. Implement data backup/restore
3. Add recipe import/export
4. Create mobile app with React Native
5. Add offline support with PWA
6. Implement recipe recommendations
7. Add nutrition tracking
8. Create print-friendly views