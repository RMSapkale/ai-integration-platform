"""
Admin API endpoints for user and company management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
from datetime import datetime

from database import get_db
from models import User, Company, AuditLog, UserRole, UserStatus
from schemas import (
    UserCreate, UserUpdate, UserResponse,
    CompanyCreate, CompanyUpdate, CompanyResponse,
    AuditLogResponse
)
from auth import get_current_admin_user, get_current_super_admin_user, get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


def log_audit(db: Session, user: User, action: str, resource_type: str, resource_id: str = None, details: dict = None, ip: str = None, status_val: str = "success"):
    """Helper function to log audit events"""
    audit_log = AuditLog(
        user_id=user.id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None,
        ip_address=ip,
        status=status_val
    )
    db.add(audit_log)
    db.commit()


# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user (admin only)"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        role=user_data.role,
        company_id=user_data.company_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log audit
    log_audit(
        db, current_user, "User Created", "User", 
        str(new_user.id), {"email": user_data.email}, 
        request.client.host if request.client else None
    )
    
    return new_user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Log audit
    log_audit(
        db, current_user, "User Updated", "User",
        str(user_id), update_data,
        request.client.host if request.client else None
    )
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)  # Only super admin can delete
):
    """Delete a user (super admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete - mark as deleted instead of removing
    user.status = UserStatus.DELETED
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    log_audit(
        db, current_user, "User Deleted", "User",
        str(user_id), {"email": user.email},
        request.client.host if request.client else None
    )
    
    return None


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Suspend a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = UserStatus.SUSPENDED
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    log_audit(
        db, current_user, "User Suspended", "User",
        str(user_id), {"email": user.email},
        request.client.host if request.client else None
    )
    
    return {"message": "User suspended successfully"}


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Activate a suspended user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = UserStatus.ACTIVE
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    log_audit(
        db, current_user, "User Activated", "User",
        str(user_id), {"email": user.email},
        request.client.host if request.client else None
    )
    
    return {"message": "User activated successfully"}


# ==================== COMPANY MANAGEMENT ====================

@router.get("/companies", response_model=List[CompanyResponse])
async def list_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all companies (admin only)"""
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies


@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)
):
    """Create a new company (super admin only)"""
    # Check if company already exists
    existing_company = db.query(Company).filter(Company.name == company_data.name).first()
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists"
        )
    
    # Get plan limits
    plan_limits = PLAN_LIMITS.get(company_data.subscription_plan, PLAN_LIMITS[SubscriptionPlan.STARTER])
    
    # Create company
    new_company = Company(
        name=company_data.name,
        subscription_plan=company_data.subscription_plan,
        billing_email=company_data.billing_email,
        mrr=plan_limits["mrr"],
        max_users=plan_limits["max_users"],
        max_flows=plan_limits["max_flows"],
        max_tasks_per_month=plan_limits["max_tasks_per_month"]
    )
    
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    
    # Log audit
    log_audit(
        db, current_user, "Company Created", "Company",
        str(new_company.id), {"name": company_data.name},
        request.client.host if request.client else None
    )
    
    return new_company


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields
    update_data = company_data.model_dump(exclude_unset=True)
    
    # If plan is being updated, update limits too
    if "subscription_plan" in update_data:
        plan_limits = PLAN_LIMITS.get(update_data["subscription_plan"], PLAN_LIMITS[SubscriptionPlan.STARTER])
        update_data.update({
            "mrr": plan_limits["mrr"],
            "max_users": plan_limits["max_users"],
            "max_flows": plan_limits["max_flows"],
            "max_tasks_per_month": plan_limits["max_tasks_per_month"]
        })
    
    for field, value in update_data.items():
        setattr(company, field, value)
    
    company.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(company)
    
    # Log audit
    log_audit(
        db, current_user, "Company Updated", "Company",
        str(company_id), update_data,
        request.client.host if request.client else None
    )
    
    return company


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)
):
    """Delete a company (super admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Log audit before deletion
    log_audit(
        db, current_user, "Company Deleted", "Company",
        str(company_id), {"name": company.name},
        request.client.host if request.client else None
    )
    
    # Delete company (will cascade to users if configured)
    db.delete(company)
    db.commit()
    
    return None


# ==================== AUDIT LOGS ====================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List audit logs (admin only)"""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs


# ==================== ANALYTICS ====================

@router.get("/analytics/overview")
async def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get platform analytics overview (admin only)"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    total_companies = db.query(Company).count()
    total_mrr = db.query(func.sum(Company.mrr)).scalar() or 0
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": total_users - active_users,
        "total_companies": total_companies,
        "total_mrr": float(total_mrr),
        "admin_users": db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])).count()
    }
