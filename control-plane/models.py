"""
Database models for the platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class SubscriptionStatus(str, enum.Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"


class SubscriptionPlan(str, enum.Enum):
    STARTER = "Starter"
    PROFESSIONAL = "Professional"
    ENTERPRISE = "Enterprise"
    ENTERPRISE_PLUS = "Enterprise Plus"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.STARTER, nullable=False)
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.TRIAL, nullable=False)
    billing_email = Column(String, nullable=True)
    
    # Subscription details
    mrr = Column(Float, default=0.0, nullable=False)  # Monthly Recurring Revenue
    max_users = Column(Integer, default=2, nullable=False)
    max_flows = Column(Integer, default=5, nullable=False)
    max_tasks_per_month = Column(Integer, default=100000, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="company")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)  # JSON string
    ip_address = Column(String, nullable=True)
    status = Column(String, default="success", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


class FlowExecution(Base):
    __tablename__ = "flow_executions"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    status = Column(String, nullable=False)  # success, failed, running
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metrics
    steps_executed = Column(Integer, default=0)
    tasks_consumed = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# Plan limits mapping
PLAN_LIMITS = {
    SubscriptionPlan.STARTER: {
        "mrr": 299,
        "max_users": 2,
        "max_flows": 5,
        "max_tasks_per_month": 100000,
    },
    SubscriptionPlan.PROFESSIONAL: {
        "mrr": 999,
        "max_users": 10,
        "max_flows": 25,
        "max_tasks_per_month": 1000000,
    },
    SubscriptionPlan.ENTERPRISE: {
        "mrr": 2999,
        "max_users": -1,  # Unlimited
        "max_flows": -1,  # Unlimited
        "max_tasks_per_month": 10000000,
    },
    SubscriptionPlan.ENTERPRISE_PLUS: {
        "mrr": 5999,
        "max_users": -1,
        "max_flows": -1,
        "max_tasks_per_month": -1,  # Unlimited
    },
}
