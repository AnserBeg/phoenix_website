#!/usr/bin/env python3
"""
3D Model Compression Script
Compresses GLB files to reduce file sizes while maintaining quality
"""

import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """Install required packages for 3D model compression"""
    try:
        import gltf_transform
        print("✅ gltf-transform already installed")
    except ImportError:
        print("📦 Installing gltf-transform...")
        subprocess.run([sys.executable, "-m", "pip", "install", "gltf-transform"], check=True)
        print("✅ gltf-transform installed successfully")

def compress_glb(input_path, output_path, quality="medium"):
    """
    Compress a GLB file using gltf-transform
    
    Args:
        input_path: Path to input GLB file
        output_path: Path for compressed output
        quality: Compression quality (low, medium, high)
    """
    
    # Quality settings
    quality_settings = {
        "low": {
            "texture_max_size": 512,
            "texture_format": "webp",
            "texture_quality": 0.7,
            "draco_compression": True,
            "draco_compression_level": 7
        },
        "medium": {
            "texture_max_size": 1024,
            "texture_format": "webp", 
            "texture_quality": 0.8,
            "draco_compression": True,
            "draco_compression_level": 5
        },
        "high": {
            "texture_max_size": 2048,
            "texture_format": "webp",
            "texture_quality": 0.9,
            "draco_compression": True,
            "draco_compression_level": 3
        }
    }
    
    settings = quality_settings[quality]
    
    # Build gltf-transform command
    cmd = [
        "gltf-transform", "optimize",
        input_path,
        output_path,
        "--texture-max-size", str(settings["texture_max_size"]),
        "--texture-format", settings["texture_format"],
        "--texture-quality", str(settings["texture_quality"])
    ]
    
    if settings["draco_compression"]:
        cmd.extend([
            "--draco-compression",
            "--draco-compression-level", str(settings["draco_compression_level"])
        ])
    
    print(f"🔧 Compressing {input_path} with {quality} quality...")
    print(f"📝 Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Compression successful!")
        
        # Get file sizes
        original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
        compressed_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
        savings = ((original_size - compressed_size) / original_size) * 100
        
        print(f"📊 Original: {original_size:.1f} MB")
        print(f"📊 Compressed: {compressed_size:.1f} MB")
        print(f"💾 Savings: {savings:.1f}%")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Compression failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def batch_compress_models(input_dir, output_dir, quality="medium"):
    """Compress all GLB files in a directory"""
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Find all GLB files
    glb_files = list(input_path.glob("*.glb"))
    
    if not glb_files:
        print(f"❌ No GLB files found in {input_dir}")
        return
    
    print(f"🔍 Found {len(glb_files)} GLB files to compress")
    
    successful = 0
    total_original_size = 0
    total_compressed_size = 0
    
    for glb_file in glb_files:
        output_file = output_path / f"{glb_file.stem}_compressed.glb"
        
        print(f"\n📁 Processing: {glb_file.name}")
        
        if compress_glb(str(glb_file), str(output_file), quality):
            successful += 1
            
            # Calculate sizes
            original_size = os.path.getsize(glb_file) / (1024 * 1024)
            compressed_size = os.path.getsize(output_file) / (1024 * 1024)
            
            total_original_size += original_size
            total_compressed_size += compressed_size
    
    # Summary
    print(f"\n🎯 Compression Summary:")
    print(f"✅ Successful: {successful}/{len(glb_files)}")
    print(f"📊 Total Original: {total_original_size:.1f} MB")
    print(f"📊 Total Compressed: {total_compressed_size:.1f} MB")
    print(f"💾 Total Savings: {((total_original_size - total_compressed_size) / total_original_size) * 100:.1f}%")

def main():
    """Main function"""
    print("🚀 3D Model Compression Tool")
    print("=" * 40)
    
    # Install requirements
    install_requirements()
    
    # Get current directory
    current_dir = Path(__file__).parent
    uploads_dir = current_dir / "uploads"
    
    if not uploads_dir.exists():
        print(f"❌ Uploads directory not found: {uploads_dir}")
        return
    
    # Create compressed directory
    compressed_dir = uploads_dir / "compressed_3d_models"
    compressed_dir.mkdir(exist_ok=True)
    
    print(f"\n📁 Input directory: {uploads_dir}")
    print(f"📁 Output directory: {compressed_dir}")
    
    # Ask for quality preference
    print("\n🎚️ Choose compression quality:")
    print("1. Low (max compression, lower quality)")
    print("2. Medium (balanced compression/quality) - RECOMMENDED")
    print("3. High (minimal compression, high quality)")
    
    while True:
        choice = input("Enter choice (1-3): ").strip()
        if choice in ["1", "2", "3"]:
            quality_map = {"1": "low", "2": "medium", "3": "high"}
            quality = quality_map[choice]
            break
        print("❌ Invalid choice. Please enter 1, 2, or 3.")
    
    print(f"\n🎯 Using {quality} quality compression")
    
    # Start compression
    batch_compress_models(uploads_dir, compressed_dir, quality)
    
    print(f"\n✨ Compression complete! Check {compressed_dir} for results.")

if __name__ == "__main__":
    main()
