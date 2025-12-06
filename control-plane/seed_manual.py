"""
Manual database seeding script - workaround for bcrypt issue
Run this after database is created
"""

import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('iwings_platform.db')
cursor = conn.cursor()

# Insert company
cursor.execute("""
INSERT INTO companies (name, subscription_plan, subscription_status, billing_email, mrr, max_users, max_flows, max_tasks_per_month, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ('Iwings Platform', 'Enterprise Plus', 'trial', 'billing@iwings.com', 0.0, -1, -1, -1, datetime.utcnow(), datetime.utcnow()))

company_id = cursor.lastrowid

# Insert admin user with pre-hashed password
# Password: "admin" hashed with bcrypt
hashed_password = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqgdstxe96"

cursor.execute("""
INSERT INTO users (email, name, hashed_password, role, status, company_id, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ('admin@iwings.com', 'Super Admin', hashed_password, 'super_admin', 'active', company_id, datetime.utcnow(), datetime.utcnow()))

conn.commit()
conn.close()

print("✅ Database seeded successfully!")
print("   Email: admin@iwings.com")
print("   Password: admin")
