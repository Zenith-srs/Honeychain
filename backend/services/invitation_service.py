"""
Admin invitation service with secure token handling.

Security rules:
- Tokens are cryptographically random
- Only SHA-256 hashes are stored in database
- Raw tokens are never logged
- Invitations are single-use and expire
"""

from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.invitation import AdminInvitationRecord
from backend.models.user import UserRecord
from backend.schemas.invitation import (
    CreateInvitationRequest,
    InvitationCreatedResponse,
    InvitationOut,
    ValidateInvitationResponse,
)


def _hash_token(token: str) -> str:
    """Hash a token using SHA-256."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _generate_token() -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(48)


def _is_invitation_valid(invitation: AdminInvitationRecord) -> bool:
    """Check if invitation is valid (not used, not revoked, not expired)."""
    if invitation.used_at is not None:
        return False
    if invitation.revoked_at is not None:
        return False
    expires = invitation.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        return False
    return True


def create_invitation(
    session: Session,
    admin_username: str,
    payload: CreateInvitationRequest,
    base_url: str,
) -> InvitationCreatedResponse:
    """
    Create a new admin invitation.
    
    Args:
        session: Database session
        admin_username: Username of admin creating the invitation
        payload: Invitation creation request
        base_url: Base URL for constructing invitation link
    
    Returns:
        Response with raw token (shown only once)
    """
    raw_token = _generate_token()
    token_hash = _hash_token(raw_token)
    
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=payload.expires_in_hours)
    
    invitation = AdminInvitationRecord(
        token_hash=token_hash,
        role="admin",  # Always admin for this feature
        intended_email=payload.intended_email,
        created_by=admin_username,
        created_at=now,
        expires_at=expires,
        used_at=None,
        revoked_at=None,
    )
    
    session.add(invitation)
    session.flush()
    
    # Construct invitation URL
    # Remove trailing slash from base_url to avoid double slashes
    base_url = base_url.rstrip("/")
    invitation_url = f"{base_url}/admin/register?token={raw_token}"
    
    return InvitationCreatedResponse(
        invitation_url=invitation_url,
        token=raw_token,
        expires_at=expires,
    )


def validate_invitation(session: Session, token: str) -> ValidateInvitationResponse:
    """
    Validate an invitation token (public endpoint).
    
    Returns safe metadata only, no sensitive data.
    """
    if not token or len(token) < 32:
        return ValidateInvitationResponse(
            valid=False,
            detail="Invalid invitation token format.",
        )
    
    token_hash = _hash_token(token)
    invitation = session.get(AdminInvitationRecord, token_hash)
    
    if invitation is None:
        return ValidateInvitationResponse(
            valid=False,
            detail="Invitation not found or invalid.",
        )
    
    # Check if already used
    if invitation.used_at is not None:
        return ValidateInvitationResponse(
            valid=False,
            used=True,
            detail="This invitation has already been used.",
        )
    
    # Check if revoked
    if invitation.revoked_at is not None:
        return ValidateInvitationResponse(
            valid=False,
            revoked=True,
            detail="This invitation has been revoked.",
        )
    
    # Check if expired
    expires = invitation.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    
    if expires < datetime.now(timezone.utc):
        return ValidateInvitationResponse(
            valid=False,
            expired=True,
            detail="This invitation has expired.",
        )
    
    # Valid invitation
    return ValidateInvitationResponse(
        valid=True,
        role=invitation.role,
        intended_email=invitation.intended_email,
        detail="Invitation is valid.",
    )


def consume_invitation(session: Session, token: str) -> str:
    """
    Mark invitation as used and return the role.
    
    Must be called atomically in the same transaction as user creation.
    
    Raises:
        HTTPException: If invitation is invalid, used, revoked, or expired
    
    Returns:
        The role for the new user (always "admin")
    """
    if not token or len(token) < 32:
        raise HTTPException(status_code=400, detail="Invalid invitation token.")
    
    token_hash = _hash_token(token)
    invitation = session.get(AdminInvitationRecord, token_hash)
    
    if invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    
    if invitation.used_at is not None:
        raise HTTPException(status_code=409, detail="This invitation has already been used.")
    
    if invitation.revoked_at is not None:
        raise HTTPException(status_code=403, detail="This invitation has been revoked.")
    
    expires = invitation.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This invitation has expired.")
    
    # Mark as used
    invitation.used_at = datetime.now(timezone.utc)
    session.flush()
    
    return invitation.role


def revoke_invitation(session: Session, token_hash: str) -> None:
    """
    Revoke an invitation by its token hash.
    
    Args:
        session: Database session
        token_hash: SHA-256 hash of the invitation token
    
    Raises:
        HTTPException: If invitation not found
    """
    invitation = session.get(AdminInvitationRecord, token_hash)
    
    if invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    
    if invitation.revoked_at is not None:
        # Already revoked, this is idempotent
        return
    
    invitation.revoked_at = datetime.now(timezone.utc)
    session.flush()


def list_invitations(session: Session) -> list[InvitationOut]:
    """
    List all admin invitations (admin-only).
    
    Returns invitations ordered by creation date (newest first).
    """
    invitations = session.scalars(
        select(AdminInvitationRecord).order_by(AdminInvitationRecord.created_at.desc())
    ).all()
    
    return [
        InvitationOut(
            token_hash=inv.token_hash,
            role=inv.role,
            intended_email=inv.intended_email,
            created_by=inv.created_by,
            created_at=inv.created_at,
            expires_at=inv.expires_at,
            used_at=inv.used_at,
            revoked_at=inv.revoked_at,
            is_valid=_is_invitation_valid(inv),
        )
        for inv in invitations
    ]


def register_admin_with_invitation(
    session: Session,
    token: str,
    username: str,
    password: str,
    display_name: str,
    email: str,
    phone: str,
) -> UserRecord:
    """
    Register a new admin user using an invitation token.
    
    Security notes:
    - Role is ALWAYS set to "admin" server-side
    - Invitation is consumed atomically
    - Validates username/email/phone uniqueness
    - Uses strong password hashing
    
    Args:
        session: Database session
        token: Raw invitation token
        username: Desired username
        password: Password (will be hashed)
        display_name: Display name
        email: Email address
        phone: Phone number
    
    Returns:
        Created UserRecord
    
    Raises:
        HTTPException: If invitation invalid or user creation fails
    """
    from backend.services.auth_service import hash_password
    from sqlalchemy import func
    
    # Validate and consume invitation (this validates token, checks expiry, etc.)
    role = consume_invitation(session, token)
    
    # Validate username uniqueness
    if session.get(UserRecord, username) is not None:
        raise HTTPException(status_code=409, detail="That username is already taken.")
    
    # Validate email uniqueness
    existing_email = session.scalars(
        select(UserRecord).where(func.lower(UserRecord.email) == func.lower(email))
    ).first()
    if existing_email is not None:
        raise HTTPException(
            status_code=409,
            detail="An account with that email address already exists."
        )
    
    # Validate phone uniqueness
    existing_phone = session.scalars(
        select(UserRecord).where(UserRecord.phone == phone)
    ).first()
    if existing_phone is not None:
        raise HTTPException(
            status_code=409,
            detail="An account with that phone number already exists."
        )
    
    # Create admin user
    # Role is ALWAYS "admin" - never trust client payload
    user = UserRecord(
        username=username,
        password_hash=hash_password(password),
        display_name=display_name,
        role="admin",  # Server-side only
        beekeeper_id=None,
        cluster=None,
        region=None,
        language="en",
        email=email,
        phone=phone,
        active=True,
    )
    
    session.add(user)
    session.flush()
    
    return user
