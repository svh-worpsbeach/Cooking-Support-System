"""
Debug script to check uploads directory and files.
"""

import os
import sys

def debug_uploads():
    """Check uploads directory structure and files."""
    
    print("=" * 80)
    print("UPLOADS DIRECTORY DEBUG")
    print("=" * 80)
    
    upload_dir = "uploads"
    abs_upload_dir = os.path.abspath(upload_dir)
    
    print(f"\nUpload directory: {abs_upload_dir}")
    print(f"Exists: {os.path.exists(upload_dir)}")
    print(f"Is directory: {os.path.isdir(upload_dir)}")
    
    if os.path.exists(upload_dir):
        print(f"\nDirectory contents:")
        for root, dirs, files in os.walk(upload_dir):
            level = root.replace(upload_dir, '').count(os.sep)
            indent = ' ' * 2 * level
            print(f'{indent}{os.path.basename(root)}/')
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                print(f'{subindent}{file} ({size} bytes)')
    
    # Check specific categories
    print(f"\nCategory directories:")
    for category in ['recipes', 'tools']:
        cat_dir = os.path.join(upload_dir, category)
        print(f"  {category}: exists={os.path.exists(cat_dir)}, is_dir={os.path.isdir(cat_dir)}")
        
        if os.path.exists(cat_dir):
            files = os.listdir(cat_dir)
            print(f"    Files: {len([f for f in files if os.path.isfile(os.path.join(cat_dir, f))])} files")
            print(f"    Dirs: {len([f for f in files if os.path.isdir(os.path.join(cat_dir, f))])} directories")
    
    # Check permissions
    print(f"\nPermissions:")
    print(f"  Upload dir readable: {os.access(upload_dir, os.R_OK)}")
    print(f"  Upload dir writable: {os.access(upload_dir, os.W_OK)}")
    print(f"  Upload dir executable: {os.access(upload_dir, os.X_OK)}")
    
    print("=" * 80)

if __name__ == "__main__":
    debug_uploads()

# Made with Bob
