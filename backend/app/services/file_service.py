"""
File upload service for handling image uploads.
"""

import os
import uuid
import logging
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
import shutil

# Configure logging
logger = logging.getLogger(__name__)


class FileService:
    """Service for handling file uploads and management."""
    
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    THUMBNAIL_SIZE = (300, 300)
    
    def __init__(self, upload_dir: str = "uploads"):
        """
        Initialize the file service.
        
        Args:
            upload_dir: Base directory for uploads
        """
        self.upload_dir = upload_dir
        logger.info(f"FileService initialized with upload_dir: {os.path.abspath(upload_dir)}")
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure upload directories exist."""
        dirs = [
            os.path.join(self.upload_dir, "recipes"),
            os.path.join(self.upload_dir, "tools"),
            os.path.join(self.upload_dir, "recipes", "thumbnails"),
            os.path.join(self.upload_dir, "tools", "thumbnails")
        ]
        for dir_path in dirs:
            os.makedirs(dir_path, exist_ok=True)
            logger.debug(f"Ensured directory exists: {os.path.abspath(dir_path)}")
    
    def _validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file.
        
        Args:
            file: The uploaded file
            
        Raises:
            HTTPException: If file is invalid
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename.
        
        Args:
            original_filename: Original filename
            
        Returns:
            Unique filename with UUID prefix
        """
        ext = os.path.splitext(original_filename)[1].lower()
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{ext}"
    
    async def save_upload(
        self,
        file: UploadFile,
        category: str,
        create_thumbnail: bool = True
    ) -> Tuple[str, str]:
        """
        Save uploaded file and optionally create thumbnail.
        
        Args:
            file: The uploaded file
            category: Category (e.g., 'recipes', 'tools')
            create_thumbnail: Whether to create a thumbnail
            
        Returns:
            Tuple of (filename, filepath)
            
        Raises:
            HTTPException: If file is invalid or save fails
        """
        logger.info(f"=== UPLOAD START: {file.filename} ===")
        
        # Validate file
        self._validate_file(file)
        logger.debug(f"✓ File validated: {file.filename}")
        
        # Generate unique filename
        filename = self._generate_unique_filename(file.filename)
        logger.debug(f"✓ Generated filename: {filename}")
        
        # Construct file paths
        category_dir = os.path.join(self.upload_dir, category)
        filepath = os.path.join(category_dir, filename)
        abs_filepath = os.path.abspath(filepath)
        logger.info(f"Target path: {abs_filepath}")
        logger.info(f"Category dir: {os.path.abspath(category_dir)}")
        logger.info(f"Category dir exists: {os.path.exists(category_dir)}")
        
        try:
            # Save the file
            logger.debug("Reading file content...")
            content = await file.read()
            file_size = len(content)
            logger.info(f"File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
            
            # Check file size
            if file_size > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {self.MAX_FILE_SIZE / (1024*1024)}MB"
                )
            
            logger.debug(f"Writing to: {abs_filepath}")
            with open(filepath, "wb") as buffer:
                buffer.write(content)
            
            # Verify file was written
            if os.path.exists(filepath):
                actual_size = os.path.getsize(filepath)
                logger.info(f"✓ File written successfully: {actual_size} bytes")
            else:
                logger.error(f"✗ File not found after write: {abs_filepath}")
                raise HTTPException(status_code=500, detail="File write verification failed")
            
            # Create thumbnail if requested
            if create_thumbnail:
                logger.debug("Creating thumbnail...")
                await self._create_thumbnail(filepath, category)
                logger.info("✓ Thumbnail created")
            
            # Return relative path for database storage (with /uploads/ prefix for URL construction)
            relative_path = os.path.join("/uploads", category, filename)
            logger.info(f"=== UPLOAD COMPLETE: {relative_path} ===")
            return filename, relative_path
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            # Clean up file if it was created
            if os.path.exists(filepath):
                os.remove(filepath)
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    async def _create_thumbnail(self, filepath: str, category: str) -> None:
        """
        Create a thumbnail for the uploaded image.
        
        Args:
            filepath: Path to the original image
            category: Category (e.g., 'recipes', 'tools')
        """
        try:
            logger.debug(f"Opening image for thumbnail: {filepath}")
            # Open image
            with Image.open(filepath) as img:
                logger.debug(f"Image mode: {img.mode}, size: {img.size}")
                
                # Convert to RGB if necessary (for PNG with transparency)
                if img.mode in ("RGBA", "LA", "P"):
                    logger.debug(f"Converting {img.mode} to RGB")
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "P":
                        img = img.convert("RGBA")
                    background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                    img = background
                
                # Create thumbnail
                logger.debug(f"Creating thumbnail with size: {self.THUMBNAIL_SIZE}")
                img.thumbnail(self.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                
                # Save thumbnail
                filename = os.path.basename(filepath)
                thumbnail_dir = os.path.join(self.upload_dir, category, "thumbnails")
                thumbnail_path = os.path.join(thumbnail_dir, filename)
                abs_thumbnail_path = os.path.abspath(thumbnail_path)
                
                logger.debug(f"Saving thumbnail to: {abs_thumbnail_path}")
                img.save(thumbnail_path, quality=85, optimize=True)
                
                if os.path.exists(thumbnail_path):
                    thumb_size = os.path.getsize(thumbnail_path)
                    logger.debug(f"✓ Thumbnail saved: {thumb_size} bytes")
                else:
                    logger.warning(f"✗ Thumbnail not found after save: {abs_thumbnail_path}")
                
        except Exception as e:
            # Log error but don't fail the upload
            logger.error(f"✗ Failed to create thumbnail: {str(e)}", exc_info=True)
    
    def delete_file(self, filepath: str, category: str) -> bool:
        """
        Delete a file and its thumbnail.
        
        Args:
            filepath: Relative filepath (e.g., 'recipes/image.jpg')
            category: Category (e.g., 'recipes', 'tools')
            
        Returns:
            True if file was deleted, False otherwise
        """
        try:
            # Delete main file
            full_path = os.path.join(self.upload_dir, filepath)
            if os.path.exists(full_path):
                os.remove(full_path)
            
            # Delete thumbnail
            filename = os.path.basename(filepath)
            thumbnail_path = os.path.join(
                self.upload_dir, category, "thumbnails", filename
            )
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
            
            return True
            
        except Exception as e:
            print(f"Error deleting file {filepath}: {str(e)}")
            return False
    
    def get_file_url(self, filepath: str) -> str:
        """
        Get the URL for accessing a file.
        
        Args:
            filepath: Relative filepath
            
        Returns:
            URL path for the file
        """
        return f"/uploads/{filepath}"
    
    def get_thumbnail_url(self, filepath: str) -> Optional[str]:
        """
        Get the URL for accessing a thumbnail.
        
        Args:
            filepath: Relative filepath of the original image
            
        Returns:
            URL path for the thumbnail, or None if it doesn't exist
        """
        if not filepath:
            return None
        
        # Extract category and filename
        parts = filepath.split(os.sep)
        if len(parts) < 2:
            return None
        
        category = parts[0]
        filename = parts[-1]
        
        thumbnail_path = os.path.join(
            self.upload_dir, category, "thumbnails", filename
        )
        
        if os.path.exists(thumbnail_path):
            return f"/uploads/{category}/thumbnails/{filename}"
        
    
    async def save_image_data(
        self,
        image_data: bytes,
        filename: str,
        category: str,
        create_thumbnail: bool = True
    ) -> str:
        """
        Save image data directly (not from upload).
        
        Args:
            image_data: Raw image bytes
            filename: Desired filename
            category: Category (e.g., 'recipes', 'tools')
            create_thumbnail: Whether to create a thumbnail
            
        Returns:
            Relative filepath
            
        Raises:
            HTTPException: If save fails
        """
        logger.info(f"=== SAVE IMAGE DATA START: {filename} ===")
        
        # Construct file paths
        category_dir = os.path.join(self.upload_dir, category)
        filepath = os.path.join(category_dir, filename)
        abs_filepath = os.path.abspath(filepath)
        
        logger.info(f"Target path: {abs_filepath}")
        logger.info(f"Category dir: {os.path.abspath(category_dir)}")
        logger.info(f"Category dir exists: {os.path.exists(category_dir)}")
        logger.info(f"Image data size: {len(image_data)} bytes ({len(image_data) / 1024:.2f} KB)")
        
        try:
            # Check file size
            if len(image_data) > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {self.MAX_FILE_SIZE / (1024*1024)}MB"
                )
            
            # Save the file
            logger.debug(f"Writing image data to: {abs_filepath}")
            with open(filepath, "wb") as buffer:
                buffer.write(image_data)
            
            # Verify file was written
            if os.path.exists(filepath):
                actual_size = os.path.getsize(filepath)
                logger.info(f"✓ File written successfully: {actual_size} bytes")
            else:
                logger.error(f"✗ File not found after write: {abs_filepath}")
                raise HTTPException(status_code=500, detail="File write verification failed")
            
            # Create thumbnail if requested
            if create_thumbnail:
                logger.debug("Creating thumbnail...")
                await self._create_thumbnail(filepath, category)
                logger.info("✓ Thumbnail created")
            
            # Return relative path for database storage (with /uploads/ prefix for URL construction)
            relative_path = os.path.join("/uploads", category, filename)
            logger.info(f"=== SAVE IMAGE DATA COMPLETE: {relative_path} ===")
            return relative_path
            
        except HTTPException as e:
            # Re-raise HTTP exceptions
            logger.error(f"✗ HTTP exception during save: {str(e)}")
            raise
        except Exception as e:
            # Clean up file if it was created
            logger.error(f"✗ Failed to save image data: {str(e)}", exc_info=True)
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.debug(f"Cleaned up failed file: {filepath}")
            raise HTTPException(status_code=500, detail=f"Failed to save image data: {str(e)}")
        return None


# Create a singleton instance
file_service = FileService()


# Made with Bob