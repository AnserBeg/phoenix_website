#!/usr/bin/env python3
"""
Image Migration Script for Phoenix Trailers Website
Downloads all external images and updates frontend to use local paths
"""

import os
import requests
import re
from pathlib import Path
from urllib.parse import urlparse
import hashlib

# Configuration
FRONTEND_FILE = "frontend/src/App.js"
UPLOADS_DIR = Path("backend/uploads")
MIGRATED_DIR = UPLOADS_DIR / "migrated"

def download_image(url, filename):
    """Download an image from URL and save it locally"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        MIGRATED_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save the image
        filepath = MIGRATED_DIR / filename
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded: {filename}")
        return f"/uploads/migrated/{filename}"
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return None

def extract_image_urls_from_js(file_path):
    """Extract all image URLs from the JavaScript file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all image URLs (both http and https)
    url_pattern = r'https?://[^\s"\'`]+\.(?:jpg|jpeg|png|gif|svg|webp)'
    urls = re.findall(url_pattern, content)
    
    # Remove duplicates while preserving order
    unique_urls = []
    seen = set()
    for url in urls:
        if url not in seen:
            unique_urls.append(url)
            seen.add(url)
    
    return unique_urls

def generate_filename(url):
    """Generate a unique filename for the image"""
    parsed = urlparse(url)
    original_name = os.path.basename(parsed.path)
    
    # Create a hash of the URL to ensure uniqueness
    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
    
    # Get file extension
    ext = os.path.splitext(original_name)[1] or '.jpg'
    
    # Create descriptive filename
    if 'hero' in url.lower():
        base_name = 'hero_background'
    elif 'logo' in url.lower():
        base_name = 'phoenix_logo'
    elif 'drop-deck' in url.lower():
        base_name = 'drop_deck'
    elif 'flatbed' in url.lower():
        base_name = 'flatbed'
    elif 'control-van' in url.lower():
        base_name = 'control_van'
    elif 'utility' in url.lower():
        base_name = 'utility_trailer'
    elif 'tanks' in url.lower():
        base_name = 'flatbed_tanks'
    elif 'towable' in url.lower():
        base_name = 'towable_screen'
    else:
        base_name = 'image'
    
    return f"{base_name}_{url_hash}{ext}"

def update_frontend_code(file_path, url_mapping):
    """Update the frontend code to use local image paths"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace each external URL with local path
    for external_url, local_path in url_mapping.items():
        if local_path:  # Only replace if download was successful
            content = content.replace(external_url, local_path)
            print(f"🔄 Replaced: {external_url} → {local_path}")
    
    # Write updated content back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"📝 Updated frontend code: {file_path}")

def main():
    print("🚀 Starting Image Migration for Phoenix Trailers Website")
    print("=" * 60)
    
    # Extract all image URLs from frontend
    print("🔍 Extracting image URLs from frontend code...")
    image_urls = extract_image_urls_from_js(FRONTEND_FILE)
    
    if not image_urls:
        print("❌ No image URLs found in frontend code")
        return
    
    print(f"📸 Found {len(image_urls)} unique image URLs")
    print()
    
    # Download each image
    url_mapping = {}
    successful_downloads = 0
    
    for i, url in enumerate(image_urls, 1):
        print(f"[{i}/{len(image_urls)}] Processing: {url}")
        
        filename = generate_filename(url)
        local_path = download_image(url, filename)
        
        if local_path:
            url_mapping[url] = local_path
            successful_downloads += 1
        
        print()
    
    # Update frontend code
    if successful_downloads > 0:
        print("🔄 Updating frontend code to use local images...")
        update_frontend_code(FRONTEND_FILE, url_mapping)
        
        print()
        print("🎉 Migration Complete!")
        print(f"✅ Successfully downloaded: {successful_downloads}/{len(image_urls)} images")
        print(f"📁 Images saved to: {MIGRATED_DIR}")
        print(f"🔄 Frontend updated: {FRONTEND_FILE}")
        print()
        print("💡 Next steps:")
        print("   1. Restart your backend server")
        print("   2. Refresh your frontend")
        print("   3. All images should now load from your local server!")
    else:
        print("❌ No images were successfully downloaded")

if __name__ == "__main__":
    main()
