"""
Database initialization script
Creates tables and seeds initial admin user
"""

from database import init_db, SessionLocal
from models import User, Company, SubscriptionPlan
from auth import get_password_hash
import sys

def seed_initial_data():
    """Seed initial admin user and company"""
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@iwings.com").first()
        if existing_admin:
            print("⚠️  Admin user already exists")
            return
        
        # Create default company
        company = Company(
            name="Iwings Platform",
            subscription_plan=SubscriptionPlan.ENTERPRISE_PLUS,
            billing_email="billing@iwings.com",
            mrr=0,
            max_users=-1,
            max_flows=-1,
            max_tasks_per_month=-1
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Create super admin user
        admin_user = User(
            email="admin@iwings.com",
            name="Super Admin",
            hashed_password=get_password_hash("admin"),
            role="super_admin",
            status="active",
            company_id=company.id
        )
        db.add(admin_user)
        db.commit()
        
        print("✅ Initial data seeded successfully")
        print(f"   Admin email: admin@iwings.com")
        print(f"   Admin password: admin")
        print(f"   ⚠️  CHANGE THE PASSWORD IN PRODUCTION!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Initializing database...")
    init_db()
    
    if "--seed" in sys.argv:
        print("🌱 Seeding initial data...")
        seed_initial_data()
    
    print("✅ Database setup complete!")
