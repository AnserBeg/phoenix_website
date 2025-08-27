#!/usr/bin/env python3
"""
Ultra-Aggressive 3D Model Compression Script
Specifically designed to compress models down to minimal sizes for web use.
"""

import subprocess
import sys
import os
from pathlib import Path
import shutil

def check_gltf_optimizer():
    """Check if gltf-transform is available"""
    try:
        # Try to run gltf-transform with --version to check if it's available
        result = subprocess.run(['gltf-transform', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"✅ gltf-transform found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # If not found in PATH, try to find it in common locations
        try:
            # Try using the full path if it's in a common location
            result = subprocess.run(['C:\\Users\\mirza\\AppData\\Roaming\\npm\\gltf-transform.cmd', '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ gltf-transform found: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ gltf-transform not found")
            return False

def install_gltf_optimizer():
    """Install gltf-transform if not available"""
    try:
        print("📦 Installing gltf-transform...")
        subprocess.run(['npm', 'install', '-g', '@gltf-transform/cli'], 
                      check=True, capture_output=True)
        print("✅ gltf-transform installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install gltf-transform: {e}")
        return False

def compress_ultra_aggressive(input_path, output_path):
    """
    Apply ultra-aggressive compression to reduce file size dramatically
    """
    print(f"🚀 Applying ULTRA-AGGRESSIVE compression to: {input_path.name}")
    
    # Ultra-aggressive settings for maximum compression
    cmd = [
        'gltf-transform',
        'optimize',
        str(input_path),
        str(output_path),
        '--texture-size', '256',           # Reduce textures to 256x256
        '--simplify-ratio', '0.1',        # Reduce to 10% of original polygons (keep only 10%)
        '--simplify-error', '0.01',       # Allow higher simplification error for max compression
        '--compress', 'draco',            # Use Draco compression for geometry
        '--instance',                      # Instance repeated meshes
        '--join-meshes',                  # Join compatible meshes
        '--join-named',                   # Join meshes with similar names
        '--prune',                        # Remove unused properties
        '--prune-attributes',             # Remove unused vertex attributes
        '--prune-solid-textures',         # Convert solid textures to material factors
        '--texture-compress', 'webp',     # Use WebP for maximum compression
        '--weld',                         # Merge equivalent vertices
        '--flatten',                      # Flatten scene graph
        '--palette',                      # Create palette textures and merge materials
        '--palette-min', '3',             # Minimum blocks for palette generation
        '--vertex-layout', 'interleaved', # Use interleaved vertex layout for better compression
    ]
    
    print(f"🔧 Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Compression successful!")
        print(f"📊 STDOUT: {result.stdout}")
        if result.stderr:
            print(f"⚠️  STDERR: {result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Compression failed: {e}")
        print(f"📊 STDOUT: {e.stdout}")
        print(f"📊 STDERR: {e.stderr}")
        return False

def main():
    """Main compression function"""
    print("🚀 ULTRA-AGGRESSIVE 3D Model Compression")
    print("=" * 50)
    
    # Check if gltf-transform is available
    if not check_gltf_optimizer():
        if not install_gltf_optimizer():
            print("❌ Cannot proceed without gltf-transform")
            sys.exit(1)
    
    # Define paths
    uploads_dir = Path('uploads')
    ultra_compressed_dir = uploads_dir / 'ultra_compressed_models'
    mega_compressed_dir = uploads_dir / 'mega_compressed_models'
    
    # Create output directory
    mega_compressed_dir.mkdir(exist_ok=True)
    
    # Specific model to compress further
    truck_deck_model = ultra_compressed_dir / 'ultra_2b562ac159eb3c6a12abc4e72e677896.glb'
    
    if not truck_deck_model.exists():
        print(f"❌ Model not found: {truck_deck_model}")
        sys.exit(1)
    
    # Get original file size
    original_size = truck_deck_model.stat().st_size / 1024  # KB
    print(f"📁 Original model: {truck_deck_model.name}")
    print(f"📏 Original size: {original_size:.1f} KB")
    
    # Output path for mega-compressed version
    output_path = mega_compressed_dir / f'mega_{truck_deck_model.name}'
    
    print(f"🎯 Target output: {output_path}")
    print("=" * 50)
    
    # Apply ultra-aggressive compression
    if compress_ultra_aggressive(truck_deck_model, output_path):
        # Check final size
        if output_path.exists():
            final_size = output_path.stat().st_size / 1024  # KB
            savings = ((original_size - final_size) / original_size) * 100
            
            print("=" * 50)
            print("🎉 COMPRESSION COMPLETE!")
            print(f"📁 Input: {truck_deck_model.name}")
            print(f"📁 Output: {output_path.name}")
            print(f"📏 Original: {original_size:.1f} KB")
            print(f"📏 Final: {final_size:.1f} KB")
            print(f"💾 Savings: {savings:.1f}%")
            print(f"📂 Location: {output_path}")
            
            # Suggest updating the frontend
            print("\n💡 Next steps:")
            print(f"1. Update frontend to use: {output_path.name}")
            print("2. Test the model quality")
            print("3. If satisfied, this will be your new truck deck model")
        else:
            print("❌ Output file not created")
    else:
        print("❌ Compression failed")

if __name__ == "__main__":
    main()
