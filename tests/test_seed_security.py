"""Tests for staff seeding security: no fallback passwords, env-only."""

import os
from unittest.mock import patch

import pytest

from backend.database import SessionLocal
from backend.models.user import UserRecord
from backend.seed.users import seed_staff_accounts
from backend.services.auth_service import verify_password


def test_seed_staff_requires_env_passwords(client) -> None:
    """Staff accounts are not created when password env vars are missing."""
    # Get a session from the test database
    session = SessionLocal()
    try:
        # Ensure no staff password env vars are set
        with patch.dict(os.environ, {}, clear=False):
            # Remove password env vars if they exist
            for key in ["OFFICER_PASSWORD", "LAB_PASSWORD", "ADMIN_PASSWORD"]:
                os.environ.pop(key, None)
            
            seed_staff_accounts(session)
            session.flush()
            
            # Verify no staff accounts were created
            officer = session.get(UserRecord, "kvic_field_officer")
            lab = session.get(UserRecord, "lab_inspector")
            admin = session.get(UserRecord, "kvic_admin")
            
            assert officer is None, "Officer account should not be created without OFFICER_PASSWORD"
            assert lab is None, "Lab account should not be created without LAB_PASSWORD"
            assert admin is None, "Admin account should not be created without ADMIN_PASSWORD"
    finally:
        session.close()


def test_seed_staff_with_env_passwords(client) -> None:
    """Staff accounts are created when password env vars are provided."""
    session = SessionLocal()
    try:
        test_passwords = {
            "OFFICER_PASSWORD": "SecureOfficerPass123!",
            "LAB_PASSWORD": "SecureLabPass123!",
            "ADMIN_PASSWORD": "SecureAdminPass123!",
        }
        
        with patch.dict(os.environ, test_passwords, clear=False):
            seed_staff_accounts(session)
            session.flush()
            
            # Verify all staff accounts were created
            officer = session.get(UserRecord, "kvic_field_officer")
            lab = session.get(UserRecord, "lab_inspector")
            admin = session.get(UserRecord, "kvic_admin")
            
            assert officer is not None, "Officer account should be created"
            assert lab is not None, "Lab account should be created"
            assert admin is not None, "Admin account should be created"
            
            # Verify correct roles
            assert officer.role == "officer"
            assert lab.role == "lab"
            assert admin.role == "admin"
            
            # Verify passwords work
            assert verify_password("SecureOfficerPass123!", officer.password_hash)
            assert verify_password("SecureLabPass123!", lab.password_hash)
            assert verify_password("SecureAdminPass123!", admin.password_hash)
    finally:
        session.close()


def test_seed_staff_partial_env_passwords(client) -> None:
    """Only accounts with env passwords are created; others are skipped."""
    session = SessionLocal()
    try:
        # Only provide officer password
        with patch.dict(os.environ, {"OFFICER_PASSWORD": "OnlyOfficerPass123!"}, clear=False):
            # Remove other passwords if they exist
            os.environ.pop("LAB_PASSWORD", None)
            os.environ.pop("ADMIN_PASSWORD", None)
            
            seed_staff_accounts(session)
            session.flush()
            
            # Verify only officer was created
            officer = session.get(UserRecord, "kvic_field_officer")
            lab = session.get(UserRecord, "lab_inspector")
            admin = session.get(UserRecord, "kvic_admin")
            
            assert officer is not None, "Officer account should be created"
            assert lab is None, "Lab account should not be created without LAB_PASSWORD"
            assert admin is None, "Admin account should not be created without ADMIN_PASSWORD"
            
            assert verify_password("OnlyOfficerPass123!", officer.password_hash)
    finally:
        session.close()


def test_seed_staff_does_not_overwrite_existing(client) -> None:
    """Existing staff accounts are not modified during seeding."""
    session = SessionLocal()
    try:
        original_password = "OriginalPassword123!"
        
        # Create an officer account manually
        from backend.services.auth_service import hash_password
        officer = UserRecord(
            username="kvic_field_officer",
            password_hash=hash_password(original_password),
            display_name="Original Officer",
            role="officer",
            cluster="Original Cluster",
            region="Original Region",
            language="en",
            email="officer@original.com",
            active=True,
        )
        session.add(officer)
        session.flush()
        
        original_hash = officer.password_hash
        
        # Try to seed with a different password
        with patch.dict(os.environ, {"OFFICER_PASSWORD": "NewPassword123!"}, clear=False):
            seed_staff_accounts(session)
            session.flush()
            
            # Verify the account was not modified
            officer_after = session.get(UserRecord, "kvic_field_officer")
            assert officer_after is not None
            assert officer_after.password_hash == original_hash, "Password should not be changed"
            assert officer_after.display_name == "Original Officer", "Display name should not change"
            assert officer_after.cluster == "Original Cluster", "Cluster should not change"
            
            # Verify original password still works
            assert verify_password(original_password, officer_after.password_hash)
            # Verify new password does NOT work
            assert not verify_password("NewPassword123!", officer_after.password_hash)
    finally:
        session.close()


def test_seed_staff_no_hardcoded_fallbacks():
    """Verify seed code does not contain hardcoded fallback passwords."""
    from backend.seed import users
    import inspect
    
    source = inspect.getsource(users.seed_staff_accounts)
    
    # Check that no hardcoded passwords appear in the source
    forbidden_patterns = [
        "Officer@",
        "LabInspect@",
        "Admin@",
        "default_password",
        "ChangeMeNow",
        "SecurePass",
    ]
    
    for pattern in forbidden_patterns:
        assert pattern not in source, f"Hardcoded password pattern '{pattern}' found in seed code"

