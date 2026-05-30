"""
Shree Anna Backend - Authentication Tests
"""

import pytest
from fastapi import status


class TestAuth:
    """Test authentication endpoints."""
    
    def test_request_otp_valid_phone(self, client):
        """Test OTP request with valid phone."""
        response = client.post(
            "/api/v1/auth/request-otp",
            json={"phone": "+919876543210", "language": "hi"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "expires_in" in data
    
    def test_request_otp_invalid_phone(self, client):
        """Test OTP request with invalid phone."""
        response = client.post(
            "/api/v1/auth/request-otp",
            json={"phone": "12345", "language": "hi"}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_verify_otp_creates_user(self, client, session):
        """Test that OTP verification creates new user."""
        from app.db import create_otp_record, get_user_by_phone
        
        phone = "+919999888877"
        otp, record = create_otp_record(session, phone)
        
        response = client.post(
            "/api/v1/auth/verify-otp",
            json={"phone": phone, "otp": otp}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["is_new_user"] is True
        
        # Verify user created
        user = get_user_by_phone(session, phone)
        assert user is not None
    
    def test_verify_otp_invalid(self, client):
        """Test invalid OTP verification."""
        response = client.post(
            "/api/v1/auth/verify-otp",
            json={"phone": "+919876543210", "otp": "000000"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_token_refresh(self, client, auth_token):
        """Test token refresh."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"token": auth_token}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data


class TestUser:
    """Test user endpoints."""
    
    def test_get_profile(self, client, auth_headers, test_user):
        """Test get user profile."""
        response = client.get(
            "/api/v1/users/me",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["phone"] == test_user.phone
    
    def test_update_profile(self, client, auth_headers):
        """Test update user profile."""
        response = client.patch(
            "/api/v1/users/me",
            headers=auth_headers,
            json={"name": "Updated Name", "language": "en"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["language"] == "en"
    
    def test_unauthenticated_access(self, client):
        """Test that unauthenticated access is blocked."""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
