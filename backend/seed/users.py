"""Seed initial staff accounts with secure passwords from environment.

Staff account creation requires explicit environment variables.
No fallback passwords are provided for security.
"""

from __future__ import annotations

import logging
import os

from sqlalchemy.orm import Session

from backend.models.user import UserRecord
from backend.services.auth_service import hash_password

logger = logging.getLogger(__name__)


def seed_staff_accounts(session: Session) -> None:
    """Create KVIC field inspector, lab inspector, and KVIC admin accounts if they don't exist.
    
    Passwords MUST be provided via environment variables:
    - OFFICER_PASSWORD
    - LAB_PASSWORD
    - ADMIN_PASSWORD
    
    If a password environment variable is missing, that staff account will not be created.
    Existing staff accounts are never modified during seed.
    """
    
    staff_accounts = [
        {
            "username": "kvic_field_officer",
            "display_name": "KVIC Field Inspector",
            "role": "officer",
            "cluster": "West Bengal",
            "region": "West Bengal",
            "password_env": "OFFICER_PASSWORD",
        },
        {
            "username": "lab_inspector",
            "display_name": "Lab Inspector",
            "role": "lab",
            "cluster": "Central Lab",
            "region": "West Bengal",
            "password_env": "LAB_PASSWORD",
        },
        {
            "username": "kvic_admin",
            "display_name": "KVIC Admin",
            "role": "admin",
            "cluster": "Administration",
            "region": "All India",
            "password_env": "ADMIN_PASSWORD",
        },
    ]
    
    for account in staff_accounts:
        # Check if user already exists - never modify existing accounts
        existing = session.get(UserRecord, account["username"])
        if existing is not None:
            logger.info(f"Staff account already exists, skipping: {account['username']}")
            continue
        
        # Get password from environment - required, no fallback
        password = os.environ.get(account["password_env"])
        if not password:
            logger.warning(
                f"Skipping {account['role']} account creation: "
                f"environment variable {account['password_env']} not set"
            )
            continue
        
        # Create user with hashed password
        user = UserRecord(
            username=account["username"],
            password_hash=hash_password(password),
            display_name=account["display_name"],
            role=account["role"],
            beekeeper_id=None,
            cluster=account["cluster"],
            region=account["region"],
            language="en",
            email=f"{account['username']}@honeychain.local",
            phone=None,
            active=True,
        )
        session.add(user)
        logger.info(f"✅ Created {account['role']} account: {account['username']}")
    
    session.flush()
