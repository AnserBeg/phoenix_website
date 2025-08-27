#!/usr/bin/env python3
"""
Simple Truck Deck Compression Script
Directly compresses the truck deck model to minimal size.
"""

import subprocess
import sys
from pathlib import Path

def main():
    """Main compression function"""
    print("🚀 ULTRA-AGGRESSIVE Truck Deck Compression")
    print("=" * 50)
    
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
    
    # Ultra-aggressive compression command using full path
    cmd = [
        r'C:\Users\mirza\AppData\Roaming\npm\gltf-transform.cmd',
        'optimize',
        str(truck_deck_model),
        str(output_path),
        '--texture-size', '256',           # Reduce textures to 256x256
        '--simplify-ratio', '0.1',        # Reduce to 10% of original polygons
        '--simplify-error', '0.01',       # Allow higher simplification error
        '--compress', 'draco',            # Use Draco compression
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
        '--vertex-layout', 'interleaved', # Use interleaved vertex layout
    ]
    
    print(f"🔧 Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Compression successful!")
        if result.stdout:
            print(f"📊 STDOUT: {result.stdout}")
        if result.stderr:
            print(f"⚠️  STDERR: {result.stderr}")
        
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
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Compression failed: {e}")
        if e.stdout:
            print(f"📊 STDOUT: {e.stdout}")
        if e.stderr:
            print(f"📊 STDERR: {e.stderr}")

if __name__ == "__main__":
    main()
