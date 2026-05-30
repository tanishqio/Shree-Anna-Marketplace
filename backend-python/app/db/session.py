"""
Session module for backwards compatibility.
Re-exports get_session from init_db.
"""

from app.db.init_db import get_session, engine

__all__ = ["get_session", "engine"]
