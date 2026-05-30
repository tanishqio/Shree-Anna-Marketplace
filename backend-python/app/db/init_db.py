"""
Shree Anna Backend - Database Initialization
Connects to Supabase PostgreSQL. Tables are managed in Supabase dashboard.
"""

from sqlmodel import SQLModel, create_engine, Session, text
from loguru import logger

from app.core.config import settings

# Create database engine for Supabase PostgreSQL
# No special connect_args needed for PostgreSQL

# Disable SQL echo for clean logs
engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True  # Verify connections before using
)


def get_session():
    """Dependency for getting database session."""
    with Session(engine) as session:
        yield session


def init_database() -> None:
    """
    Initialize database connection.
    
    For Supabase: Tables are already created via Supabase dashboard/migrations.
    This function only verifies the connection works.
    """
    try:
        # Create tables if they don't exist
        # This is safe to run even if tables exist (it checks first)
        SQLModel.metadata.create_all(engine)
        
        # Verify connection works
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        logger.info("✓ Database connected & tables verified")
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        logger.warning("⚠ Server will start without database. DB-dependent endpoints will fail.")


if __name__ == "__main__":
    init_database()
    init_database()
