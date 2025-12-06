"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import UserRole, UserStatus, SubscriptionPlan, SubscriptionStatus


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    password: str
    company_id: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    company_id: Optional[int] = None


class UserResponse(UserBase):
    id: int
    status: UserStatus
    company_id: Optional[int]
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


# Company schemas
class CompanyBase(BaseModel):
    name: str
    subscription_plan: SubscriptionPlan = SubscriptionPlan.STARTER


class CompanyCreate(CompanyBase):
    billing_email: Optional[EmailStr] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    subscription_plan: Optional[SubscriptionPlan] = None
    subscription_status: Optional[SubscriptionStatus] = None
    billing_email: Optional[EmailStr] = None


class CompanyResponse(CompanyBase):
    id: int
    subscription_status: SubscriptionStatus
    billing_email: Optional[str]
    mrr: float
    max_users: int
    max_flows: int
    max_tasks_per_month: int
    created_at: datetime

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Audit log schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
