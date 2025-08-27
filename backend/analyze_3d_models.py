#!/usr/bin/env python3
"""
3D Model Analysis Script
Analyzes GLB files to understand size differences and compression opportunities
"""

import os
import json
import struct
from pathlib import Path
from collections import defaultdict

def analyze_glb_structure(file_path):
    """Analyze the internal structure of a GLB file"""
    try:
        with open(file_path, 'rb') as f:
            # Read GLB header (12 bytes)
            header = f.read(12)
            magic, version, length = struct.unpack('<4sII', header)
            
            if magic != b'glTF':
                return None
            
            print(f"📊 File: {os.path.basename(file_path)}")
            print(f"   Size: {os.path.getsize(file_path) / (1024*1024):.1f} MB")
            print(f"   GLB Version: {version}")
            print(f"   Total Length: {length:,} bytes")
            
            # Read chunks
            chunks = []
            while f.tell() < length:
                chunk_header = f.read(8)
                if len(chunk_header) < 8:
                    break
                    
                chunk_length, chunk_type = struct.unpack('<II', chunk_header)
                chunk_data = f.read(chunk_length)
                
                chunk_info = {
                    'type': chunk_type,
                    'type_name': get_chunk_type_name(chunk_type),
                    'length': chunk_length,
                    'percentage': (chunk_length / length) * 100
                }
                chunks.append(chunk_info)
                
                print(f"   Chunk: {chunk_info['type_name']} ({chunk_info['type']:08x})")
                print(f"     Size: {chunk_length:,} bytes ({chunk_info['percentage']:.1f}%)")
                
                # Analyze JSON chunk (scene data)
                if chunk_type == 0x4E4F534A:  # JSON
                    try:
                        json_data = json.loads(chunk_data.decode('utf-8'))
                        analyze_json_content(json_data)
                    except:
                        print(f"     ⚠️ Could not parse JSON content")
                
                # Analyze binary chunk (mesh/texture data)
                elif chunk_type == 0x004E4942:  # BIN
                    print(f"     📦 Binary data (vertices, indices, textures)")
            
            print()
            return chunks
            
    except Exception as e:
        print(f"❌ Error analyzing {file_path}: {e}")
        return None

def get_chunk_type_name(chunk_type):
    """Get human-readable name for chunk type"""
    chunk_names = {
        0x4E4F534A: "JSON",
        0x004E4942: "BIN"
    }
    return chunk_names.get(chunk_type, f"Unknown ({chunk_type:08x})")

def analyze_json_content(json_data):
    """Analyze the JSON content of a GLB file"""
    try:
        # Count meshes
        mesh_count = len(json_data.get('meshes', []))
        if mesh_count > 0:
            total_vertices = 0
            total_faces = 0
            
            for mesh in json_data['meshes']:
                for primitive in mesh.get('primitives', []):
                    if 'attributes' in primitive:
                        # Count vertices (usually in POSITION attribute)
                        if 'POSITION' in primitive['attributes']:
                            accessor_idx = primitive['attributes']['POSITION']
                            accessor = json_data['accessors'][accessor_idx]
                            vertex_count = accessor.get('count', 0)
                            total_vertices += vertex_count
                    
                    # Count faces (indices)
                    if 'indices' in primitive:
                        accessor_idx = primitive['indices']
                        accessor = json_data['accessors'][accessor_idx]
                        face_count = accessor.get('count', 0) // 3  # 3 indices per triangle
                        total_faces += face_count
            
            print(f"     📐 Meshes: {mesh_count}")
            print(f"     📍 Total Vertices: {total_vertices:,}")
            print(f"     🔺 Total Faces: {total_faces:,}")
        
        # Count textures
        texture_count = len(json_data.get('images', []))
        if texture_count > 0:
            print(f"     🖼️ Textures: {texture_count}")
            
            # Analyze texture sizes
            for image in json_data.get('images', []):
                if 'uri' in image:
                    print(f"       📱 Texture: {image['uri']}")
        
        # Count materials
        material_count = len(json_data.get('materials', []))
        if material_count > 0:
            print(f"     🎨 Materials: {material_count}")
            
    except Exception as e:
        print(f"     ⚠️ Could not analyze JSON content: {e}")

def analyze_file_sizes(directory):
    """Analyze file sizes and find patterns"""
    glb_files = list(Path(directory).glob("*.glb"))
    
    if not glb_files:
        print("❌ No GLB files found")
        return
    
    print("🔍 File Size Analysis")
    print("=" * 50)
    
    # Group files by size ranges
    size_groups = defaultdict(list)
    
    for glb_file in glb_files:
        size_mb = os.path.getsize(glb_file) / (1024 * 1024)
        
        if size_mb < 5:
            group = "Small (<5MB)"
        elif size_mb < 15:
            group = "Medium (5-15MB)"
        elif size_mb < 30:
            group = "Large (15-30MB)"
        else:
            group = "Very Large (>30MB)"
        
        size_groups[group].append((glb_file.name, size_mb))
    
    # Display grouping
    for group, files in size_groups.items():
        print(f"\n📁 {group}:")
        for filename, size in sorted(files, key=lambda x: x[1]):
            print(f"   {filename}: {size:.1f} MB")
    
    # Find outliers
    sizes = [os.path.getsize(f) for f in glb_files]
    avg_size = sum(sizes) / len(sizes)
    
    print(f"\n📊 Size Statistics:")
    print(f"   Average: {avg_size / (1024*1024):.1f} MB")
    print(f"   Smallest: {min(sizes) / (1024*1024):.1f} MB")
    print(f"   Largest: {max(sizes) / (1024*1024):.1f} MB")
    print(f"   Range: {(max(sizes) - min(sizes)) / (1024*1024):.1f} MB")
    
    # Identify potential outliers
    outliers = []
    for glb_file in glb_files:
        size = os.path.getsize(glb_file)
        if size > avg_size * 2:  # More than 2x average
            outliers.append((glb_file.name, size / (1024*1024)))
    
    if outliers:
        print(f"\n⚠️ Potential Outliers (2x+ average size):")
        for filename, size in outliers:
            print(f"   {filename}: {size:.1f} MB")

def suggest_compression_strategy(directory):
    """Suggest compression strategy based on analysis"""
    print(f"\n🎯 Compression Strategy Recommendations")
    print("=" * 50)
    
    glb_files = list(Path(directory).glob("*.glb"))
    if not glb_files:
        return
    
    # Analyze each file
    file_analysis = []
    
    for glb_file in glb_files:
        size_mb = os.path.getsize(glb_file) / (1024 * 1024)
        
        # Determine compression approach based on size
        if size_mb > 30:
            approach = "AGGRESSIVE - High polygon reduction + texture compression"
            target_size = size_mb * 0.3  # 70% reduction
        elif size_mb > 15:
            approach = "MODERATE - Polygon reduction + texture optimization"
            target_size = size_mb * 0.5  # 50% reduction
        elif size_mb > 5:
            approach = "LIGHT - Texture compression + minor optimization"
            target_size = size_mb * 0.7  # 30% reduction
        else:
            approach = "MINIMAL - Basic optimization only"
            target_size = size_mb * 0.9  # 10% reduction
        
        file_analysis.append({
            'name': glb_file.name,
            'current_size': size_mb,
            'target_size': target_size,
            'approach': approach
        })
    
    # Display recommendations
    for analysis in file_analysis:
        print(f"\n📁 {analysis['name']}:")
        print(f"   Current: {analysis['current_size']:.1f} MB")
        print(f"   Target: {analysis['target_size']:.1f} MB")
        print(f"   Strategy: {analysis['approach']}")
    
    # Overall strategy
    total_current = sum(a['current_size'] for a in file_analysis)
    total_target = sum(a['target_size'] for a in file_analysis)
    total_savings = ((total_current - total_target) / total_current) * 100
    
    print(f"\n🎯 Overall Strategy:")
    print(f"   Total Current: {total_current:.1f} MB")
    print(f"   Total Target: {total_target:.1f} MB")
    print(f"   Expected Savings: {total_savings:.1f}%")
    print(f"   Priority: Focus on files >15MB first")

def main():
    """Main function"""
    print("🔍 3D Model Analysis Tool")
    print("=" * 50)
    
    # Get current directory
    current_dir = Path(__file__).parent
    uploads_dir = current_dir / "uploads"
    
    if not uploads_dir.exists():
        print(f"❌ Uploads directory not found: {uploads_dir}")
        return
    
    print(f"📁 Analyzing directory: {uploads_dir}")
    
    # Step 1: Analyze file sizes and group them
    analyze_file_sizes(uploads_dir)
    
    # Step 2: Analyze individual file structures
    print(f"\n🔬 Detailed File Analysis")
    print("=" * 50)
    
    glb_files = list(uploads_dir.glob("*.glb"))
    for glb_file in glb_files:
        analyze_glb_structure(glb_file)
    
    # Step 3: Suggest compression strategy
    suggest_compression_strategy(uploads_dir)
    
    print(f"\n✨ Analysis complete! Use this information to optimize your compression strategy.")

if __name__ == "__main__":
    main()
