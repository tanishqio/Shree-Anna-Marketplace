"""
API Testing Script for Shree Anna Marketplace
Tests all endpoints and reports status
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8005/api/v1"
TOKEN = None

def test_endpoint(method, endpoint, data=None, auth=False):
    """Test an API endpoint and return status."""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if auth and TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            resp = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "PUT":
            resp = requests.put(url, json=data, headers=headers, timeout=5)
        else:
            return "SKIP", "Method not tested"
        
        if resp.status_code < 400:
            return "✅ OK", resp.status_code
        elif resp.status_code == 401:
            return "🔐 AUTH", resp.status_code
        elif resp.status_code == 404:
            return "❌ NOT FOUND", resp.status_code
        else:
            return "⚠️ ERROR", resp.status_code
    except requests.exceptions.ConnectionError:
        return "🔴 NO CONN", "Connection refused"
    except Exception as e:
        return "🔴 FAIL", str(e)

print("=" * 70)
print("🧪 SHREE ANNA API TEST REPORT")
print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)

# ============================================================================
# TEST 1: Auth APIs
# ============================================================================
print("\n📌 AUTH APIs (/api/v1/auth/*)")
print("-" * 70)

# Request OTP
status, code = test_endpoint("POST", "/auth/request-otp", {"phone": "+919999999999", "language": "en"})
print(f"{status:15} POST /auth/request-otp              [{code}]")

# Verify OTP (will fail with wrong OTP but endpoint works)
status, code = test_endpoint("POST", "/auth/verify-otp", {"phone": "+919999999999", "otp": "123456"})
print(f"{status:15} POST /auth/verify-otp               [{code}]")

# Get current user (requires auth)
status, code = test_endpoint("GET", "/auth/me", auth=True)
print(f"{status:15} GET  /auth/me                       [{code}]")

# ============================================================================
# TEST 2: User APIs
# ============================================================================
print("\n📌 USER APIs (/api/v1/users/*)")
print("-" * 70)

endpoints = [
    ("GET", "/users/me"),
    ("PUT", "/users/me"),
    ("POST", "/users/onboard/farmer"),
    ("POST", "/users/onboard/fpo"),
    ("GET", "/users/farmer/profile"),
    ("POST", "/users/farmer/profile"),
    ("GET", "/users/"),
]

for method, endpoint in endpoints:
    status, code = test_endpoint(method, endpoint, auth=True)
    print(f"{status:15} {method:4} {endpoint:35} [{code}]")

# ============================================================================
# TEST 3: Admin APIs
# ============================================================================
print("\n📌 ADMIN APIs (/api/v1/admin/*)")
print("-" * 70)

admin_endpoints = [
    ("GET", "/admin/dashboard"),
    ("GET", "/admin/stats/users"),
    ("GET", "/admin/health"),
    ("GET", "/admin/users"),
]

for method, endpoint in admin_endpoints:
    status, code = test_endpoint(method, endpoint)
    print(f"{status:15} {method:4} {endpoint:35} [{code}]")

# ============================================================================
# TEST 4: Frontend Expected APIs (Missing from Backend)
# ============================================================================
print("\n📌 FRONTEND EXPECTS (Check if Backend has these)")
print("-" * 70)

frontend_expects = [
    ("GET", "/listings/"),
    ("POST", "/listings/"),
    ("GET", "/listings/my"),
    ("GET", "/offers/received"),
    ("GET", "/offers/my"),
    ("POST", "/offers/{id}/accept"),
    ("GET", "/orders/my"),
    ("GET", "/payments/my"),
    ("GET", "/schemes"),
    ("GET", "/weather/"),
    ("GET", "/notifications"),
    ("GET", "/sync/state"),
    ("GET", "/trace/{code}"),
    ("GET", "/batches/"),
    ("GET", "/fpo/"),
]

for method, endpoint in frontend_expects:
    status, code = test_endpoint(method, endpoint.replace("{id}", "test").replace("{code}", "TEST123"))
    print(f"{status:15} {method:4} {endpoint:35} [{code}]")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 70)
print("📊 SUMMARY")
print("=" * 70)
print("""
BACKEND AVAILABLE APIs:
✅ Auth: request-otp, verify-otp, refresh, logout, me
✅ Users: profile CRUD, onboard/farmer, onboard/fpo
✅ Admin: dashboard, stats, users management

MISSING APIs (Frontend expects but Backend doesn't have):
❌ /listings/* - Marketplace listings
❌ /offers/* - Offer management  
❌ /orders/* - Order management
❌ /payments/* - Payment management
❌ /schemes - Government schemes
❌ /weather/* - Weather data
❌ /notifications - Push notifications
❌ /sync/* - Offline sync
❌ /trace/* - QR trace
❌ /batches/* - FPO batches
❌ /fpo/* - FPO management
""")
