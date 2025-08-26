#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PhoenixTrailersAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_product_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            self.log(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name}")
                try:
                    response_data = response.json()
                    self.log(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - {name}")
                self.log(f"   Expected status {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"   Error response: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"   Error response: {response.text}")
                return False, {}

        except Exception as e:
            self.log(f"❌ FAILED - {name} - Exception: {str(e)}")
            return False, {}

    def test_login(self):
        """Login with specified credentials: test+phoenix@mvp.dev / test12345"""
        test_email = "test+phoenix@mvp.dev"
        test_password = "test12345"
        
        # Try login first
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login", 
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log(f"✅ Login successful, token captured")
            return True
        else:
            # If login fails, try registration
            self.log("Login failed, attempting registration...")
            success, response = self.run_test(
                "User Registration (fallback)",
                "POST",
                "auth/register",
                200,
                data={"email": test_email, "password": test_password}
            )
            
            if success and 'access_token' in response:
                self.token = response['access_token']
                self.log(f"✅ Registration successful, token captured")
                return True
            else:
                self.log("❌ Both login and registration failed")
                return False

    def test_get_products_list(self):
        """Test 1: GET /api/products (should 200 list)"""
        success, response = self.run_test(
            "GET /api/products",
            "GET",
            "products",
            200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Products list retrieved successfully, found {len(response)} products")
            return True
        else:
            self.log("❌ Products list retrieval failed or invalid response format")
            return False

    def test_create_product(self):
        """Test 2: Create product via POST /api/products (after login) -> verify id"""
        if not self.token:
            self.log("❌ No token available for product creation")
            return False
            
        product_data = {
            "title": "Test Drop Deck",
            "description": "Test product for API validation",
            "images": ["https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_0985.jpg?fit=640%2C480&ssl=1"]
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "POST /api/products",
            "POST",
            "products",
            200,
            data=product_data,
            headers=headers
        )
        
        if success and 'id' in response:
            self.created_product_id = response['id']
            self.log(f"✅ Product created with ID: {self.created_product_id}")
            return True
        else:
            self.log("❌ Product creation failed or no ID in response")
            return False

    def test_get_product_by_id(self):
        """Test 3: GET /api/products/{id} -> returns created product"""
        if not self.created_product_id:
            self.log("❌ No product ID available for retrieval test")
            return False
            
        success, response = self.run_test(
            "GET /api/products/{id}",
            "GET",
            f"products/{self.created_product_id}",
            200
        )
        
        if success and response.get('id') == self.created_product_id:
            self.log(f"✅ Product retrieved successfully: {response.get('title')}")
            return True
        else:
            self.log("❌ Product retrieval failed or ID mismatch")
            return False

    def test_update_product(self):
        """Test 4: PUT /api/products/{id} -> change title to "Updated Deck" -> verify"""
        if not self.created_product_id or not self.token:
            self.log("❌ No product ID or token available for update test")
            return False
            
        update_data = {
            "title": "Updated Deck",
            "description": "Test product for API validation - UPDATED",
            "images": ["https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_0985.jpg?fit=640%2C480&ssl=1"]
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "PUT /api/products/{id}",
            "PUT",
            f"products/{self.created_product_id}",
            200,
            data=update_data,
            headers=headers
        )
        
        if success and response.get('title') == "Updated Deck":
            self.log(f"✅ Product updated successfully, title changed to: {response.get('title')}")
            return True
        else:
            self.log("❌ Product update failed or title not changed")
            return False

    def test_delete_product(self):
        """Test 5: DELETE /api/products/{id} -> ok true"""
        if not self.created_product_id or not self.token:
            self.log("❌ No product ID or token available for delete test")
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "DELETE /api/products/{id}",
            "DELETE",
            f"products/{self.created_product_id}",
            200,
            headers=headers
        )
        
        if success and response.get('ok') == True:
            self.log(f"✅ Product deleted successfully")
            return True
        else:
            self.log("❌ Product deletion failed or 'ok' not true")
            return False

    def run_all_tests(self):
        """Run all backend API tests as specified in review request"""
        self.log("🚀 Starting Phoenix Trailers Backend API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log(f"   API URL: {self.api_url}")
        
        # Test sequence as requested
        tests = [
            ("Login/Register", self.test_login),
            ("1) GET /api/products", self.test_get_products_list),
            ("2) Create product via POST /api/products", self.test_create_product),
            ("3) GET /api/products/{id}", self.test_get_product_by_id),
            ("4) PUT /api/products/{id}", self.test_update_product),
            ("5) DELETE /api/products/{id}", self.test_delete_product)
        ]
        
        results = []
        for test_name, test_func in tests:
            self.log(f"\n{'='*60}")
            result = test_func()
            results.append((test_name, result))
            
        # Print summary
        self.log(f"\n{'='*60}")
        self.log("📊 BACKEND TEST SUMMARY")
        self.log(f"   Tests Run: {self.tests_run}")
        self.log(f"   Tests Passed: {self.tests_passed}")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        self.log("\n📋 DETAILED RESULTS:")
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"   {status} - {test_name}")
        
        return self.tests_passed == self.tests_run

def main():
    """Run the specific backend tests as requested in review"""
    tester = PhoenixTrailersAPITester()
    
    # Run tests in the exact sequence requested
    print("🎯 BACKEND TESTS AS REQUESTED:")
    print("1) GET /api/products (should 200 list)")
    print("2) Create product via POST /api/products (after login) -> verify id") 
    print("3) GET /api/products/{id} -> returns created product")
    print("4) PUT /api/products/{id} -> change title to 'Updated Deck' -> verify")
    print("5) DELETE /api/products/{id} -> ok true")
    print("Using credentials: email test+phoenix@mvp.dev, password test12345")
    print("="*60)
    
    # Step 1: Login first
    if not tester.test_login():
        print("❌ Cannot proceed without authentication")
        return 1
    
    # Step 2: Test 1 - GET /api/products
    if not tester.test_get_products_list():
        print("❌ GET /api/products failed")
        return 1
    
    # Step 3: Test 2 - Create product
    if not tester.test_create_product():
        print("❌ POST /api/products failed")
        return 1
    
    # Step 4: Test 3 - GET product by ID
    if not tester.test_get_product_by_id():
        print("❌ GET /api/products/{id} failed")
        return 1
    
    # Step 5: Test 4 - Update product
    if not tester.test_update_product():
        print("❌ PUT /api/products/{id} failed")
        return 1
    
    # Step 6: Test 5 - Delete product
    if not tester.test_delete_product():
        print("❌ DELETE /api/products/{id} failed")
        return 1
    
    print("\n🎉 ALL BACKEND TESTS PASSED!")
    print(f"   Total Tests: {tester.tests_run}")
    print(f"   Passed: {tester.tests_passed}")
    return 0

if __name__ == "__main__":
    sys.exit(main())