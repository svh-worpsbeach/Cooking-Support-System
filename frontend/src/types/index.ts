// Location types
export interface Location {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationCreate {
  name: string;
  description?: string;
}

// Recipe types
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  title_image_id?: number;
  created_at: string;
  updated_at: string;
  categories: RecipeCategory[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  images: RecipeImage[];
}

export interface RecipeCategory {
  id: number;
  recipe_id: number;
  category_name: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  name: string;
  description?: string;
  amount?: number;
  unit?: string;
  order_index: number;
}

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  content: string;
  step_image_id?: number;
  created_at: string;
  ingredient_refs: StepIngredientRef[];
  storage_refs: StepStorageRef[];
  step_image?: RecipeImage;
}

export interface RecipeImage {
  id: number;
  recipe_id: number;
  filename: string;
  filepath: string;
  is_process_image: boolean;
  order_index: number;
  created_at: string;
}

export interface StepIngredientRef {
  id: number;
  step_id: number;
  ingredient_id: number;
}

export interface StepStorageRef {
  id: number;
  step_id: number;
  storage_item_id: number;
}

export interface RecipeCreate {
  name: string;
  description?: string;
  categories?: string[];
  ingredients?: Omit<RecipeIngredient, 'id' | 'recipe_id'>[];
  steps?: Omit<RecipeStep, 'id' | 'recipe_id' | 'created_at' | 'ingredient_refs' | 'storage_refs'>[];
}

// Event types
export interface Event {
  id: number;
  name: string;
  description?: string;
  theme?: string;
  event_date?: string;
  created_at: string;
  updated_at: string;
  participants: EventParticipant[];
  courses: EventCourse[];
  shopping_list?: ShoppingList;
}

export interface EventParticipant {
  id: number;
  event_id: number;
  name: string;
  dietary_restrictions?: string;
}

export interface EventCourse {
  id: number;
  event_id: number;
  course_number: number;
  course_name: string;
  recipes: CourseRecipe[];
}

export interface CourseRecipe {
  id: number;
  course_id: number;
  recipe_id: number;
  recipe?: Recipe;
}

export interface ShoppingList {
  id: number;
  event_id: number;
  created_at: string;
  updated_at: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  item_name: string;
  quantity?: number;
  unit?: string;
  is_purchased: boolean;
  source?: string;
}

export interface EventCreate {
  name: string;
  description?: string;
  theme?: string;
  event_date?: string;
  participants?: Omit<EventParticipant, 'id' | 'event_id'>[];
  courses?: Omit<EventCourse, 'id' | 'event_id' | 'recipes'>[];
}

// Tool types
export interface CookingTool {
  id: number;
  location_id?: number;
  name: string;
  description?: string;
  image_path?: string;
  storage_location?: string;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface ToolWishlist {
  id: number;
  name: string;
  description?: string;
  url?: string;
  estimated_price?: number;
  priority: number;
  created_at: string;
}

export interface CookingToolCreate {
  location_id?: number;
  name: string;
  description?: string;
  storage_location?: string;
}

export interface ToolWishlistCreate {
  name: string;
  description?: string;
  url?: string;
  estimated_price?: number;
  priority?: number;
}

// Storage types
export interface StorageItem {
  id: number;
  location_id?: number;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface StorageItemCreate {
  location_id?: number;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  expiry_date?: string;
}

// API Response types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Made with Bob
