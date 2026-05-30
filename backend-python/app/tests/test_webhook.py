"""
Shree Anna Backend - Voice Webhook Tests
"""

import pytest
from fastapi import status
import json


class TestVoiceWebhook:
    """Test Reverie voice webhook endpoints."""
    
    def test_webhook_call_start(self, client):
        """Test webhook with new call."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "start",
                "call_id": "test_call_001",
                "phone": "+919876543210",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] == "gather"
        assert "language" in data
    
    def test_webhook_speech_input(self, client):
        """Test webhook with speech input."""
        # First start a call
        client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "start",
                "call_id": "test_call_002",
                "phone": "+919876543210",
                "language": "hi"
            }
        )
        
        # Then send speech input
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "speech_input",
                "call_id": "test_call_002",
                "text": "रागी का भाव बताओ",
                "language": "hi",
                "confidence": 0.85
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] in ["speak", "gather"]
    
    def test_webhook_dtmf_input(self, client):
        """Test webhook with DTMF input."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "dtmf_input",
                "call_id": "test_call_003",
                "dtmf": "1",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] in ["speak", "gather"]
    
    def test_webhook_timeout(self, client):
        """Test webhook with timeout."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "timeout",
                "call_id": "test_call_004",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Should either gather again or hangup after multiple timeouts
        assert data["action"] in ["gather", "hangup"]
    
    def test_webhook_call_end(self, client):
        """Test webhook with call end."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "end",
                "call_id": "test_call_005",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] == "hangup"


class TestVoiceSimulation:
    """Test voice simulation endpoints."""
    
    def test_simulate_call(self, client):
        """Test call simulation."""
        response = client.post(
            "/api/v1/voice/test/simulate-call",
            params={"phone": "+919876543210", "language": "hi"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "call_id" in data
        assert data["call_id"].startswith("test_")
        assert "response" in data
    
    def test_simulate_input(self, client):
        """Test input simulation."""
        # First simulate a call
        call_response = client.post(
            "/api/v1/voice/test/simulate-call",
            params={"phone": "+919876543210", "language": "hi"}
        )
        call_id = call_response.json()["call_id"]
        
        # Then simulate input
        response = client.post(
            "/api/v1/voice/test/simulate-input",
            params={
                "call_id": call_id,
                "text": "मौसम की जानकारी",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["call_id"] == call_id
        assert "response" in data


class TestIntentClassification:
    """Test voice intent classification."""
    
    def test_price_intent_hindi(self, client):
        """Test price inquiry intent in Hindi."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "speech_input",
                "call_id": "intent_test_1",
                "text": "रागी का दाम क्या है",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Should respond with price info
        assert "रागी" in data.get("text", "") or data["action"] == "gather"
    
    def test_weather_intent(self, client):
        """Test weather inquiry intent."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "speech_input",
                "call_id": "intent_test_2",
                "text": "आज का मौसम कैसा है",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] in ["speak", "gather"]
    
    def test_help_intent(self, client):
        """Test help intent."""
        response = client.post(
            "/api/v1/voice/webhook",
            json={
                "action": "speech_input",
                "call_id": "intent_test_3",
                "text": "मदद चाहिए",
                "language": "hi"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Should provide help menu
        assert data["action"] == "gather"
