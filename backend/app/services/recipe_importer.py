"""
Recipe Importer Service
Imports recipes from various cooking websites
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse
import base64
from io import BytesIO


class RecipeImporter:
    """Base class for recipe importers"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def can_import(self, url: str) -> bool:
        """Check if this importer can handle the given URL"""
        raise NotImplementedError
    
    def import_recipe(self, url: str) -> Dict:
        """Import recipe from URL"""
        raise NotImplementedError
    
    def _download_image(self, image_url: str) -> Optional[Tuple[bytes, str]]:
        """Download image and return (image_data, content_type)"""
        try:
            response = requests.get(image_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            content_type = response.headers.get('content-type', 'image/jpeg')
            return response.content, content_type
        except Exception as e:
            print(f"Error downloading image: {e}")
            return None


class ChefkochImporter(RecipeImporter):
    """Importer for Chefkoch.de recipes"""
    
    def can_import(self, url: str) -> bool:
        """Check if URL is from Chefkoch.de"""
        parsed = urlparse(url)
        return 'chefkoch.de' in parsed.netloc.lower()
    
    def import_recipe(self, url: str) -> Dict:
        """Import recipe from Chefkoch.de"""
        try:
            # Fetch the page
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Extract recipe data
            recipe_data = {
                'title': self._extract_title(soup),
                'description': self._extract_description(soup),
                'prep_time': self._extract_prep_time(soup),
                'cook_time': self._extract_cook_time(soup),
                'servings': self._extract_servings(soup),
                'difficulty': self._extract_difficulty(soup),
                'ingredients': self._extract_ingredients(soup),
                'steps': self._extract_steps(soup),
                'image_url': self._extract_image_url(soup),
                'source_url': url,
                'categories': self._extract_categories(soup)
            }
            
            # Download image if available
            if recipe_data['image_url']:
                image_data = self._download_image(recipe_data['image_url'])
                if image_data:
                    recipe_data['image_data'] = image_data[0]
                    recipe_data['image_content_type'] = image_data[1]
            
            return recipe_data
            
        except Exception as e:
            raise Exception(f"Failed to import recipe from Chefkoch.de: {str(e)}")
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract recipe title"""
        # Try h1 tag first
        title_tag = soup.find('h1')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        # Try meta og:title
        meta_title = soup.find('meta', property='og:title')
        if meta_title:
            return meta_title.get('content', '')
        
        return "Imported Recipe"
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract recipe description"""
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '')
        
        # Try og:description
        og_desc = soup.find('meta', property='og:description')
        if og_desc:
            return og_desc.get('content', '')
        
        return ""
    
    def _extract_prep_time(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract preparation time in minutes"""
        # Look for time elements or specific classes
        time_elements = soup.find_all(['time', 'span'], class_=re.compile(r'time|arbeitszeit', re.I))
        for elem in time_elements:
            text = elem.get_text(strip=True).lower()
            # Extract minutes from text like "5 Min." or "15 Minuten"
            match = re.search(r'(\d+)\s*min', text)
            if match:
                return int(match.group(1))
        return None
    
    def _extract_cook_time(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract cooking time in minutes"""
        # Look for cooking time
        time_elements = soup.find_all(['time', 'span'], class_=re.compile(r'koch|gar', re.I))
        for elem in time_elements:
            text = elem.get_text(strip=True).lower()
            match = re.search(r'(\d+)\s*min', text)
            if match:
                return int(match.group(1))
        return None
    
    def _extract_servings(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract number of servings"""
        # Look for servings/portions
        serving_elem = soup.find(['span', 'div'], class_=re.compile(r'portion|serving', re.I))
        if serving_elem:
            text = serving_elem.get_text(strip=True)
            match = re.search(r'(\d+)', text)
            if match:
                return int(match.group(1))
        return 4  # Default
    
    def _extract_difficulty(self, soup: BeautifulSoup) -> str:
        """Extract difficulty level"""
        # Look for difficulty indicator
        diff_elem = soup.find(['span', 'div'], class_=re.compile(r'difficult|schwierigkeit', re.I))
        if diff_elem:
            text = diff_elem.get_text(strip=True).lower()
            if 'simpel' in text or 'einfach' in text or 'easy' in text:
                return 'easy'
            elif 'normal' in text or 'mittel' in text or 'medium' in text:
                return 'medium'
            elif 'schwer' in text or 'hard' in text:
                return 'hard'
        return 'medium'
    
    def _extract_ingredients(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract ingredients list"""
        ingredients = []
        
        # Look for ingredient table or list
        ingredient_container = soup.find(['table', 'div', 'ul'], class_=re.compile(r'ingredient', re.I))
        
        if ingredient_container:
            # Try to find rows or list items
            items = ingredient_container.find_all(['tr', 'li', 'div'], class_=re.compile(r'ingredient', re.I))
            
            for item in items:
                # Extract amount and name
                amount_elem = item.find(['td', 'span'], class_=re.compile(r'amount|menge', re.I))
                name_elem = item.find(['td', 'span'], class_=re.compile(r'name|zutat', re.I))
                
                amount = amount_elem.get_text(strip=True) if amount_elem else ""
                name = name_elem.get_text(strip=True) if name_elem else item.get_text(strip=True)
                
                if name:
                    ingredients.append({
                        'amount': amount,
                        'name': name
                    })
        
        return ingredients
    
    def _extract_steps(self, soup: BeautifulSoup) -> List[str]:
        """Extract preparation steps"""
        steps = []
        
        # Look for instructions/steps container
        steps_container = soup.find(['div', 'ol'], class_=re.compile(r'instruction|preparation|zubereitung|anleitung', re.I))
        
        if steps_container:
            # Try ordered list first
            step_items = steps_container.find_all(['li', 'p', 'div'], recursive=True)
            
            for idx, item in enumerate(step_items, 1):
                text = item.get_text(strip=True)
                # Filter out very short texts (likely not actual steps)
                if text and len(text) > 10:
                    steps.append(text)
        
        return steps
    
    def _extract_image_url(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main recipe image URL"""
        # Try og:image first
        og_image = soup.find('meta', property='og:image')
        if og_image:
            return og_image.get('content')
        
        # Try to find main recipe image
        img = soup.find('img', class_=re.compile(r'recipe|main|hero', re.I))
        if img:
            return img.get('src') or img.get('data-src')
        
        return None
    
    def _extract_categories(self, soup: BeautifulSoup) -> List[str]:
        """Extract recipe categories/tags"""
        categories = []
        
        # Look for category links or tags
        cat_elements = soup.find_all(['a', 'span'], class_=re.compile(r'categor|tag|label', re.I))
        
        for elem in cat_elements:
            text = elem.get_text(strip=True)
            if text and len(text) < 50:  # Reasonable category length
                categories.append(text)
        
        return categories[:5]  # Limit to 5 categories


class RecipeImporterService:
    """Main service for importing recipes from various sources"""
    
    def __init__(self):
        self.importers = [
            ChefkochImporter(),
            # Add more importers here for other websites
        ]
    
    def import_from_url(self, url: str) -> Dict:
        """Import recipe from URL using appropriate importer"""
        for importer in self.importers:
            if importer.can_import(url):
                return importer.import_recipe(url)
        
        raise ValueError(f"No importer available for URL: {url}")
    
    def get_supported_sites(self) -> List[str]:
        """Get list of supported recipe websites"""
        return [
            "Chefkoch.de",
            # Add more as importers are implemented
        ]


# Made with Bob