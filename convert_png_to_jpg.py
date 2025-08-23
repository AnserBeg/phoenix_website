#!/usr/bin/env python3
"""
PNG to JPG Conversion Script for Phoenix Trailers Website
Converts all PNG images to JPG format for better compression and consistency
"""

import os
from pathlib import Path
from PIL import Image
import glob

# Configuration
MIGRATED_DIR = Path("backend/uploads/migrated")
QUALITY = 85  # JPG quality (0-100, higher = better quality but larger file)

def convert_png_to_jpg():
    """Convert all PNG images to JPG format"""
    print("🔄 Starting PNG to JPG conversion...")
    print("=" * 50)
    
    # Find all PNG files
    png_files = list(MIGRATED_DIR.glob("*.png"))
    
    if not png_files:
        print("✅ No PNG files found to convert")
        return
    
    print(f"📸 Found {len(png_files)} PNG files to convert")
    print()
    
    converted_count = 0
    total_size_saved = 0
    
    for i, png_file in enumerate(png_files, 1):
        print(f"[{i}/{len(png_files)}] Converting: {png_file.name}")
        
        try:
            # Open PNG image
            with Image.open(png_file) as img:
                # Convert to RGB if necessary (PNG might have transparency)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparent images
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Generate JPG filename
                jpg_filename = png_file.stem + '.jpg'
                jpg_path = png_file.parent / jpg_filename
                
                # Save as JPG
                img.save(jpg_path, 'JPEG', quality=QUALITY, optimize=True)
                
                # Get file sizes
                png_size = png_file.stat().st_size
                jpg_size = jpg_path.stat().st_size
                size_saved = png_size - jpg_size
                
                print(f"   ✅ Converted to: {jpg_filename}")
                print(f"   📊 Size: {png_size/1024:.1f}KB → {jpg_size/1024:.1f}KB (Saved: {size_saved/1024:.1f}KB)")
                
                # Delete original PNG file
                png_file.unlink()
                print(f"   🗑️  Deleted original PNG")
                
                converted_count += 1
                total_size_saved += size_saved
                
        except Exception as e:
            print(f"   ❌ Failed to convert {png_file.name}: {e}")
        
        print()
    
    # Summary
    print("🎉 Conversion Complete!")
    print(f"✅ Successfully converted: {converted_count}/{len(png_files)} PNG files")
    print(f"💾 Total space saved: {total_size_saved/1024:.1f}KB")
    print()
    print("💡 Next steps:")
    print("   1. Restart your backend server")
    print("   2. Refresh your frontend")
    print("   3. All images are now optimized JPG format!")

def update_frontend_references():
    """Update frontend code to reference JPG files instead of PNG"""
    print("🔄 Updating frontend references from PNG to JPG...")
    
    frontend_file = Path("frontend/src/App.js")
    
    if not frontend_file.exists():
        print("❌ Frontend file not found")
        return
    
    try:
        with open(frontend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace .png with .jpg in image paths
        original_content = content
        content = content.replace('.png', '.jpg')
        
        if content != original_content:
            with open(frontend_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ Frontend updated: PNG references changed to JPG")
        else:
            print("ℹ️  No PNG references found in frontend")
            
    except Exception as e:
        print(f"❌ Failed to update frontend: {e}")

def main():
    print("🚀 PNG to JPG Conversion for Phoenix Trailers Website")
    print("=" * 60)
    
    # Check if migrated directory exists
    if not MIGRATED_DIR.exists():
        print("❌ Migrated images directory not found")
        print("   Run the image migration script first!")
        return
    
    # Convert PNG files to JPG
    convert_png_to_jpg()
    
    # Update frontend references
    update_frontend_references()
    
    print("🎯 All done! Your website now uses optimized JPG images.")

if __name__ == "__main__":
    main()
