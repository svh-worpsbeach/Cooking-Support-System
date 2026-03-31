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
import logging

# Configure logging
logger = logging.getLogger(__name__)


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
        logger.info("=" * 80)
        logger.info(f"RECIPE IMPORT STARTED: {url}")
        logger.info("=" * 80)
        
        try:
            # Fetch the page
            logger.info("Fetching recipe page...")
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            logger.info(f"✓ Page fetched successfully (status: {response.status_code})")
            
            logger.info("Parsing HTML content...")
            soup = BeautifulSoup(response.content, 'lxml')
            logger.info("✓ HTML parsed successfully")
            
            # Extract recipe data
            logger.info("Extracting recipe data...")
            
            title = self._extract_title(soup)
            logger.debug(f"  Title: {title}")
            
            description = self._extract_description(soup)
            logger.debug(f"  Description: {description[:100] if description else 'None'}...")
            
            prep_time = self._extract_prep_time(soup)
            logger.debug(f"  Prep time: {prep_time} min")
            
            cook_time = self._extract_cook_time(soup)
            logger.debug(f"  Cook time: {cook_time} min")
            
            servings = self._extract_servings(soup)
            logger.debug(f"  Servings: {servings}")
            
            difficulty = self._extract_difficulty(soup)
            logger.debug(f"  Difficulty: {difficulty}")
            
            ingredients = self._extract_ingredients(soup)
            logger.info(f"  ✓ Extracted {len(ingredients)} ingredients")
            for i, ing in enumerate(ingredients[:3], 1):
                logger.debug(f"    {i}. {ing['amount']} {ing['name']}")
            if len(ingredients) > 3:
                logger.debug(f"    ... and {len(ingredients) - 3} more")
            
            steps = self._extract_steps(soup)
            logger.info(f"  ✓ Extracted {len(steps)} preparation steps")
            for i, step in enumerate(steps[:2], 1):
                logger.debug(f"    Step {i}: {step[:80]}...")
            if len(steps) > 2:
                logger.debug(f"    ... and {len(steps) - 2} more steps")
            
            image_url = self._extract_image_url(soup)
            logger.debug(f"  Image URL: {image_url}")
            
            categories = self._extract_categories(soup)
            logger.debug(f"  Categories: {', '.join(categories) if categories else 'None'}")
            
            recipe_data = {
                'title': title,
                'description': description,
                'prep_time': prep_time,
                'cook_time': cook_time,
                'servings': servings,
                'difficulty': difficulty,
                'ingredients': ingredients,
                'steps': steps,
                'image_url': image_url,
                'source_url': url,
                'categories': categories
            }
            
            # Download image if available
            if recipe_data['image_url']:
                logger.info("Downloading recipe image...")
                image_data = self._download_image(recipe_data['image_url'])
                if image_data:
                    recipe_data['image_data'] = image_data[0]
                    recipe_data['image_content_type'] = image_data[1]
                    logger.info(f"✓ Image downloaded ({len(image_data[0])} bytes)")
                else:
                    logger.warning("✗ Failed to download image")
            
            logger.info("=" * 80)
            logger.info("✓ RECIPE IMPORT COMPLETED SUCCESSFULLY")
            logger.info("=" * 80)
            return recipe_data
            
        except Exception as e:
            logger.error("=" * 80)
            logger.error(f"✗ RECIPE IMPORT FAILED: {str(e)}")
            logger.error("=" * 80)
            raise Exception(f"Failed to import recipe from Chefkoch.de: {str(e)}")
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract recipe title from header section"""
        # Look for h1 in header
        header = soup.find('header')
        if header:
            title_tag = header.find('h1')
            if title_tag:
                return title_tag.get_text(strip=True)
        
        # Fallback to any h1
        title_tag = soup.find('h1')
        if title_tag:
            return title_tag.get_text(strip=True)
        
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
        """Extract preparation time (Arbeitszeit) in minutes"""
        # Look for ds-preparation-times section
        prep_times = soup.find('div', class_='ds-preparation-times')
        if prep_times:
            # Find Arbeitszeit
            for elem in prep_times.find_all(['span', 'div', 'time']):
                text = elem.get_text(strip=True)
                if 'arbeitszeit' in text.lower():
                    # Look for time in this element or next sibling
                    match = re.search(r'(\d+)\s*(?:min|std)', text, re.I)
                    if match:
                        time_val = int(match.group(1))
                        # Check if it's hours (Std.)
                        if 'std' in text.lower():
                            return time_val * 60
                        return time_val
        return None
    
    def _extract_cook_time(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract cooking/baking time (Koch-/Backzeit) in minutes"""
        # Look for ds-preparation-times section
        prep_times = soup.find('div', class_='ds-preparation-times')
        if prep_times:
            # Find Koch-/Backzeit
            for elem in prep_times.find_all(['span', 'div', 'time']):
                text = elem.get_text(strip=True)
                if 'koch' in text.lower() or 'back' in text.lower():
                    # Look for time in this element or next sibling
                    match = re.search(r'(\d+)\s*(?:min|std)', text, re.I)
                    if match:
                        time_val = int(match.group(1))
                        # Check if it's hours (Std.)
                        if 'std' in text.lower():
                            return time_val * 60
                        return time_val
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
        """Extract ingredients from ds-ingredients-table"""
        ingredients = []
        
        # Look for ds-ingredients-table
        ingredient_table = soup.find('table', class_='ds-ingredients-table')
        
        if ingredient_table:
            # Find all rows
            rows = ingredient_table.find_all('tr')
            
            for row in rows:
                # Get both columns
                cols = row.find_all('td')
                if len(cols) >= 2:
                    # First column: amount and unit (separated by space)
                    amount_text = cols[0].get_text(strip=True)
                    # Second column: ingredient name
                    name_text = cols[1].get_text(strip=True)
                    
                    if name_text:  # Only add if we have a name
                        ingredients.append({
                            'amount': amount_text,
                            'name': name_text
                        })
        
        return ingredients
    
    def _extract_steps(self, soup: BeautifulSoup) -> List[str]:
        """Extract preparation steps from elements with class 'instruction__text'"""
        steps = []
        
        logger.debug("Searching for preparation steps with class 'instruction__text'...")
        
        # Find all elements with class "instruction__text"
        instruction_elements = soup.find_all(class_='instruction__text')
        logger.debug(f"Found {len(instruction_elements)} elements with class 'instruction__text'")
        
        for idx, elem in enumerate(instruction_elements, 1):
            step_text = elem.get_text(strip=True)
            if step_text and len(step_text) > 10:
                steps.append(step_text)
                logger.debug(f"  Step {idx}: {step_text[:80]}...")
            else:
                logger.warning(f"  Step {idx} text too short or empty: '{step_text}'")
        
        logger.info(f"Total steps extracted: {len(steps)}")
        return steps
    
    def _extract_image_url(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main recipe image URL from header"""
        # Look in header first
        header = soup.find('header')
        if header:
            img = header.find('img')
            if img:
                return img.get('src') or img.get('data-src')
        
        # Try og:image as fallback
        og_image = soup.find('meta', property='og:image')
        if og_image:
            return og_image.get('content')
        
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