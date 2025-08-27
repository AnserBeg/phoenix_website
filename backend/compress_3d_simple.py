#!/usr/bin/env python3
"""
Simple 3D Model Compression Script
Alternative compression methods for GLB files
"""

import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """Install required packages"""
    packages = ["trimesh", "pygltflib"]
    
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
            print(f"✅ {package} installed successfully")

def compress_with_trimesh(input_path, output_path, quality="medium"):
    """Compress using trimesh library"""
    try:
        import trimesh
        
        print(f"🔧 Compressing {input_path} with trimesh...")
        
        # Load the mesh
        mesh = trimesh.load(input_path)
        
        # Quality settings
        if quality == "low":
            # Reduce polygon count significantly
            mesh = mesh.simplify_quadratic_decimation(int(len(mesh.faces) * 0.3))
        elif quality == "medium":
            # Reduce polygon count moderately
            mesh = mesh.simplify_quadratic_decimation(int(len(mesh.faces) * 0.5))
        # High quality: no polygon reduction
        
        # Export with compression
        mesh.export(output_path, file_type='glb')
        
        # Calculate savings
        original_size = os.path.getsize(input_path) / (1024 * 1024)
        compressed_size = os.path.getsize(output_path) / (1024 * 1024)
        savings = ((original_size - compressed_size) / original_size) * 100
        
        print(f"✅ Compression successful!")
        print(f"📊 Original: {original_size:.1f} MB")
        print(f"📊 Compressed: {compressed_size:.1f} MB")
        print(f"💾 Savings: {savings:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Trimesh compression failed: {e}")
        return False

def compress_with_blender(input_path, output_path, quality="medium"):
    """Compress using Blender (if available)"""
    try:
        # Check if Blender is available
        result = subprocess.run(["blender", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Blender not found. Skipping Blender compression.")
            return False
            
        print(f"🔧 Compressing {input_path} with Blender...")
        
        # Create Blender Python script
        blender_script = f"""
import bpy
import os

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Import GLB
bpy.ops.import_scene.gltf(filepath="{input_path}")

# Quality settings
if "{quality}" == "low":
    # Reduce polygon count
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_add(type='DECIMATE')
            obj.modifiers["Decimate"].ratio = 0.3
elif "{quality}" == "medium":
    # Moderate polygon reduction
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_add(type='DECIMATE')
            obj.modifiers["Decimate"].ratio = 0.5

# Export compressed GLB
bpy.ops.export_scene.gltf(
    filepath="{output_path}",
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7
)
"""
        
        # Write script to temporary file
        script_path = "temp_blender_script.py"
        with open(script_path, "w") as f:
            f.write(blender_script)
        
        # Run Blender
        cmd = ["blender", "--background", "--python", script_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Clean up
        os.remove(script_path)
        
        if result.returncode == 0 and os.path.exists(output_path):
            # Calculate savings
            original_size = os.path.getsize(input_path) / (1024 * 1024)
            compressed_size = os.path.getsize(output_path) / (1024 * 1024)
            savings = ((original_size - compressed_size) / original_size) * 100
            
            print(f"✅ Blender compression successful!")
            print(f"📊 Original: {original_size:.1f} MB")
            print(f"📊 Compressed: {compressed_size:.1f} MB")
            print(f"💾 Savings: {savings:.1f}%")
            
            return True
        else:
            print(f"❌ Blender compression failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Blender compression failed: {e}")
        return False

def batch_compress_simple(input_dir, output_dir, quality="medium"):
    """Compress all GLB files using simple methods"""
    
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
        
        # Try trimesh first
        if compress_with_trimesh(str(glb_file), str(output_file), quality):
            successful += 1
        # Fallback to Blender if trimesh fails
        elif compress_with_blender(str(glb_file), str(output_file), quality):
            successful += 1
        else:
            print(f"❌ All compression methods failed for {glb_file.name}")
            continue
        
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
    print("🚀 Simple 3D Model Compression Tool")
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
    batch_compress_simple(uploads_dir, compressed_dir, quality)
    
    print(f"\n✨ Compression complete! Check {compressed_dir} for results.")

if __name__ == "__main__":
    main()
