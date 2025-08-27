#!/usr/bin/env python3
"""
Test script to verify data persistence
"""
import json
from pathlib import Path
from data_manager import DataManager

def test_data_persistence():
    """Test the data persistence functionality"""
    print("=== Testing Data Persistence ===")
    
    # Initialize DataManager
    data_dir = Path(__file__).parent / "data"
    data_manager = DataManager(data_dir)
    
    # Test 1: Load initial data
    print("\n1. Loading initial data...")
    data_manager.load_data()
    print(f"   Users: {len(data_manager.users_db)}")
    print(f"   Products: {len(data_manager.products_db)}")
    print(f"   Status checks: {len(data_manager.status_checks_db)}")
    
    # Test 2: Add some test data
    print("\n2. Adding test data...")
    
    # Add a test product
    test_product = {
        "id": "test-product-001",
        "title": "Test Product",
        "description": "This is a test product to verify persistence",
        "images": [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
    data_manager.products_db[test_product["id"]] = test_product
    
    # Add a test status check
    test_status = {
        "id": "test-status-001",
        "client_name": "Test Client",
        "timestamp": "2024-01-01T00:00:00"
    }
    data_manager.status_checks_db.append(test_status)
    
    # Test 3: Save data
    print("\n3. Saving data...")
    data_manager.save_data()
    
    # Test 4: Verify files exist
    print("\n4. Verifying files exist...")
    print(f"   Products file: {data_manager.products_file.exists()}")
    print(f"   Status file: {data_manager.status_file.exists()}")
    print(f"   Users file: {data_manager.users_file.exists()}")
    
    # Test 5: Check backup creation
    print("\n5. Checking backup creation...")
    backup_count = len(list(data_manager.backup_dir.glob("backup_*")))
    print(f"   Backup count: {backup_count}")
    
    # Test 6: Get data summary
    print("\n6. Data summary:")
    summary = data_manager.get_data_summary()
    for key, value in summary.items():
        print(f"   {key}: {value}")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_data_persistence()
