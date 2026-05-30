# 🔄 Database Migration Guide

## Overview
This guide explains how to apply database schema changes for the Shree Anna Marketplace.

---

## 📋 Recent Changes (December 2024)

The following database changes have been made to support registration form fields:

### New Table: `processors`
- Stores millet processor profile data
- Fields: company_name, state, district, city, unit_type, fssai_license, products, etc.

### Updated Tables:
| Table | New Columns |
|-------|-------------|
| `users` | email, designation, access_level |
| `farmers` | bank_account, ifsc |
| `buyers` | district, state, buyer_type |

---

## 🚀 How to Apply Migrations

### Option 1: Run Migration Script (Recommended)

**Step 1:** Open terminal/command prompt

**Step 2:** Navigate to backend folder:
```bash
cd backend-python
```

**Step 3:** Run the migration script:
```bash
python scripts/migrate_add_processor.py
```

**Expected Output:**
```
============================================================
🚀 Shree Anna Database Migration
📅 2024-12-04 23:00:00
📁 Database: /path/to/shreeanna.db
============================================================

📝 Running migrations...

--- Migration: Add User Columns ---
✅ Added column 'users.email' (TEXT)
✅ Added column 'users.designation' (TEXT)
✅ Added column 'users.access_level' (TEXT)

--- Migration: Add Farmer Columns ---
✅ Added column 'farmers.bank_account' (TEXT)
✅ Added column 'farmers.ifsc' (TEXT)

--- Migration: Add Buyer Columns ---
✅ Added column 'buyers.district' (TEXT)
✅ Added column 'buyers.state' (TEXT)
✅ Added column 'buyers.buyer_type' (TEXT)

--- Migration: Create Processors Table ---
✅ Created table 'processors'
✅ Created index 'idx_processors_user_id'

============================================================
✅ All migrations completed successfully!
============================================================
```

---

### Option 2: Delete and Recreate Database

If you want a fresh database:

**Step 1:** Stop the backend server if running

**Step 2:** Delete the existing database:
```bash
# In backend-python folder
rm shreeanna.db
# Or on Windows:
del shreeanna.db
```

**Step 3:** Start the backend - it will auto-create the database with new schema:
```bash
python -m uvicorn app.main:app --reload
```

---

### Option 3: Manual SQL Commands

If you prefer to run SQL manually:

```sql
-- 1. Add columns to users table
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN designation TEXT;
ALTER TABLE users ADD COLUMN access_level TEXT;

-- 2. Add columns to farmers table
ALTER TABLE farmers ADD COLUMN bank_account TEXT;
ALTER TABLE farmers ADD COLUMN ifsc TEXT;

-- 3. Add columns to buyers table
ALTER TABLE buyers ADD COLUMN district TEXT;
ALTER TABLE buyers ADD COLUMN state TEXT;
ALTER TABLE buyers ADD COLUMN buyer_type TEXT;

-- 4. Create processors table
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
);

CREATE INDEX idx_processors_user_id ON processors(user_id);
```

---

## ✅ Verify Migration

Run this command to verify the changes were applied:

```bash
python scripts/check_db.py
```

You should see output showing:
- `processors` table with all columns
- New columns in `users`, `farmers`, and `buyers` tables

---

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
   ```bash
   cp shreeanna.db shreeanna.db.backup
   ```

2. **Idempotent**: The migration script is safe to run multiple times - it checks if changes already exist

3. **No Data Loss**: The migrations only ADD columns/tables, they do not delete any existing data

4. **SQLModel Sync**: The `app/db/models.py` file has been updated to match the new schema

---

## 📁 Related Files

| File | Description |
|------|-------------|
| `backend-python/app/db/models.py` | SQLModel ORM definitions |
| `backend-python/scripts/migrate_add_processor.py` | Migration script |
| `backend-python/scripts/check_db.py` | Verification script |
| `backend-python/shreeanna.db` | SQLite database file |

---

## 🆘 Troubleshooting

### "Database file not found"
- Make sure you're in the `backend-python` directory
- Run the backend server once to create the initial database

### "Column already exists"
- This is normal - the migration script skips columns that already exist
- You'll see `ℹ️ Column 'xxx' already exists` messages

### "Table processors already exists"
- The migration has already been applied
- No action needed

---

*Last Updated: December 2024*
