#!/usr/bin/env python3
"""
Test script to verify server startup without errors
"""
import sys
import os

def test_imports():
    """Test if all imports work correctly"""
    try:
        print("Testing imports...")
        
        # Test basic imports
        import fastapi
        print("✅ FastAPI imported successfully")
        
        import uvicorn
        print("✅ Uvicorn imported successfully")
        
        # Test our custom modules
        from data_manager import DataManager
        print("✅ DataManager imported successfully")
        
        # Test server import
        from server import app
        print("✅ Server app imported successfully")
        
        print("\n🎉 All imports successful! Server should start without errors.")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def test_data_manager():
    """Test DataManager functionality"""
    try:
        print("\nTesting DataManager...")
        
        from data_manager import DataManager
        from pathlib import Path
        
        data_dir = Path(__file__).parent / "data"
        data_manager = DataManager(data_dir)
        
        print("✅ DataManager created successfully")
        print(f"✅ Data directory: {data_dir}")
        
        # Test basic operations
        data_manager.load_data()
        print("✅ DataManager.load_data() successful")
        
        summary = data_manager.get_data_summary()
        print("✅ DataManager.get_data_summary() successful")
        print(f"   Summary: {summary}")
        
        return True
        
    except Exception as e:
        print(f"❌ DataManager error: {e}")
        return False

if __name__ == "__main__":
    print("=== Testing Server Startup ===\n")
    
    success = True
    success &= test_imports()
    success &= test_data_manager()
    
    if success:
        print("\n🎯 All tests passed! Ready to deploy to Railway.")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Fix issues before deploying.")
        sys.exit(1)
