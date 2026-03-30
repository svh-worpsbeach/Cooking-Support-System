"""
File upload service for handling image uploads.
"""

import os
import uuid
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
import shutil


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
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure upload directories exist."""
        os.makedirs(os.path.join(self.upload_dir, "recipes"), exist_ok=True)
        os.makedirs(os.path.join(self.upload_dir, "tools"), exist_ok=True)
        os.makedirs(os.path.join(self.upload_dir, "recipes", "thumbnails"), exist_ok=True)
        os.makedirs(os.path.join(self.upload_dir, "tools", "thumbnails"), exist_ok=True)
    
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
        # Validate file
        self._validate_file(file)
        
        # Generate unique filename
        filename = self._generate_unique_filename(file.filename)
        
        # Construct file paths
        category_dir = os.path.join(self.upload_dir, category)
        filepath = os.path.join(category_dir, filename)
        
        try:
            # Save the file
            with open(filepath, "wb") as buffer:
                content = await file.read()
                
                # Check file size
                if len(content) > self.MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large. Maximum size: {self.MAX_FILE_SIZE / (1024*1024)}MB"
                    )
                
                buffer.write(content)
            
            # Create thumbnail if requested
            if create_thumbnail:
                await self._create_thumbnail(filepath, category)
            
            # Return relative path for database storage
            relative_path = os.path.join(category, filename)
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
            # Open image
            with Image.open(filepath) as img:
                # Convert to RGB if necessary (for PNG with transparency)
                if img.mode in ("RGBA", "LA", "P"):
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "P":
                        img = img.convert("RGBA")
                    background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                    img = background
                
                # Create thumbnail
                img.thumbnail(self.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                
                # Save thumbnail
                filename = os.path.basename(filepath)
                thumbnail_dir = os.path.join(self.upload_dir, category, "thumbnails")
                thumbnail_path = os.path.join(thumbnail_dir, filename)
                
                img.save(thumbnail_path, quality=85, optimize=True)
                
        except Exception as e:
            # Log error but don't fail the upload
            print(f"Warning: Failed to create thumbnail: {str(e)}")
    
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
        # Construct file paths
        category_dir = os.path.join(self.upload_dir, category)
        filepath = os.path.join(category_dir, filename)
        
        try:
            # Check file size
            if len(image_data) > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {self.MAX_FILE_SIZE / (1024*1024)}MB"
                )
            
            # Save the file
            with open(filepath, "wb") as buffer:
                buffer.write(image_data)
            
            # Create thumbnail if requested
            if create_thumbnail:
                await self._create_thumbnail(filepath, category)
            
            # Return relative path for database storage
            relative_path = os.path.join(category, filename)
            return relative_path
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            # Clean up file if it was created
            if os.path.exists(filepath):
                os.remove(filepath)
            raise HTTPException(status_code=500, detail=f"Failed to save image data: {str(e)}")
        return None


# Create a singleton instance
file_service = FileService()


# Made with Bob