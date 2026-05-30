import sqlite3

conn = sqlite3.connect('shreeanna.db')
cursor = conn.cursor()

print("=== TABLES ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print(tables)

print("\n=== PROCESSORS TABLE ===")
cursor.execute("PRAGMA table_info(processors)")
for col in cursor.fetchall():
    print(col)

print("\n=== USERS NEW COLUMNS ===")
cursor.execute("PRAGMA table_info(users)")
for col in cursor.fetchall():
    if col[1] in ['email', 'designation', 'access_level']:
        print(col)

print("\n=== FARMERS NEW COLUMNS ===")
cursor.execute("PRAGMA table_info(farmers)")
for col in cursor.fetchall():
    if col[1] in ['bank_account', 'ifsc']:
        print(col)

print("\n=== BUYERS NEW COLUMNS ===")
cursor.execute("PRAGMA table_info(buyers)")
for col in cursor.fetchall():
    if col[1] in ['district', 'state', 'buyer_type']:
        print(col)

conn.close()
