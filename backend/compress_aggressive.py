#!/usr/bin/env python3
"""
Ultra-Aggressive 3D Model Compression
Specifically targets truck decks and flatbeds for maximum compression
"""

import os
import subprocess
from pathlib import Path

def compress_ultra_aggressive(input_path, output_path):
    """Apply ultra-aggressive compression for maximum size reduction"""
    print(f"🔥🔥 Applying ULTRA-AGGRESSIVE compression to {os.path.basename(input_path)}")
    
    # Create output directory
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Ultra-aggressive settings for maximum compression
    cmd = [
        'gltf-transform', 'optimize',
        input_path, output_path,
        '--texture-compress', 'webp',      # Use WebP for best compression
        '--texture-size', '512',           # Reduce texture size to 512x512
        '--simplify', 'true',              # Enable mesh simplification
        '--simplify-ratio', '0.2',         # Reduce to 20% of original faces (very aggressive)
        '--simplify-error', '0.005',       # Allow more error for better compression
        '--compress', 'draco',             # Use Draco compression
        '--weld', 'true',                  # Merge equivalent vertices
        '--flatten', 'true',               # Flatten scene graph
        '--join', 'true',                  # Join meshes to reduce draw calls
        '--prune', 'true',                 # Remove unused properties
        '--palette', 'true',               # Create palette textures
        '--instance', 'true',              # Enable instancing
        '--instance-min', '2',             # Minimum instances for instancing
        '--join-meshes', 'true',          # Join distinct meshes
        '--join-named', 'true'            # Join named meshes
    ]
    
    try:
        print(f"   Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            compressed_size = os.path.getsize(output_path) / (1024 * 1024)
            print(f"✅ Ultra-compressed to {compressed_size:.1f} MB")
            return True
        else:
            print(f"❌ Compression failed:")
            print(f"   STDOUT: {result.stdout}")
            print(f"   STDERR: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Compression error: {e}")
        return False

def compress_specific_models():
    """Compress specific models with ultra-aggressive settings"""
    print("🚀 Ultra-Aggressive Compression for Truck Decks & Flatbeds")
    print("=" * 60)
    
    # Get current directory
    current_dir = Path(__file__).parent
    uploads_dir = current_dir / "uploads"
    compressed_dir = uploads_dir / "compressed_3d_models"
    ultra_compressed_dir = uploads_dir / "ultra_compressed_models"
    
    # Create ultra-compressed directory
    ultra_compressed_dir.mkdir(parents=True, exist_ok=True)
    
    # Models to ultra-compress
    models_to_compress = [
        {
            'name': 'truckdeck3d.glb',
            'input': uploads_dir / 'truckdeck3d.glb',
            'output': ultra_compressed_dir / 'ultra_truckdeck3d.glb',
            'current_size': '72KB'
        },
        {
            'name': 'flatbed3d.glb',
            'input': uploads_dir / 'flatbed3d.glb',
            'output': ultra_compressed_dir / 'ultra_flatbed3d.glb',
            'current_size': '225KB'
        },
        {
            'name': 'dropdeck3d.glb',
            'input': uploads_dir / 'dropdeck3d.glb',
            'output': ultra_compressed_dir / 'ultra_dropdeck3d.glb',
            'current_size': '73KB'
        },
        {
            'name': '2b562ac159eb3c6a12abc4e72e677896.glb',
            'input': uploads_dir / '2b562ac159eb3c6a12abc4e72e677896.glb',
            'output': ultra_compressed_dir / 'ultra_2b562ac159eb3c6a12abc4e72e677896.glb',
            'current_size': '612KB'
        },
        {
            'name': 'controlvan3d2.glb',
            'input': uploads_dir / 'controlvan3d2.glb',
            'output': ultra_compressed_dir / 'ultra_controlvan3d2.glb',
            'current_size': '92KB'
        },
        {
            'name': 'controlvan3d.glb',
            'input': uploads_dir / 'controlvan3d.glb',
            'output': ultra_compressed_dir / 'ultra_controlvan3d.glb',
            'current_size': '237KB'
        }
    ]
    
    results = []
    
    for model in models_to_compress:
        print(f"\n📁 Processing: {model['name']}")
        print(f"   Current compressed size: {model['current_size']}")
        
        if not model['input'].exists():
            print(f"   ⚠️ Input file not found, skipping")
            continue
        
        # Get original size
        original_size = os.path.getsize(model['input']) / (1024 * 1024)
        print(f"   Original size: {original_size:.1f} MB")
        
        # Apply ultra-aggressive compression
        success = compress_ultra_aggressive(str(model['input']), str(model['output']))
        
        if success:
            final_size = os.path.getsize(model['output']) / (1024 * 1024)
            compression_ratio = ((original_size - final_size) / original_size) * 100
            
            results.append({
                'name': model['name'],
                'original_size': original_size,
                'final_size': final_size,
                'compression_ratio': compression_ratio,
                'size_kb': final_size * 1024
            })
            
            print(f"   Final: {final_size:.1f} MB ({final_size * 1024:.0f} KB)")
            print(f"   Total reduction: {compression_ratio:.1f}%")
        else:
            print(f"   ❌ Ultra-compression failed")
    
    # Summary
    print(f"\n📊 Ultra-Compression Summary")
    print("=" * 50)
    
    if results:
        total_original = sum(r['original_size'] for r in results)
        total_final = sum(r['final_size'] for r in results)
        total_savings = ((total_original - total_final) / total_original) * 100
        
        print(f"Total Original: {total_original:.1f} MB")
        print(f"Total Final: {total_final:.1f} MB")
        print(f"Total Savings: {total_savings:.1f}%")
        
        print(f"\n📁 Results saved in: {ultra_compressed_dir}")
        
        # Show individual results
        for r in results:
            print(f"   {r['name']}: {r['size_kb']:.0f} KB")
        
        print(f"\n💡 Use these ultra-compressed models for maximum performance!")
        print(f"   Replace the 'compressed_' versions with 'ultra_' versions")
        
    else:
        print("❌ No models were successfully ultra-compressed")
    
    return True

def main():
    """Main function"""
    print("🔍 Ultra-Aggressive 3D Model Compression")
    print("Target: Maximum compression for truck decks and flatbeds")
    print("=" * 70)
    
    # Check if gltf-transform is available
    try:
        result = subprocess.run(['gltf-transform', '--version'], 
                              capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print("❌ gltf-transform not found. Please install it first:")
            print("   npm install -g @gltf-transform/cli")
            return
    except:
        print("❌ gltf-transform not found. Please install it first:")
        print("   npm install -g @gltf-transform/cli")
        return
    
    # Start ultra-compression
    success = compress_specific_models()
    
    if success:
        print(f"\n✨ Ultra-compression complete!")
        print(f"📁 Check results in: uploads/ultra_compressed_models/")
        print(f"💡 These models are optimized for maximum web performance")
    else:
        print(f"\n❌ Ultra-compression failed. Check errors above.")

if __name__ == "__main__":
    main()
