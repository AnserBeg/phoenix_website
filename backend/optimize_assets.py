#!/usr/bin/env python3
"""
Asset Optimization Script for Phoenix Website
Converts videos, 3D models, and images to web-optimized formats
"""

import os
import subprocess
from pathlib import Path
import shutil
import sys

def check_dependencies():
    """Check if required tools are installed"""
    tools = ['ffmpeg', 'cwebp']
    missing = []
    
    for tool in tools:
        try:
            subprocess.run([tool, '-version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            missing.append(tool)
    
    if missing:
        print(f"❌ Missing tools: {', '.join(missing)}")
        print("Please install:")
        print("- ffmpeg: https://ffmpeg.org/download.html")
        print("- cwebp: https://developers.google.com/speed/webp/docs/cwebp")
        return False
    return True

def optimize_video(input_path, output_dir):
    """Convert video to optimized WebM/MP4"""
    try:
        filename = input_path.stem
        print(f"🎬 Processing video: {filename}")
        
        # Convert to WebM (smaller, modern browsers)
        webm_path = output_dir / f"{filename}.webm"
        webm_cmd = [
            'ffmpeg', '-i', str(input_path),
            '-c:v', 'libvpx-vp9', '-crf', '30',  # Good quality, reasonable size
            '-c:a', 'libopus', '-b:a', '128k',
            '-vf', 'scale=1280:720',  # 720p max
            '-y',  # Overwrite output files
            str(webm_path)
        ]
        subprocess.run(webm_cmd, check=True, capture_output=True)
        
        # Convert to optimized MP4 (universal compatibility)
        mp4_path = output_dir / f"{filename}_optimized.mp4"
        mp4_cmd = [
            'ffmpeg', '-i', str(input_path),
            '-c:v', 'libx264', '-crf', '23',  # Good quality
            '-c:a', 'aac', '-b:a', '128k',
            '-vf', 'scale=1280:720',  # 720p max
            '-movflags', '+faststart',  # Web optimization
            '-y',  # Overwrite output files
            str(mp4_path)
        ]
        subprocess.run(mp4_cmd, check=True, capture_output=True)
        
        # Get file sizes for comparison
        original_size = input_path.stat().st_size / (1024 * 1024)  # MB
        webm_size = webm_path.stat().st_size / (1024 * 1024) if webm_path.exists() else 0
        mp4_size = mp4_path.stat().st_size / (1024 * 1024) if mp4_path.exists() else 0
        
        print(f"✅ Video optimized: {filename}")
        print(f"   Original: {original_size:.1f}MB")
        print(f"   WebM: {webm_size:.1f}MB ({((1-webm_size/original_size)*100):.0f}% smaller)")
        print(f"   MP4: {mp4_size:.1f}MB ({((1-mp4_size/original_size)*100):.0f}% smaller)")
        
    except Exception as e:
        print(f"❌ Video optimization failed for {input_path}: {e}")

def optimize_images(input_dir, output_dir):
    """Convert images to WebP format"""
    image_extensions = ['.jpg', '.jpeg', '.png']
    
    for img_file in input_dir.iterdir():
        if img_file.is_file() and img_file.suffix.lower() in image_extensions:
            try:
                filename = img_file.stem
                webp_path = output_dir / f"{filename}.webp"
                
                print(f"🖼️  Converting image: {filename}")
                
                # Convert to WebP with quality 80
                cmd = [
                    'cwebp', '-q', '80',
                    str(img_file), '-o', str(webp_path)
                ]
                subprocess.run(cmd, check=True, capture_output=True)
                
                # Get file sizes for comparison
                original_size = img_file.stat().st_size / 1024  # KB
                webp_size = webp_path.stat().st_size / 1024 if webp_path.exists() else 0
                
                print(f"✅ Image converted: {filename}")
                print(f"   Original: {original_size:.1f}KB")
                print(f"   WebP: {webp_size:.1f}KB ({((1-webp_size/original_size)*100):.0f}% smaller)")
                
            except Exception as e:
                print(f"❌ Image conversion failed for {img_file}: {e}")

def create_thumbnails(video_dir, output_dir):
    """Create thumbnails for videos"""
    for video_file in video_dir.glob("*.mp4"):
        try:
            filename = video_file.stem
            thumbnail_path = output_dir / f"{filename}_thumb.jpg"
            
            print(f"📸 Creating thumbnail: {filename}")
            
            cmd = [
                'ffmpeg', '-i', str(video_file),
                '-ss', '00:00:02',  # Take frame at 2 seconds
                '-vframes', '1',
                '-vf', 'scale=320:180',  # Small thumbnail
                '-y',
                str(thumbnail_path)
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            
            print(f"✅ Thumbnail created: {filename}")
            
        except Exception as e:
            print(f"❌ Thumbnail creation failed for {video_file}: {e}")

def main():
    if not check_dependencies():
        sys.exit(1)
    
    # Setup directories
    script_dir = Path(__file__).parent
    uploads_dir = script_dir / "uploads"
    optimized_dir = script_dir / "uploads" / "optimized"
    
    # Create optimized directory
    optimized_dir.mkdir(exist_ok=True)
    
    print("🚀 Starting asset optimization...")
    print(f"📁 Source: {uploads_dir}")
    print(f"📁 Output: {optimized_dir}")
    print("-" * 50)
    
    # Process videos
    print("\n🎬 Processing videos...")
    for video_file in uploads_dir.glob("*.mp4"):
        optimize_video(video_file, optimized_dir)
    
    # Process images
    print("\n🖼️  Processing images...")
    optimize_images(uploads_dir, optimized_dir)
    
    # Create video thumbnails
    print("\n📸 Creating video thumbnails...")
    create_thumbnails(uploads_dir, optimized_dir)
    
    print("\n" + "=" * 50)
    print("✨ Asset optimization complete!")
    print(f"📁 Check optimized files in: {optimized_dir}")
    print("\n💡 Next steps:")
    print("1. Update your React components to use optimized files")
    print("2. Use WebP images with JPG fallbacks")
    print("3. Use WebM videos with MP4 fallbacks")
    print("4. Add lazy loading and preload='metadata' to videos")

if __name__ == "__main__":
    main()
