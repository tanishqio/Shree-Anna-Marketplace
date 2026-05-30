"""
Database Migration Script for Shree Anna Marketplace
Adds new columns and tables for registration forms.

Run this script to update the database schema:
    cd backend-python
    python scripts/migrate_add_processor.py
"""

import sqlite3
import os
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'shreeanna.db')

def get_connection():
    """Get database connection."""
    return sqlite3.connect(DB_PATH)

def migration_add_user_columns():
    """Add new columns to users table for admin registration."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    
    columns_to_add = [
        ("email", "TEXT"),
        ("designation", "TEXT"),  # state, district, logistics, quality
        ("access_level", "TEXT"),  # l1, l2, l3
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"✅ Added column 'users.{col_name}' ({col_type})")
            except sqlite3.OperationalError as e:
                print(f"⚠️  Column 'users.{col_name}' already exists or error: {e}")
        else:
            print(f"ℹ️  Column 'users.{col_name}' already exists")
    
    conn.commit()
    conn.close()

def migration_add_farmer_columns():
    """Add bank details columns to farmers table."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(farmers)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    
    columns_to_add = [
        ("bank_account", "TEXT"),
        ("ifsc", "TEXT"),
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE farmers ADD COLUMN {col_name} {col_type}")
                print(f"✅ Added column 'farmers.{col_name}' ({col_type})")
            except sqlite3.OperationalError as e:
                print(f"⚠️  Column 'farmers.{col_name}' already exists or error: {e}")
        else:
            print(f"ℹ️  Column 'farmers.{col_name}' already exists")
    
    conn.commit()
    conn.close()

def migration_add_buyer_columns():
    """Add new columns to buyers table."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(buyers)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    
    columns_to_add = [
        ("district", "TEXT"),
        ("state", "TEXT"),
        ("buyer_type", "TEXT"),  # retail, bulk, distributor, exporter, institutional
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE buyers ADD COLUMN {col_name} {col_type}")
                print(f"✅ Added column 'buyers.{col_name}' ({col_type})")
            except sqlite3.OperationalError as e:
                print(f"⚠️  Column 'buyers.{col_name}' already exists or error: {e}")
        else:
            print(f"ℹ️  Column 'buyers.{col_name}' already exists")
    
    conn.commit()
    conn.close()

def migration_create_processors_table():
    """Create processors table for processor registration."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='processors'")
    table_exists = cursor.fetchone() is not None
    
    if not table_exists:
        cursor.execute("""
            CREATE TABLE processors (
                id TEXT PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                company_name TEXT,
                state TEXT,
                district TEXT,
                city TEXT,
                unit_type TEXT,
                fssai_license TEXT,
                products TEXT DEFAULT '[]',
                address TEXT,
                is_active INTEGER DEFAULT 1,
                verified INTEGER DEFAULT 0,
                verified_at TIMESTAMP,
                verified_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("✅ Created table 'processors'")
        
        # Create index on user_id
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_processors_user_id ON processors(user_id)")
        print("✅ Created index 'idx_processors_user_id'")
    else:
        print("ℹ️  Table 'processors' already exists")
    
    conn.commit()
    conn.close()

def show_table_schema(table_name):
    """Show the schema for a table."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    print(f"\n📋 Schema for '{table_name}':")
    print("-" * 60)
    print(f"{'Column':<20} {'Type':<15} {'Nullable':<10} {'PK':<5}")
    print("-" * 60)
    
    for col in columns:
        col_id, name, col_type, not_null, default, pk = col
        nullable = "NO" if not_null else "YES"
        is_pk = "YES" if pk else ""
        print(f"{name:<20} {col_type:<15} {nullable:<10} {is_pk:<5}")
    
    conn.close()

def run_all_migrations():
    """Run all migrations."""
    print("=" * 60)
    print("🚀 Shree Anna Database Migration")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Database: {os.path.abspath(DB_PATH)}")
    print("=" * 60)
    
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print("❌ Database file not found! Run the backend first to create it.")
        return
    
    print("\n📝 Running migrations...\n")
    
    # Run migrations
    print("--- Migration: Add User Columns ---")
    migration_add_user_columns()
    
    print("\n--- Migration: Add Farmer Columns ---")
    migration_add_farmer_columns()
    
    print("\n--- Migration: Add Buyer Columns ---")
    migration_add_buyer_columns()
    
    print("\n--- Migration: Create Processors Table ---")
    migration_create_processors_table()
    
    # Show updated schemas
    print("\n" + "=" * 60)
    print("📊 Updated Table Schemas")
    print("=" * 60)
    
    show_table_schema("users")
    show_table_schema("farmers")
    show_table_schema("buyers")
    show_table_schema("processors")
    
    print("\n" + "=" * 60)
    print("✅ All migrations completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_migrations()
