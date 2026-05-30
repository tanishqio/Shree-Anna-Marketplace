import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.init_db import engine

def migrate():
    print("Migrating database to add farmer profile fields...")
    with engine.connect() as conn:
        # Check if columns exist using information_schema (Standard SQL/PostgreSQL)
        print("Checking existing columns...")
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'farmers'"))
        columns = [row[0] for row in result]
        
        print(f"Existing columns: {columns}")
        
        if "organic_certified" not in columns:
            print("Adding organic_certified column...")
            conn.execute(text("ALTER TABLE farmers ADD COLUMN organic_certified BOOLEAN DEFAULT FALSE"))
        else:
            print("organic_certified column already exists.")
            
        if "certification_id" not in columns:
            print("Adding certification_id column...")
            conn.execute(text("ALTER TABLE farmers ADD COLUMN certification_id TEXT"))
        else:
            print("certification_id column already exists.")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
