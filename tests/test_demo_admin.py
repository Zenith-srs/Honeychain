"""
Tests for demo admin login feature.

Security requirements:
1. Demo mode disabled by default
2. Production environment blocks demo mode
3. Demo password required when demo mode enabled
4. Demo login unavailable when demo mode disabled
5. Demo login works only with valid configuration
6. No demo passwords in responses or logs
"""

import os
import pytest
from fastapi.testclient import TestClient


def test_demo_mode_disabled_by_default(client: TestClient):
    """Demo mode should be disabled by default."""
    # Clear demo mode env vars
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    if "HONEYCHAIN_DEMO_MODE" in os.environ:
        del os.environ["HONEYCHAIN_DEMO_MODE"]
    
    try:
        response = client.get("/api/auth/status")
        assert response.status_code == 200
        data = response.json()
        assert data["demo_mode"] is False
    finally:
        # Restore
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode


def test_demo_login_unavailable_when_disabled(client: TestClient):
    """Demo login endpoint should return 404 when demo mode is disabled."""
    # Ensure demo mode is disabled
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    os.environ["HONEYCHAIN_DEMO_MODE"] = "false"
    
    try:
        response = client.post("/api/auth/demo-admin-login")
        assert response.status_code == 404
        assert "not available" in response.json()["detail"].lower()
    finally:
        # Restore
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode
        else:
            if "HONEYCHAIN_DEMO_MODE" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_MODE"]


def test_demo_login_works_when_enabled(client: TestClient):
    """Demo login should work when demo mode is enabled with valid config."""
    # Enable demo mode
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    old_demo_password = os.environ.get("HONEYCHAIN_DEMO_ADMIN_PASSWORD")
    old_env = os.environ.get("HONEYCHAIN_ENV")
    
    os.environ["HONEYCHAIN_DEMO_MODE"] = "true"
    os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = "DemoPassword984!@#"
    os.environ["HONEYCHAIN_ENV"] = "development"
    
    try:
        # Check status endpoint reports demo mode
        status = client.get("/api/auth/status").json()
        assert status["demo_mode"] is True
        
        # Demo login should succeed
        response = client.post("/api/auth/demo-admin-login")
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["role"] == "admin"
        assert data["display_name"] == "Demo Administrator"
        
        # Verify we can use the token
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {data['access_token']}"}
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["role"] == "admin"
    finally:
        # Restore
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode
        else:
            if "HONEYCHAIN_DEMO_MODE" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_MODE"]
        
        if old_demo_password:
            os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = old_demo_password
        else:
            if "HONEYCHAIN_DEMO_ADMIN_PASSWORD" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"]
        
        if old_env:
            os.environ["HONEYCHAIN_ENV"] = old_env
        else:
            if "HONEYCHAIN_ENV" in os.environ:
                del os.environ["HONEYCHAIN_ENV"]


def test_demo_admin_has_full_permissions(client: TestClient):
    """Demo admin should have full admin permissions."""
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    old_demo_password = os.environ.get("HONEYCHAIN_DEMO_ADMIN_PASSWORD")
    old_env = os.environ.get("HONEYCHAIN_ENV")
    
    os.environ["HONEYCHAIN_DEMO_MODE"] = "true"
    os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = "DemoPassword984!@#"
    os.environ["HONEYCHAIN_ENV"] = "development"
    
    try:
        # Login as demo admin
        login_response = client.post("/api/auth/demo-admin-login")
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Try to access admin-only endpoint
        users_response = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert users_response.status_code == 200
        
        # Try to create invitations
        invitations_response = client.get(
            "/api/admin/invitations",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert invitations_response.status_code == 200
    finally:
        # Restore
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode
        else:
            if "HONEYCHAIN_DEMO_MODE" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_MODE"]
        
        if old_demo_password:
            os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = old_demo_password
        else:
            if "HONEYCHAIN_DEMO_ADMIN_PASSWORD" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"]
        
        if old_env:
            os.environ["HONEYCHAIN_ENV"] = old_env
        else:
            if "HONEYCHAIN_ENV" in os.environ:
                del os.environ["HONEYCHAIN_ENV"]


def test_no_demo_credentials_in_response(client: TestClient):
    """Demo credentials should never appear in API responses."""
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    old_demo_password = os.environ.get("HONEYCHAIN_DEMO_ADMIN_PASSWORD")
    
    os.environ["HONEYCHAIN_DEMO_MODE"] = "true"
    os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = "TestDemoPassword984!@#"
    
    try:
        response = client.post("/api/auth/demo-admin-login")
        assert response.status_code == 200
        
        # Password should NEVER appear in response
        response_text = response.text.lower()
        assert "testdemopassword" not in response_text
        assert "demopassword984" not in response_text
        
        # Check status endpoint doesn't leak credentials
        status_response = client.get("/api/auth/status")
        status_text = status_response.text.lower()
        assert "password" not in status_text
        assert "testdemopassword" not in status_text
    finally:
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode
        else:
            if "HONEYCHAIN_DEMO_MODE" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_MODE"]
        
        if old_demo_password:
            os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = old_demo_password
        else:
            if "HONEYCHAIN_DEMO_ADMIN_PASSWORD" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"]


def test_demo_user_not_overwrite_existing(client: TestClient, admin_token: str, session):
    """Demo mode should not overwrite existing non-demo users."""
    from backend.models.user import UserRecord
    from sqlalchemy import select
    
    old_demo_mode = os.environ.get("HONEYCHAIN_DEMO_MODE")
    old_demo_username = os.environ.get("HONEYCHAIN_DEMO_ADMIN_USERNAME")
    old_demo_password = os.environ.get("HONEYCHAIN_DEMO_ADMIN_PASSWORD")
    old_env = os.environ.get("HONEYCHAIN_ENV")
    
    # Create a regular admin user with a name that could conflict
    os.environ["HONEYCHAIN_DEMO_MODE"] = "false"
    
    try:
        # Create a user with username "test_existing_admin"
        create_response = client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "test_existing_admin",
                "password": "ExistingAdmin984!",
                "display_name": "Existing Admin",
                "role": "admin",
                "email": "existing@test.com",
                "phone": "+9848766590",
            }
        )
        assert create_response.status_code == 201
        
        # Capture original user data from database
        stmt = select(UserRecord).where(UserRecord.username == "test_existing_admin")
        original_user = session.execute(stmt).scalar_one()
        original_password_hash = original_user.password_hash
        original_role = original_user.role
        original_active = original_user.active
        original_display_name = original_user.display_name
        original_email = original_user.email
        original_phone = original_user.phone
        
        # Now try to enable demo mode with same username
        os.environ["HONEYCHAIN_DEMO_MODE"] = "true"
        os.environ["HONEYCHAIN_DEMO_ADMIN_USERNAME"] = "test_existing_admin"
        os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = "DemoPassword984!@#"
        os.environ["HONEYCHAIN_ENV"] = "development"
        
        # Demo login should fail with 409
        response = client.post("/api/auth/demo-admin-login")
        
        # Should get a 409 conflict because username exists but is not a demo account
        assert response.status_code == 409
        detail = response.json()["detail"].lower()
        assert "non-demo user" in detail or "already exists" in detail
        
        # Verify the original user data was NOT changed
        session.expire_all()  # Force refresh from database
        stmt = select(UserRecord).where(UserRecord.username == "test_existing_admin")
        user_after = session.execute(stmt).scalar_one()
        
        assert user_after.password_hash == original_password_hash, "Password hash was modified"
        assert user_after.role == original_role, "Role was modified"
        assert user_after.active == original_active, "Active status was modified"
        assert user_after.display_name == original_display_name, "Display name was modified"
        assert user_after.email == original_email, "Email was modified"
        assert user_after.phone == original_phone, "Phone was modified"
    finally:
        # Restore
        if old_demo_mode:
            os.environ["HONEYCHAIN_DEMO_MODE"] = old_demo_mode
        else:
            if "HONEYCHAIN_DEMO_MODE" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_MODE"]
        
        if old_demo_username:
            os.environ["HONEYCHAIN_DEMO_ADMIN_USERNAME"] = old_demo_username
        else:
            if "HONEYCHAIN_DEMO_ADMIN_USERNAME" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_ADMIN_USERNAME"]
        
        if old_demo_password:
            os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"] = old_demo_password
        else:
            if "HONEYCHAIN_DEMO_ADMIN_PASSWORD" in os.environ:
                del os.environ["HONEYCHAIN_DEMO_ADMIN_PASSWORD"]
        
        if old_env:
            os.environ["HONEYCHAIN_ENV"] = old_env
        else:
            if "HONEYCHAIN_ENV" in os.environ:
                del os.environ["HONEYCHAIN_ENV"]
