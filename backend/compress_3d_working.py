#!/usr/bin/env python3
"""
Working 3D Model Compression Script
Fixed version that handles GLB files correctly
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

def compress_with_trimesh_fixed(input_path, output_path, quality="medium"):
    """Compress using trimesh library with correct API"""
    try:
        import trimesh
        
        print(f"🔧 Compressing {input_path} with trimesh...")
        
        # Load the mesh - trimesh can handle GLB files
        mesh = trimesh.load(input_path)
        
        # Check if it's a scene (multiple meshes) or single mesh
        if hasattr(mesh, 'geometry'):
            # It's a scene with multiple meshes
            print(f"📊 Scene detected with {len(mesh.geometry)} meshes")
            
            # Process each mesh in the scene
            for name, geom in mesh.geometry.items():
                if hasattr(geom, 'faces') and len(geom.faces) > 0:
                    print(f"📐 Processing mesh '{name}' with {len(geom.faces)} faces")
                    
                    # Quality settings for polygon reduction
                    if quality == "low":
                        target_faces = int(len(geom.faces) * 0.3)
                    elif quality == "medium":
                        target_faces = int(len(geom.faces) * 0.5)
                    else:  # high quality
                        target_faces = len(geom.faces)
                    
                    if target_faces < len(geom.faces):
                        # Use the correct method name for newer trimesh versions
                        try:
                            # Try the newer method first
                            geom = geom.simplify_quadric_decimation(target_faces)
                            print(f"✅ Reduced to {len(geom.faces)} faces")
                        except AttributeError:
                            try:
                                # Try alternative method
                                geom = geom.simplify_quadratic_decimation(target_faces)
                                print(f"✅ Reduced to {len(geom.faces)} faces")
                            except AttributeError:
                                print(f"⚠️ Could not reduce polygon count for {name}")
        else:
            # Single mesh
            print(f"📐 Single mesh with {len(mesh.faces)} faces")
            
            if quality != "high":
                target_faces = int(len(mesh.faces) * (0.5 if quality == "medium" else 0.3))
                
                try:
                    mesh = mesh.simplify_quadric_decimation(target_faces)
                    print(f"✅ Reduced to {len(mesh.faces)} faces")
                except AttributeError:
                    try:
                        mesh = mesh.simplify_quadratic_decimation(target_faces)
                        print(f"✅ Reduced to {len(mesh.faces)} faces")
                    except AttributeError:
                        print(f"⚠️ Could not reduce polygon count")
        
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

def compress_with_gltf_optimizer(input_path, output_path, quality="medium"):
    """Compress using gltf-transform if available"""
    try:
        # Try to use gltf-transform if it's available
        result = subprocess.run(["gltf-transform", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ gltf-transform not found. Skipping this method.")
            return False
            
        print(f"🔧 Compressing {input_path} with gltf-transform...")
        
        # Quality settings
        quality_settings = {
            "low": {"texture_max_size": 512, "draco_level": 7},
            "medium": {"texture_max_size": 1024, "draco_level": 5},
            "high": {"texture_max_size": 2048, "draco_level": 3}
        }
        
        settings = quality_settings[quality]
        
        cmd = [
            "gltf-transform", "optimize",
            input_path,
            output_path,
            "--texture-max-size", str(settings["texture_max_size"]),
            "--draco-compression",
            "--draco-compression-level", str(settings["draco_level"])
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        if os.path.exists(output_path):
            # Calculate savings
            original_size = os.path.getsize(input_path) / (1024 * 1024)
            compressed_size = os.path.getsize(output_path) / (1024 * 1024)
            savings = ((original_size - compressed_size) / original_size) * 100
            
            print(f"✅ gltf-transform compression successful!")
            print(f"📊 Original: {original_size:.1f} MB")
            print(f"📊 Compressed: {compressed_size:.1f} MB")
            print(f"💾 Savings: {savings:.1f}%")
            
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ gltf-transform compression failed: {e}")
        return False

def batch_compress_working(input_dir, output_dir, quality="medium"):
    """Compress all GLB files using working methods"""
    
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
        
        # Try different compression methods in order of preference
        compression_successful = False
        
        # Method 1: gltf-transform (best compression)
        if not compression_successful:
            compression_successful = compress_with_gltf_optimizer(str(glb_file), str(output_file), quality)
        
        # Method 2: trimesh (fallback)
        if not compression_successful:
            compression_successful = compress_with_trimesh_fixed(str(glb_file), str(output_file), quality)
        
        if compression_successful:
            successful += 1
            
            # Calculate sizes
            original_size = os.path.getsize(glb_file) / (1024 * 1024)
            compressed_size = os.path.getsize(output_file) / (1024 * 1024)
            
            total_original_size += original_size
            total_compressed_size += compressed_size
        else:
            print(f"❌ All compression methods failed for {glb_file.name}")
    
    # Summary
    print(f"\n🎯 Compression Summary:")
    print(f"✅ Successful: {successful}/{len(glb_files)}")
    
    if successful > 0:
        print(f"📊 Total Original: {total_original_size:.1f} MB")
        print(f"📊 Total Compressed: {total_compressed_size:.1f} MB")
        print(f"💾 Total Savings: {((total_original_size - total_compressed_size) / total_original_size) * 100:.1f}%")
    else:
        print("❌ No files were successfully compressed")

def main():
    """Main function"""
    print("🚀 Working 3D Model Compression Tool")
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
    batch_compress_working(uploads_dir, compressed_dir, quality)
    
    print(f"\n✨ Compression complete! Check {compressed_dir} for results.")

if __name__ == "__main__":
    main()
