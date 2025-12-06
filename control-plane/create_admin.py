"""
Create admin user with pre-hashed password
"""
import sqlite3
from datetime import datetime

# Pre-hashed password for "admin" using bcrypt
# Generated with: python3 -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('admin'))"
HASHED_PASSWORD = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVBJiwO4YCu"

conn = sqlite3.connect('iwings_platform.db')
cursor = conn.cursor()

try:
    # Check if admin exists
    cursor.execute("SELECT id, email FROM users WHERE email = ?", ("admin@iwings.com",))
    existing = cursor.fetchone()
    
    if existing:
        print(f"✅ Admin user already exists (ID: {existing[0]})")
    else:
        # Get company ID
        cursor.execute("SELECT id FROM companies WHERE name = ?", ("Iwings Platform",))
        company = cursor.fetchone()
        
        if not company:
            print("❌ Company not found")
            exit(1)
        
        company_id = company[0]
        now = datetime.utcnow().isoformat()
        
        # Insert admin user
        cursor.execute("""
            INSERT INTO users (email, name, hashed_password, role, status, company_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "admin@iwings.com",
            "Super Admin",
            HASHED_PASSWORD,
            "super_admin",
            "active",
            company_id,
            now,
            now
        ))
        
        conn.commit()
        print("✅ Admin user created successfully")
        print("   Email: admin@iwings.com")
        print("   Password: admin")
        print("   Role: super_admin")
        print("   ⚠️  CHANGE THE PASSWORD IN PRODUCTION!")

except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()
