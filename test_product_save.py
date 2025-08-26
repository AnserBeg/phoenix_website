import requests
import json

# Test the product creation API
def test_product_creation():
    base_url = "http://localhost:8000/api"
    
    # Step 1: Login to get token
    print("1. Logging in...")
    login_data = {
        "email": "seanm@phoenixtrailers.ca",
        "password": "123"
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            print(f"✅ Login successful! Token: {token[:20]}...")
        else:
            print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 2: Create a test product
    print("\n2. Creating test product...")
    product_data = {
        "title": "Test Product",
        "description": "This is a test product to verify the API works",
        "images": []
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        product_response = requests.post(f"{base_url}/products", json=product_data, headers=headers)
        if product_response.status_code == 200:
            product = product_response.json()
            print(f"✅ Product created successfully!")
            print(f"   ID: {product['id']}")
            print(f"   Title: {product['title']}")
            print(f"   Description: {product['description']}")
        else:
            print(f"❌ Product creation failed: {product_response.status_code} - {product_response.text}")
    except Exception as e:
        print(f"❌ Product creation error: {e}")
    
    # Step 3: Verify product was created
    print("\n3. Verifying product was saved...")
    try:
        products_response = requests.get(f"{base_url}/products")
        if products_response.status_code == 200:
            products = products_response.json()
            print(f"✅ Found {len(products)} products in database")
            for p in products:
                print(f"   - {p['title']} (ID: {p['id']})")
        else:
            print(f"❌ Failed to get products: {products_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting products: {e}")

if __name__ == "__main__":
    print("Testing Phoenix Trailers Product Creation API")
    print("=" * 50)
    test_product_creation()
