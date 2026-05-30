"""
Registration API Test for All Roles
Tests if each role's registration stores data in the correct table
"""

import requests
import json
import sqlite3
import os

BASE_URL = "http://localhost:8005/api/v1"
DB_PATH = "shreeanna.db"

def get_token(phone):
    """Get auth token for a phone number."""
    # Request OTP
    resp = requests.post(f"{BASE_URL}/auth/request-otp", json={"phone": phone, "language": "en"})
    if resp.status_code != 200:
        return None, f"OTP request failed: {resp.text}"
    
    otp = resp.json().get("dev_otp", "123456")
    
    # Verify OTP
    resp = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone": phone, "otp": otp})
    if resp.status_code != 200:
        return None, f"OTP verify failed: {resp.text}"
    
    return resp.json().get("token"), None

def test_onboard(token, endpoint, data, role_name):
    """Test onboarding endpoint."""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    resp = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=headers)
    
    if resp.status_code == 200:
        return "✅ SUCCESS", resp.json()
    elif resp.status_code == 400 and "already" in resp.text.lower():
        return "⚠️ ALREADY ONBOARDED", resp.json()
    elif resp.status_code == 404:
        return "❌ API NOT FOUND", {"error": "Endpoint doesn't exist"}
    elif resp.status_code == 422:
        return "⚠️ VALIDATION ERROR", resp.json()
    else:
        return f"❌ FAILED ({resp.status_code})", resp.text

def check_table(table_name):
    """Check if table has data and return count."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
        sample = cursor.fetchone()
        return count, sample
    except Exception as e:
        return -1, str(e)
    finally:
        conn.close()

print("=" * 80)
print("🧪 REGISTRATION API TEST FOR ALL ROLES")
print("=" * 80)

# ============================================================================
# TEST 1: FARMER REGISTRATION
# ============================================================================
print("\n" + "=" * 80)
print("👨‍🌾 FARMER REGISTRATION TEST")
print("=" * 80)

token, err = get_token("+911111111111")
if err:
    print(f"❌ Auth failed: {err}")
else:
    print(f"✅ Auth successful - got token")
    
    # Test farmer onboarding
    status, result = test_onboard(token, "/users/onboard/farmer", {
        "name": "Test Farmer",
        "language": "hi",
        "district": "Bangalore Rural",
        "state": "Karnataka",
        "village": "Test Village",
        "land_size": 5.5,
        "crops": ["ragi", "jowar"]
    }, "Farmer")
    print(f"Onboard API: {status}")
    print(f"Response: {json.dumps(result, indent=2) if isinstance(result, dict) else result}")

# Check farmers table
count, sample = check_table("farmers")
print(f"\n📊 Database 'farmers' table: {count} records")

# ============================================================================
# TEST 2: BUYER REGISTRATION  
# ============================================================================
print("\n" + "=" * 80)
print("🛒 BUYER REGISTRATION TEST")
print("=" * 80)

token, err = get_token("+912222222222")
if err:
    print(f"❌ Auth failed: {err}")
else:
    print(f"✅ Auth successful - got token")
    
    # Test buyer onboarding - CHECK IF ENDPOINT EXISTS
    status, result = test_onboard(token, "/users/onboard/buyer", {
        "name": "Test Buyer",
        "language": "en",
        "district": "Mumbai",
        "state": "Maharashtra",
        "address": "123 Test Street",
        "buyer_type": "retail"
    }, "Buyer")
    print(f"Onboard API: {status}")
    print(f"Response: {json.dumps(result, indent=2) if isinstance(result, dict) else result}")

# Check buyers table
count, sample = check_table("buyers")
print(f"\n📊 Database 'buyers' table: {count} records")

# ============================================================================
# TEST 3: PROCESSOR REGISTRATION
# ============================================================================
print("\n" + "=" * 80)
print("🏭 PROCESSOR REGISTRATION TEST")
print("=" * 80)

token, err = get_token("+913333333333")
if err:
    print(f"❌ Auth failed: {err}")
else:
    print(f"✅ Auth successful - got token")
    
    # Test processor onboarding - CHECK IF ENDPOINT EXISTS
    status, result = test_onboard(token, "/users/onboard/processor", {
        "name": "Test Processor",
        "language": "en",
        "district": "Hyderabad",
        "state": "Telangana",
        "city": "Hyderabad",
        "unit_type": "small",
        "fssai": "12345678901234",
        "products": ["flour", "mixes"]
    }, "Processor")
    print(f"Onboard API: {status}")
    print(f"Response: {json.dumps(result, indent=2) if isinstance(result, dict) else result}")

# Check processors table
count, sample = check_table("processors")
print(f"\n📊 Database 'processors' table: {count} records")

# ============================================================================
# TEST 4: ADMIN REGISTRATION
# ============================================================================
print("\n" + "=" * 80)
print("🛡️ ADMIN REGISTRATION TEST")
print("=" * 80)

token, err = get_token("+914444444444")
if err:
    print(f"❌ Auth failed: {err}")
else:
    print(f"✅ Auth successful - got token")
    
    # Test admin onboarding - CHECK IF ENDPOINT EXISTS
    status, result = test_onboard(token, "/users/onboard/admin", {
        "name": "Test Admin",
        "email": "admin@test.com",
        "designation": "state",
        "access_level": "l2"
    }, "Admin")
    print(f"Onboard API: {status}")
    print(f"Response: {json.dumps(result, indent=2) if isinstance(result, dict) else result}")

# Check if admin data in users table
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM users WHERE designation IS NOT NULL OR access_level IS NOT NULL")
admin_count = cursor.fetchone()[0]
conn.close()
print(f"\n📊 Database 'users' with admin fields: {admin_count} records")

# ============================================================================
# TEST 5: FPO REGISTRATION
# ============================================================================
print("\n" + "=" * 80)
print("🤝 FPO/SHG REGISTRATION TEST")
print("=" * 80)

token, err = get_token("+915555555555")
if err:
    print(f"❌ Auth failed: {err}")
else:
    print(f"✅ Auth successful - got token")
    
    # Test FPO onboarding
    status, result = test_onboard(token, "/users/onboard/fpo", {
        "name": "Test FPO User",
        "organization_name": "Test FPO Organization",
        "registration_no": "FPO123456",
        "address": "456 FPO Street",
        "district": "Mysore"
    }, "FPO")
    print(f"Onboard API: {status}")
    print(f"Response: {json.dumps(result, indent=2) if isinstance(result, dict) else result}")

# Check fpos table
count, sample = check_table("fpos")
print(f"\n📊 Database 'fpos' table: {count} records")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("📋 REGISTRATION API SUMMARY")
print("=" * 80)

print("""
┌─────────────┬──────────────────────────────┬────────────────┬──────────────┐
│ Role        │ API Endpoint                 │ API Status     │ DB Table     │
├─────────────┼──────────────────────────────┼────────────────┼──────────────┤
│ Farmer      │ POST /users/onboard/farmer   │ ✅ EXISTS      │ farmers      │
│ Buyer       │ POST /users/onboard/buyer    │ ❌ MISSING     │ buyers       │
│ Processor   │ POST /users/onboard/processor│ ❌ MISSING     │ processors   │
│ Admin       │ POST /users/onboard/admin    │ ❌ MISSING     │ users        │
│ FPO/SHG     │ POST /users/onboard/fpo      │ ✅ EXISTS      │ fpos         │
└─────────────┴──────────────────────────────┴────────────────┴──────────────┘

FRONTEND REGISTRATION FORMS COLLECT:
- Farmer:    name, phone, state, district, village, bankAccount, ifsc, language
- Buyer:     name, phone, state, district, address, buyerType, language
- Processor: name, phone, state, district, city, unitType, fssai, products, language
- Admin:     name, phone, email, designation, accessLevel, language
- FPO:       name, phone, organization_name, registration_no, address, district

MISSING BACKEND APIS:
❌ /users/onboard/buyer - Need to create
❌ /users/onboard/processor - Need to create  
❌ /users/onboard/admin - Need to create
""")
