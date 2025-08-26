#!/usr/bin/env python3
"""
Simple Asset Optimization Script (No External Tools Required)
Uses Python libraries to optimize images and prepare for web delivery
"""

import os
import shutil
from pathlib import Path
from PIL import Image
import json

def optimize_images_python(input_dir, output_dir):
    """Convert images to optimized formats using PIL"""
    image_extensions = ['.jpg', '.jpeg', '.png']
    
    for img_file in input_dir.iterdir():
        if img_file.is_file() and img_file.suffix.lower() in image_extensions:
            try:
                filename = img_file.stem
                print(f"🖼️  Processing image: {filename}")
                
                # Open and optimize image
                with Image.open(img_file) as img:
                    # Convert to RGB if needed
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    # Resize if too large (max 1920x1080)
                    if img.width > 1920 or img.height > 1080:
                        img.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
                    
                    # Save as optimized JPG
                    jpg_path = output_dir / f"{filename}_optimized.jpg"
                    img.save(jpg_path, 'JPEG', quality=85, optimize=True)
                    
                    # Get file sizes for comparison
                    original_size = img_file.stat().st_size / 1024  # KB
                    optimized_size = jpg_path.stat().st_size / 1024
                    
                    print(f"✅ Image optimized: {filename}")
                    print(f"   Original: {original_size:.1f}KB")
                    print(f"   Optimized: {optimized_size:.1f}KB ({((1-optimized_size/original_size)*100):.0f}% smaller)")
                    
            except Exception as e:
                print(f"❌ Image optimization failed for {img_file}: {e}")

def create_video_info(input_dir, output_dir):
    """Create video information and thumbnails info"""
    video_files = list(input_dir.glob("*.mp4"))
    
    if video_files:
        print(f"\n🎬 Found {len(video_files)} video files:")
        
        video_info = []
        for video_file in video_files:
            filename = video_file.stem
            size_mb = video_file.stat().st_size / (1024 * 1024)
            
            video_info.append({
                "filename": filename,
                "original_size_mb": round(size_mb, 1),
                "suggested_webm": f"{filename}.webm",
                "suggested_mp4": f"{filename}_optimized.mp4",
                "thumbnail": f"{filename}_thumb.jpg"
            })
            
            print(f"   📹 {filename}: {size_mb:.1f}MB")
            print(f"      → Convert to WebM (target: ~{size_mb*0.3:.1f}MB)")
            print(f"      → Convert to MP4 720p (target: ~{size_mb*0.5:.1f}MB)")
        
        # Save video info for reference
        info_path = output_dir / "video_optimization_info.json"
        with open(info_path, 'w') as f:
            json.dump(video_info, f, indent=2)
        
        print(f"\n📄 Video optimization guide saved to: {info_path}")

def create_optimization_report(input_dir, output_dir):
    """Create a comprehensive optimization report"""
    report = {
        "summary": {
            "total_images": len(list(input_dir.glob("*.jpg"))) + len(list(input_dir.glob("*.png"))),
            "total_videos": len(list(input_dir.glob("*.mp4"))),
            "total_3d_models": len(list(input_dir.glob("*.fbx"))) + len(list(input_dir.glob("*.glb")))
        },
        "recommendations": {
            "images": [
                "Convert JPG/PNG to WebP (30-50% smaller)",
                "Use responsive images with multiple sizes",
                "Implement lazy loading"
            ],
            "videos": [
                "Convert to WebM format (smaller, modern browsers)",
                "Create 720p optimized MP4 versions",
                "Add preload='metadata' and poster thumbnails",
                "Use multiple source formats for compatibility"
            ],
            "3d_models": [
                "Convert FBX to glTF/GLB (much smaller)",
                "Reduce polygon count if possible",
                "Compress textures to 1K or 2K max"
            ]
        },
        "next_steps": [
            "Install ffmpeg for video optimization",
            "Install cwebp for WebP conversion",
            "Update React components to use optimized files",
            "Implement lazy loading and progressive loading"
        ]
    }
    
    report_path = output_dir / "optimization_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📊 Optimization report saved to: {report_path}")

def main():
    # Setup directories
    script_dir = Path(__file__).parent
    uploads_dir = script_dir / "uploads"
    optimized_dir = script_dir / "uploads" / "optimized"
    
    # Create optimized directory
    optimized_dir.mkdir(exist_ok=True)
    
    print("🚀 Starting simple asset optimization...")
    print(f"📁 Source: {uploads_dir}")
    print(f"📁 Output: {optimized_dir}")
    print("-" * 50)
    
    # Process images (Python-only)
    print("\n🖼️  Processing images...")
    optimize_images_python(uploads_dir, optimized_dir)
    
    # Create video optimization guide
    print("\n🎬 Analyzing videos...")
    create_video_info(uploads_dir, optimized_dir)
    
    # Create comprehensive report
    print("\n📊 Creating optimization report...")
    create_optimization_report(uploads_dir, optimized_dir)
    
    print("\n" + "=" * 50)
    print("✨ Simple optimization complete!")
    print(f"📁 Check optimized files in: {optimized_dir}")
    print("\n💡 For full optimization, install ffmpeg and cwebp tools")
    print("💡 Use the generated guides to manually optimize videos")

if __name__ == "__main__":
    main()
