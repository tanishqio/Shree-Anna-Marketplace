"""
Shree Anna Backend - Pytest Configuration
"""

import os
import sys
import uuid
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture(scope="function")
def test_engine():
    """Create test database engine - fresh for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def session(test_engine):
    """Create test session."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture
def client(test_engine):
    """Create test client with test database."""
    from app.main import app
    from app.db.init_db import get_session
    
    def get_test_session():
        with Session(test_engine) as session:
            yield session
    
    app.dependency_overrides[get_session] = get_test_session
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(session):
    """Create a test user with unique phone."""
    from app.db import create_user
    
    # Generate unique phone for each test
    unique_suffix = str(uuid.uuid4().int)[:8]
    phone = f"+91{unique_suffix}"
    
    user = create_user(
        session=session,
        phone=phone,
        name="Test User",
        roles="farmer",
        language="hi",
        district="tumkur"
    )
    return user


@pytest.fixture
def auth_token(test_user):
    """Generate auth token for test user."""
    from app.core.security import create_access_token
    
    token = create_access_token(
        user_id=test_user.id,
        phone=test_user.phone,
        roles=test_user.get_roles()
    )
    return token


@pytest.fixture
def auth_headers(auth_token):
    """Auth headers for authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}
