#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PhoenixTrailersAPITester:
    def __init__(self, base_url="https://phoenix-scraper.preview.emergentagent.com"):
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

    def test_api_health(self):
        """Test 1: GET /api/ and assert JSON contains message: 'Phoenix Trailers API is running'"""
        success, response = self.run_test(
            "API Health Check",
            "GET", 
            "",
            200
        )
        if success and response.get('message') == 'Phoenix Trailers API is running':
            self.log("✅ API health message verified")
            return True
        else:
            self.log(f"❌ API health message mismatch. Got: {response.get('message')}")
            return False

    def test_register(self):
        """Test 2: POST /api/auth/register with test credentials"""
        test_email = "test+phoenix@mvp.dev"
        test_password = "test12345"
        
        success, response = self.run_test(
            "User Registration",
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
            self.log("❌ Registration failed or no access_token in response")
            return False

    def test_login(self):
        """Test 3: POST /api/auth/login with same credentials"""
        test_email = "test+phoenix@mvp.dev"
        test_password = "test12345"
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login", 
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']  # Update token
            self.log(f"✅ Login successful, token updated")
            return True
        else:
            self.log("❌ Login failed or no access_token in response")
            return False

    def test_create_product(self):
        """Test 4: POST /api/products with Authorization header"""
        if not self.token:
            self.log("❌ No token available for product creation")
            return False
            
        product_data = {
            "title": "Tri-axle Drop Deck",
            "description": "Heavy-duty steel deck with beavertail.",
            "images": ["https://customer-assets.emergentagent.com/job_4d2a710e-d2a0-4ceb-9831-16c58e3b2668/artifacts/9ar8tgdj_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_57_19%20PM.png"]
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        success, response = self.run_test(
            "Create Product",
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

    def test_list_products(self):
        """Test 5: GET /api/products and ensure created product appears"""
        success, response = self.run_test(
            "List Products",
            "GET",
            "products",
            200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Products list retrieved, found {len(response)} products")
            
            # Check if our created product is in the list
            if self.created_product_id:
                found_product = None
                for product in response:
                    if product.get('id') == self.created_product_id:
                        found_product = product
                        break
                
                if found_product:
                    self.log(f"✅ Created product found in list: {found_product.get('title')}")
                    return True
                else:
                    self.log(f"❌ Created product with ID {self.created_product_id} not found in list")
                    return False
            else:
                self.log("⚠️  No product ID to verify, but list retrieval successful")
                return True
        else:
            self.log("❌ Products list retrieval failed or invalid response format")
            return False

    def run_all_tests(self):
        """Run all backend API tests in sequence"""
        self.log("🚀 Starting Phoenix Trailers API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log(f"   API URL: {self.api_url}")
        
        # Test sequence
        tests = [
            ("API Health", self.test_api_health),
            ("User Registration", self.test_register),
            ("User Login", self.test_login),
            ("Create Product", self.test_create_product),
            ("List Products", self.test_list_products)
        ]
        
        results = []
        for test_name, test_func in tests:
            self.log(f"\n{'='*50}")
            result = test_func()
            results.append((test_name, result))
            
        # Print summary
        self.log(f"\n{'='*50}")
        self.log("📊 TEST SUMMARY")
        self.log(f"   Tests Run: {self.tests_run}")
        self.log(f"   Tests Passed: {self.tests_passed}")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        self.log("\n📋 DETAILED RESULTS:")
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"   {status} - {test_name}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PhoenixTrailersAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())