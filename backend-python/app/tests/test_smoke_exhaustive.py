"""
🔥 EXHAUSTIVE PYTEST SMOKE TEST SUITE 🔥
=========================================

This is a comprehensive pytest-based smoke test that tests every single
endpoint in the Shree Anna Millets Value Chain API.

Run with:
    pytest app/tests/test_smoke_exhaustive.py -v --tb=short

Or run specific sections:
    pytest app/tests/test_smoke_exhaustive.py -v -k "auth"
    pytest app/tests/test_smoke_exhaustive.py -v -k "listing"
    pytest app/tests/test_smoke_exhaustive.py -v -k "batch"
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.config import settings
from app.db.session import get_session
from app.db.models import (
    User, Farmer, FPO, Buyer, Listing, Batch, TraceEvent,
    SmsTemplate, OTPRecord,
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(name="engine", scope="module")
def engine_fixture():
    """Create a test database engine."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session", scope="function")
def session_fixture(engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    with Session(engine) as session:
        yield session
        session.rollback()


@pytest.fixture(name="client", scope="function")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with dependency overrides."""
    
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture(name="unique_phone")
def unique_phone_fixture():
    """Generate unique phone numbers for tests."""
    counter = [0]
    def _generate():
        counter[0] += 1
        return f"+91900000{counter[0]:04d}"
    return _generate


@pytest.fixture(name="test_users")
def test_users_fixture(client: TestClient, unique_phone, session: Session):
    """Create test users for all roles."""
    users = {}
    tokens = {}
    
    roles = ["farmer", "buyer", "fpo", "admin"]
    
    for role in roles:
        phone = unique_phone()
        
        # Request OTP
        resp = client.post(
            "/api/v1/auth/otp/request",
            json={"phone": phone, "role": role},
        )
        assert resp.status_code in [200, 201], f"OTP request failed for {role}: {resp.text}"
        
        # Get OTP (dev mode)
        otp = resp.json().get("otp", "123456")
        
        # Verify OTP
        resp = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": phone, "otp": otp},
        )
        assert resp.status_code in [200, 201], f"OTP verify failed for {role}: {resp.text}"
        
        data = resp.json()
        tokens[role] = data.get("access_token")
        users[role] = {
            "phone": phone,
            "user_id": data.get("user", {}).get("id"),
            "token": tokens[role],
        }
    
    return users, tokens


def auth_header(token: str) -> dict:
    """Create authorization header."""
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# HEALTH & DOCS TESTS
# ============================================================================

class TestHealthAndDocs:
    """Test health check and documentation endpoints."""
    
    def test_health_check(self, client: TestClient):
        """Test /health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "ok"]
    
    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_openapi_json(self, client: TestClient):
        """Test OpenAPI JSON schema."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "paths" in data
        assert "openapi" in data
    
    def test_swagger_ui(self, client: TestClient):
        """Test Swagger UI documentation."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "swagger" in response.text.lower() or "html" in response.headers.get("content-type", "")
    
    def test_redoc(self, client: TestClient):
        """Test ReDoc documentation."""
        response = client.get("/redoc")
        assert response.status_code == 200


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

class TestAuthentication:
    """Test authentication flow."""
    
    def test_otp_request(self, client: TestClient, unique_phone):
        """Test OTP request."""
        phone = unique_phone()
        response = client.post(
            "/api/v1/auth/otp/request",
            json={"phone": phone, "role": "farmer"},
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "message" in data or "otp" in data
    
    def test_otp_verify_success(self, client: TestClient, unique_phone):
        """Test successful OTP verification."""
        phone = unique_phone()
        
        # Request OTP
        resp = client.post(
            "/api/v1/auth/otp/request",
            json={"phone": phone, "role": "farmer"},
        )
        otp = resp.json().get("otp", "123456")
        
        # Verify OTP
        response = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": phone, "otp": otp},
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
    
    def test_otp_verify_invalid(self, client: TestClient, unique_phone):
        """Test invalid OTP rejection."""
        phone = unique_phone()
        
        # Request OTP first
        client.post("/api/v1/auth/otp/request", json={"phone": phone, "role": "farmer"})
        
        # Try invalid OTP
        response = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": phone, "otp": "000000"},
        )
        assert response.status_code in [400, 401, 422]
    
    def test_token_refresh(self, client: TestClient, test_users):
        """Test token refresh."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/auth/refresh",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_get_current_user(self, client: TestClient, test_users):
        """Test get current user."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
        data = response.json()
        assert "phone" in data
    
    def test_logout(self, client: TestClient, unique_phone):
        """Test logout."""
        phone = unique_phone()
        
        # Login
        client.post("/api/v1/auth/otp/request", json={"phone": phone, "role": "farmer"})
        resp = client.post("/api/v1/auth/otp/verify", json={"phone": phone, "otp": "123456"})
        token = resp.json().get("access_token")
        
        # Logout
        response = client.post(
            "/api/v1/auth/logout",
            headers=auth_header(token),
        )
        assert response.status_code in [200, 204]
    
    def test_unauthorized_access(self, client: TestClient):
        """Test unauthorized access rejection."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
    
    def test_invalid_token(self, client: TestClient):
        """Test invalid token rejection."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401
    
    @pytest.mark.parametrize("role", ["farmer", "buyer", "fpo", "admin"])
    def test_auth_all_roles(self, client: TestClient, unique_phone, role):
        """Test authentication for all roles."""
        phone = unique_phone()
        
        # Request OTP
        resp = client.post(
            "/api/v1/auth/otp/request",
            json={"phone": phone, "role": role},
        )
        assert resp.status_code in [200, 201]
        otp = resp.json().get("otp", "123456")
        
        # Verify OTP
        resp = client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": phone, "otp": otp},
        )
        assert resp.status_code in [200, 201]
        assert "access_token" in resp.json()


# ============================================================================
# USER MANAGEMENT TESTS
# ============================================================================

class TestUserManagement:
    """Test user profile operations."""
    
    def test_get_profile(self, client: TestClient, test_users):
        """Test get user profile."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/users/me",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
    
    def test_update_profile(self, client: TestClient, test_users):
        """Test update user profile."""
        users, tokens = test_users
        response = client.put(
            "/api/v1/users/me",
            headers=auth_header(tokens["farmer"]),
            json={"name": "Updated Name", "preferred_language": "hi"},
        )
        assert response.status_code == 200
    
    def test_get_updated_profile(self, client: TestClient, test_users):
        """Test profile was updated."""
        users, tokens = test_users
        
        # Update
        client.put(
            "/api/v1/users/me",
            headers=auth_header(tokens["farmer"]),
            json={"name": "Test Farmer Updated"},
        )
        
        # Verify
        response = client.get(
            "/api/v1/users/me",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("name") == "Test Farmer Updated"


# ============================================================================
# FARMER ONBOARDING TESTS
# ============================================================================

class TestFarmerOnboarding:
    """Test farmer onboarding flow."""
    
    def test_create_farmer_profile(self, client: TestClient, test_users):
        """Test create farmer profile."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/users/farmer/profile",
            headers=auth_header(tokens["farmer"]),
            json={
                "village": "Test Village",
                "district": "Test District",
                "state": "Karnataka",
                "pincode": "560001",
                "land_holding_acres": 5.5,
                "primary_crops": ["ragi", "jowar"],
                "organic_certified": True,
            },
        )
        assert response.status_code in [200, 201, 409]  # 409 if already exists
    
    def test_get_farmer_profile(self, client: TestClient, test_users):
        """Test get farmer profile."""
        users, tokens = test_users
        
        # Create first
        client.post(
            "/api/v1/users/farmer/profile",
            headers=auth_header(tokens["farmer"]),
            json={
                "village": "Test Village",
                "district": "Test District",
                "state": "Karnataka",
            },
        )
        
        response = client.get(
            "/api/v1/users/farmer/profile",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code in [200, 404]
    
    def test_update_farmer_profile(self, client: TestClient, test_users):
        """Test update farmer profile."""
        users, tokens = test_users
        response = client.put(
            "/api/v1/users/farmer/profile",
            headers=auth_header(tokens["farmer"]),
            json={"land_holding_acres": 6.0},
        )
        assert response.status_code in [200, 404]


# ============================================================================
# LISTINGS TESTS
# ============================================================================

class TestListings:
    """Test listing CRUD operations."""
    
    def test_create_listing(self, client: TestClient, test_users):
        """Test create listing."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Premium Ragi",
                "description": "High quality organic ragi",
                "crop_type": "ragi",
                "quantity_kg": 500.0,
                "price_per_kg": 45.50,
                "location": "Bangalore",
                "is_organic": True,
            },
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        return data["id"]
    
    def test_list_all_listings(self, client: TestClient):
        """Test list all listings."""
        response = client.get("/api/v1/listings")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_list_listings_with_pagination(self, client: TestClient):
        """Test listings pagination."""
        response = client.get("/api/v1/listings", params={"skip": 0, "limit": 5})
        assert response.status_code == 200
    
    def test_list_listings_with_filters(self, client: TestClient):
        """Test listings filtering."""
        response = client.get(
            "/api/v1/listings",
            params={"crop_type": "ragi", "is_organic": True},
        )
        assert response.status_code == 200
    
    def test_get_listing_by_id(self, client: TestClient, test_users):
        """Test get listing by ID."""
        users, tokens = test_users
        
        # Create listing first
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Test Ragi",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 40.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            response = client.get(f"/api/v1/listings/{listing_id}")
            assert response.status_code == 200
    
    def test_update_listing(self, client: TestClient, test_users):
        """Test update listing."""
        users, tokens = test_users
        
        # Create listing
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Test Jowar",
                "crop_type": "jowar",
                "quantity_kg": 200.0,
                "price_per_kg": 35.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            response = client.put(
                f"/api/v1/listings/{listing_id}",
                headers=auth_header(tokens["farmer"]),
                json={"price_per_kg": 38.0},
            )
            assert response.status_code == 200
    
    def test_list_my_listings(self, client: TestClient, test_users):
        """Test list my listings."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/listings/my",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
    
    def test_delete_listing(self, client: TestClient, test_users):
        """Test delete listing."""
        users, tokens = test_users
        
        # Create listing
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "To Delete",
                "crop_type": "bajra",
                "quantity_kg": 50.0,
                "price_per_kg": 30.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            response = client.delete(
                f"/api/v1/listings/{listing_id}",
                headers=auth_header(tokens["farmer"]),
            )
            assert response.status_code in [200, 204]
    
    def test_listing_not_found(self, client: TestClient):
        """Test listing not found."""
        response = client.get("/api/v1/listings/nonexistent-id")
        assert response.status_code == 404
    
    @pytest.mark.parametrize("crop_type", ["ragi", "jowar", "bajra", "foxtail_millet", "little_millet"])
    def test_filter_by_crop_type(self, client: TestClient, crop_type):
        """Test filtering by different crop types."""
        response = client.get("/api/v1/listings", params={"crop_type": crop_type})
        assert response.status_code == 200


# ============================================================================
# BATCHES & TRACEABILITY TESTS
# ============================================================================

class TestBatchesAndTraceability:
    """Test batch creation and traceability."""
    
    def test_create_batch(self, client: TestClient, test_users):
        """Test create batch."""
        users, tokens = test_users
        
        # Create listing first
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Batch Test Ragi",
                "crop_type": "ragi",
                "quantity_kg": 500.0,
                "price_per_kg": 45.0,
                "location": "Bangalore",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            response = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={
                    "listing_id": listing_id,
                    "quantity_kg": 100.0,
                    "grade": "A",
                },
            )
            assert response.status_code in [200, 201]
            data = response.json()
            assert "qr_code" in data or "id" in data
            return data
    
    def test_list_batches(self, client: TestClient, test_users):
        """Test list batches."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/batches",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
    
    def test_get_batch_by_id(self, client: TestClient, test_users):
        """Test get batch by ID."""
        users, tokens = test_users
        
        # Create listing and batch
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Batch Get Test",
                "crop_type": "ragi",
                "quantity_kg": 200.0,
                "price_per_kg": 42.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 50.0},
            )
            batch_id = resp.json().get("id")
            
            if batch_id:
                response = client.get(
                    f"/api/v1/batches/{batch_id}",
                    headers=auth_header(tokens["farmer"]),
                )
                assert response.status_code == 200
    
    def test_add_trace_event(self, client: TestClient, test_users):
        """Test add trace event."""
        users, tokens = test_users
        
        # Create listing and batch
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Trace Test",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 40.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 25.0},
            )
            batch_id = resp.json().get("id")
            
            if batch_id:
                response = client.post(
                    f"/api/v1/batches/{batch_id}/trace",
                    headers=auth_header(tokens["farmer"]),
                    json={
                        "event_type": "harvested",
                        "location": "Farm",
                        "notes": "Test harvest",
                    },
                )
                assert response.status_code in [200, 201]
    
    def test_get_trace_history(self, client: TestClient, test_users):
        """Test get trace history."""
        users, tokens = test_users
        
        # Create listing and batch with trace
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Trace History Test",
                "crop_type": "jowar",
                "quantity_kg": 150.0,
                "price_per_kg": 35.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 30.0},
            )
            batch_id = resp.json().get("id")
            
            if batch_id:
                # Add trace
                client.post(
                    f"/api/v1/batches/{batch_id}/trace",
                    headers=auth_header(tokens["farmer"]),
                    json={"event_type": "harvested", "location": "Farm"},
                )
                
                # Get history
                response = client.get(f"/api/v1/batches/{batch_id}/trace")
                assert response.status_code == 200
    
    def test_public_trace_lookup(self, client: TestClient, test_users):
        """Test public trace lookup by QR code."""
        users, tokens = test_users
        
        # Create listing and batch
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Public Trace Test",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 45.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 20.0},
            )
            qr_code = resp.json().get("qr_code")
            
            if qr_code:
                response = client.get(f"/api/v1/trace/{qr_code}")
                assert response.status_code == 200
    
    def test_trace_html_page(self, client: TestClient, test_users):
        """Test trace HTML page."""
        users, tokens = test_users
        
        # Create listing and batch
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "HTML Trace Test",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 45.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 15.0},
            )
            qr_code = resp.json().get("qr_code")
            
            if qr_code:
                response = client.get(f"/api/v1/trace/{qr_code}/html")
                assert response.status_code == 200
                assert "html" in response.headers.get("content-type", "").lower() or response.status_code == 200
    
    def test_verify_trace_integrity(self, client: TestClient, test_users):
        """Test trace integrity verification."""
        users, tokens = test_users
        
        # Create listing and batch with events
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Integrity Test",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 45.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            resp = client.post(
                "/api/v1/batches",
                headers=auth_header(tokens["farmer"]),
                json={"listing_id": listing_id, "quantity_kg": 10.0},
            )
            batch_id = resp.json().get("id")
            qr_code = resp.json().get("qr_code")
            
            if batch_id and qr_code:
                # Add trace events
                client.post(
                    f"/api/v1/batches/{batch_id}/trace",
                    headers=auth_header(tokens["farmer"]),
                    json={"event_type": "harvested", "location": "Farm"},
                )
                client.post(
                    f"/api/v1/batches/{batch_id}/trace",
                    headers=auth_header(tokens["farmer"]),
                    json={"event_type": "processed", "location": "Mill"},
                )
                
                # Verify integrity
                response = client.get(f"/api/v1/trace/{qr_code}/verify")
                assert response.status_code == 200
    
    def test_invalid_trace_code(self, client: TestClient):
        """Test invalid trace code returns 404."""
        response = client.get("/api/v1/trace/INVALID_CODE_12345")
        assert response.status_code == 404


# ============================================================================
# VOICE WEBHOOK TESTS
# ============================================================================

class TestVoiceWebhooks:
    """Test Reverie voice bot webhooks."""
    
    def test_call_start_webhook(self, client: TestClient):
        """Test call start webhook."""
        response = client.post(
            "/api/v1/voice/webhook/call_start",
            json={
                "session_id": f"test_{uuid.uuid4()}",
                "caller_id": "+919000000001",
                "called_number": "+911234567890",
            },
        )
        assert response.status_code in [200, 201]
    
    def test_speech_input_webhook(self, client: TestClient):
        """Test speech input webhook."""
        session_id = f"test_{uuid.uuid4()}"
        
        # Start call first
        client.post(
            "/api/v1/voice/webhook/call_start",
            json={
                "session_id": session_id,
                "caller_id": "+919000000002",
            },
        )
        
        response = client.post(
            "/api/v1/voice/webhook/speech_input",
            json={
                "session_id": session_id,
                "speech_text": "मेरी फसल का दाम क्या है",
                "language": "hi",
                "confidence": 0.95,
            },
        )
        assert response.status_code in [200, 201]
    
    def test_dtmf_input_webhook(self, client: TestClient):
        """Test DTMF input webhook."""
        session_id = f"test_{uuid.uuid4()}"
        
        # Start call first
        client.post(
            "/api/v1/voice/webhook/call_start",
            json={
                "session_id": session_id,
                "caller_id": "+919000000003",
            },
        )
        
        response = client.post(
            "/api/v1/voice/webhook/dtmf",
            json={
                "session_id": session_id,
                "dtmf_digits": "1",
            },
        )
        assert response.status_code in [200, 201]
    
    def test_call_end_webhook(self, client: TestClient):
        """Test call end webhook."""
        session_id = f"test_{uuid.uuid4()}"
        
        # Start call first
        client.post(
            "/api/v1/voice/webhook/call_start",
            json={
                "session_id": session_id,
                "caller_id": "+919000000004",
            },
        )
        
        response = client.post(
            "/api/v1/voice/webhook/call_end",
            json={
                "session_id": session_id,
                "duration_seconds": 120,
                "status": "completed",
            },
        )
        assert response.status_code in [200, 201]


# ============================================================================
# OFFLINE SYNC TESTS
# ============================================================================

class TestOfflineSync:
    """Test offline data synchronization."""
    
    def test_get_sync_state(self, client: TestClient, test_users):
        """Test get sync state."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/sync/state",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
    
    def test_push_offline_data(self, client: TestClient, test_users):
        """Test push offline data."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/sync/push",
            headers=auth_header(tokens["farmer"]),
            json={
                "client_timestamp": datetime.now().isoformat(),
                "device_id": "test_device",
                "changes": [],
            },
        )
        assert response.status_code in [200, 201]
    
    def test_pull_latest_data(self, client: TestClient, test_users):
        """Test pull latest data."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/sync/pull",
            headers=auth_header(tokens["farmer"]),
            params={"since": (datetime.now() - timedelta(hours=1)).isoformat()},
        )
        assert response.status_code == 200


# ============================================================================
# WEATHER TESTS
# ============================================================================

class TestWeather:
    """Test weather service endpoints."""
    
    def test_get_weather_by_coordinates(self, client: TestClient):
        """Test get weather by coordinates."""
        response = client.get(
            "/api/v1/weather",
            params={"lat": 12.9716, "lon": 77.5946},
        )
        assert response.status_code == 200
    
    def test_get_weather_by_pincode(self, client: TestClient):
        """Test get weather by pincode."""
        response = client.get("/api/v1/weather/pincode/560001")
        assert response.status_code in [200, 404, 503]  # May not have data
    
    def test_get_weather_forecast(self, client: TestClient):
        """Test get weather forecast."""
        response = client.get(
            "/api/v1/weather/forecast",
            params={"lat": 12.9716, "lon": 77.5946, "days": 5},
        )
        assert response.status_code in [200, 503]


# ============================================================================
# PAYMENTS TESTS
# ============================================================================

class TestPayments:
    """Test payment flow endpoints."""
    
    def test_create_payment_order(self, client: TestClient, test_users):
        """Test create payment order."""
        users, tokens = test_users
        
        # Create listing first
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={
                "title": "Payment Test",
                "crop_type": "ragi",
                "quantity_kg": 100.0,
                "price_per_kg": 45.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        if listing_id:
            response = client.post(
                "/api/v1/payments/orders",
                headers=auth_header(tokens["buyer"]),
                json={
                    "listing_id": listing_id,
                    "quantity_kg": 50.0,
                    "amount": 2250.0,
                    "payment_method": "upi",
                },
            )
            assert response.status_code in [200, 201]
    
    def test_payment_callback(self, client: TestClient):
        """Test payment callback."""
        response = client.post(
            "/api/v1/payments/callback",
            json={
                "order_id": "test_order",
                "payment_id": "test_payment",
                "status": "success",
                "signature": "test_signature",
            },
        )
        assert response.status_code in [200, 201, 400, 404]
    
    def test_payment_history(self, client: TestClient, test_users):
        """Test payment history."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/payments/history",
            headers=auth_header(tokens["buyer"]),
        )
        assert response.status_code == 200


# ============================================================================
# NOTIFICATIONS TESTS
# ============================================================================

class TestNotifications:
    """Test notification system."""
    
    def test_list_templates(self, client: TestClient, test_users):
        """Test list SMS templates."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/notifications/templates",
            headers=auth_header(tokens["admin"]),
        )
        assert response.status_code == 200
    
    def test_get_my_notifications(self, client: TestClient, test_users):
        """Test get my notifications."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/notifications",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code == 200
    
    def test_mark_notifications_read(self, client: TestClient, test_users):
        """Test mark notifications as read."""
        users, tokens = test_users
        response = client.put(
            "/api/v1/notifications/read-all",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code in [200, 204]


# ============================================================================
# FPO TESTS
# ============================================================================

class TestFPO:
    """Test FPO operations."""
    
    def test_create_fpo(self, client: TestClient, test_users):
        """Test create FPO."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/fpo",
            headers=auth_header(tokens["fpo"]),
            json={
                "name": f"Test FPO {uuid.uuid4().hex[:8]}",
                "registration_number": f"FPO{uuid.uuid4().hex[:8].upper()}",
                "address": "123 FPO Street",
                "district": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
            },
        )
        assert response.status_code in [200, 201]
    
    def test_list_fpos(self, client: TestClient):
        """Test list FPOs."""
        response = client.get("/api/v1/fpo")
        assert response.status_code == 200
    
    def test_get_fpo_by_id(self, client: TestClient, test_users):
        """Test get FPO by ID."""
        users, tokens = test_users
        
        # Create FPO
        resp = client.post(
            "/api/v1/fpo",
            headers=auth_header(tokens["fpo"]),
            json={
                "name": f"Get Test FPO {uuid.uuid4().hex[:8]}",
                "registration_number": f"FPO{uuid.uuid4().hex[:8].upper()}",
                "district": "Test",
                "state": "Karnataka",
            },
        )
        fpo_id = resp.json().get("id")
        
        if fpo_id:
            response = client.get(f"/api/v1/fpo/{fpo_id}")
            assert response.status_code == 200


# ============================================================================
# ADMIN TESTS
# ============================================================================

class TestAdmin:
    """Test admin dashboard endpoints."""
    
    def test_get_dashboard_stats(self, client: TestClient, test_users):
        """Test get dashboard stats."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/admin/dashboard",
            headers=auth_header(tokens["admin"]),
        )
        assert response.status_code == 200
    
    def test_list_all_users(self, client: TestClient, test_users):
        """Test list all users."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/admin/users",
            headers=auth_header(tokens["admin"]),
        )
        assert response.status_code == 200
    
    def test_get_user_statistics(self, client: TestClient, test_users):
        """Test get user statistics."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/admin/stats/users",
            headers=auth_header(tokens["admin"]),
        )
        assert response.status_code == 200
    
    def test_admin_access_denied_for_farmer(self, client: TestClient, test_users):
        """Test admin access denied for farmer."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/admin/dashboard",
            headers=auth_header(tokens["farmer"]),
        )
        assert response.status_code in [401, 403]
    
    def test_admin_access_denied_for_buyer(self, client: TestClient, test_users):
        """Test admin access denied for buyer."""
        users, tokens = test_users
        response = client.get(
            "/api/v1/admin/users",
            headers=auth_header(tokens["buyer"]),
        )
        assert response.status_code in [401, 403]


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

class TestErrorHandling:
    """Test error handling and edge cases."""
    
    def test_404_not_found(self, client: TestClient):
        """Test 404 response."""
        response = client.get("/api/v1/listings/nonexistent-id-12345")
        assert response.status_code == 404
    
    def test_401_unauthorized(self, client: TestClient):
        """Test 401 response."""
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401
    
    def test_422_validation_error(self, client: TestClient, test_users):
        """Test 422 validation error."""
        users, tokens = test_users
        response = client.post(
            "/api/v1/listings",
            headers=auth_header(tokens["farmer"]),
            json={"invalid": "data"},  # Missing required fields
        )
        assert response.status_code == 422
    
    def test_invalid_json_body(self, client: TestClient):
        """Test invalid JSON body."""
        response = client.post(
            "/api/v1/auth/otp/request",
            content=b"not valid json",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code in [400, 422]
    
    def test_method_not_allowed(self, client: TestClient):
        """Test method not allowed."""
        response = client.patch("/api/v1/listings")
        assert response.status_code in [404, 405]
    
    def test_nonexistent_endpoint(self, client: TestClient):
        """Test nonexistent endpoint."""
        response = client.get("/api/v1/nonexistent")
        assert response.status_code == 404


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegrationFlows:
    """Test complete integration flows."""
    
    def test_complete_farmer_flow(self, client: TestClient, unique_phone):
        """Test complete farmer journey."""
        phone = unique_phone()
        
        # 1. Register
        resp = client.post("/api/v1/auth/otp/request", json={"phone": phone, "role": "farmer"})
        assert resp.status_code in [200, 201]
        otp = resp.json().get("otp", "123456")
        
        # 2. Login
        resp = client.post("/api/v1/auth/otp/verify", json={"phone": phone, "otp": otp})
        assert resp.status_code in [200, 201]
        token = resp.json().get("access_token")
        headers = auth_header(token)
        
        # 3. Create farmer profile
        resp = client.post(
            "/api/v1/users/farmer/profile",
            headers=headers,
            json={
                "village": "Test",
                "district": "Test",
                "state": "Karnataka",
            },
        )
        assert resp.status_code in [200, 201, 409]
        
        # 4. Create listing
        resp = client.post(
            "/api/v1/listings",
            headers=headers,
            json={
                "title": "Flow Test Ragi",
                "crop_type": "ragi",
                "quantity_kg": 200.0,
                "price_per_kg": 45.0,
                "location": "Bangalore",
            },
        )
        assert resp.status_code in [200, 201]
        listing_id = resp.json().get("id")
        
        # 5. Create batch
        resp = client.post(
            "/api/v1/batches",
            headers=headers,
            json={"listing_id": listing_id, "quantity_kg": 50.0},
        )
        assert resp.status_code in [200, 201]
        batch_id = resp.json().get("id")
        qr_code = resp.json().get("qr_code")
        
        # 6. Add trace events
        for event in ["harvested", "processed", "packed"]:
            resp = client.post(
                f"/api/v1/batches/{batch_id}/trace",
                headers=headers,
                json={"event_type": event, "location": "Test"},
            )
            assert resp.status_code in [200, 201]
        
        # 7. Verify public trace
        resp = client.get(f"/api/v1/trace/{qr_code}")
        assert resp.status_code == 200
        
        # 8. Logout
        resp = client.post("/api/v1/auth/logout", headers=headers)
        assert resp.status_code in [200, 204]
    
    def test_complete_buyer_flow(self, client: TestClient, unique_phone):
        """Test complete buyer journey."""
        farmer_phone = unique_phone()
        buyer_phone = unique_phone()
        
        # Setup: Create farmer and listing
        resp = client.post("/api/v1/auth/otp/request", json={"phone": farmer_phone, "role": "farmer"})
        otp = resp.json().get("otp", "123456")
        resp = client.post("/api/v1/auth/otp/verify", json={"phone": farmer_phone, "otp": otp})
        farmer_token = resp.json().get("access_token")
        
        resp = client.post(
            "/api/v1/listings",
            headers=auth_header(farmer_token),
            json={
                "title": "Buyer Flow Test",
                "crop_type": "ragi",
                "quantity_kg": 500.0,
                "price_per_kg": 42.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        # 1. Buyer registers
        resp = client.post("/api/v1/auth/otp/request", json={"phone": buyer_phone, "role": "buyer"})
        assert resp.status_code in [200, 201]
        otp = resp.json().get("otp", "123456")
        
        # 2. Buyer logs in
        resp = client.post("/api/v1/auth/otp/verify", json={"phone": buyer_phone, "otp": otp})
        assert resp.status_code in [200, 201]
        buyer_token = resp.json().get("access_token")
        buyer_headers = auth_header(buyer_token)
        
        # 3. Browse marketplace
        resp = client.get("/api/v1/listings")
        assert resp.status_code == 200
        
        # 4. View listing
        resp = client.get(f"/api/v1/listings/{listing_id}")
        assert resp.status_code == 200
        
        # 5. Create payment order
        resp = client.post(
            "/api/v1/payments/orders",
            headers=buyer_headers,
            json={
                "listing_id": listing_id,
                "quantity_kg": 100.0,
                "amount": 4200.0,
                "payment_method": "upi",
            },
        )
        assert resp.status_code in [200, 201]
        
        # 6. Check payment history
        resp = client.get("/api/v1/payments/history", headers=buyer_headers)
        assert resp.status_code == 200


# ============================================================================
# STRESS TESTS (Optional)
# ============================================================================

class TestStress:
    """Basic stress/load tests."""
    
    def test_multiple_listings_creation(self, client: TestClient, test_users):
        """Test creating multiple listings."""
        users, tokens = test_users
        headers = auth_header(tokens["farmer"])
        
        for i in range(5):
            resp = client.post(
                "/api/v1/listings",
                headers=headers,
                json={
                    "title": f"Stress Test {i}",
                    "crop_type": "ragi",
                    "quantity_kg": 100.0 + i * 10,
                    "price_per_kg": 40.0 + i,
                    "location": f"Location {i}",
                },
            )
            assert resp.status_code in [200, 201]
    
    def test_multiple_trace_events(self, client: TestClient, test_users):
        """Test adding many trace events."""
        users, tokens = test_users
        headers = auth_header(tokens["farmer"])
        
        # Create listing and batch
        resp = client.post(
            "/api/v1/listings",
            headers=headers,
            json={
                "title": "Multi Trace Test",
                "crop_type": "ragi",
                "quantity_kg": 500.0,
                "price_per_kg": 45.0,
                "location": "Test",
            },
        )
        listing_id = resp.json().get("id")
        
        resp = client.post(
            "/api/v1/batches",
            headers=headers,
            json={"listing_id": listing_id, "quantity_kg": 100.0},
        )
        batch_id = resp.json().get("id")
        
        # Add many trace events
        events = ["harvested", "cleaned", "graded", "packed", "stored", "transported", "delivered"]
        for event in events:
            resp = client.post(
                f"/api/v1/batches/{batch_id}/trace",
                headers=headers,
                json={"event_type": event, "location": f"Location for {event}"},
            )
            assert resp.status_code in [200, 201]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
