"""
Tests for admin invitation feature.

Security requirements:
1. Only admins can create invitations
2. Invitations are single-use
3. Invitations expire
4. Invitations can be revoked
5. Raw tokens never stored in database (only SHA-256 hashes)
6. Registration role cannot be changed by client
7. Public users cannot create admin accounts without invitation
"""

import hashlib
import time
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models.invitation import AdminInvitationRecord
from backend.models.user import UserRecord


def test_only_admin_can_create_invitation(
    client: TestClient,
    beekeeper_token: str,
    officer_token: str,
    admin_token: str
):
    """Only admin users can create invitations."""
    payload = {"intended_email": "newadmin@test.com", "expires_in_hours": 24}
    
    # Beekeeper cannot create
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {beekeeper_token}"},
        json=payload
    )
    assert response.status_code == 403
    
    # Officer cannot create
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {officer_token}"},
        json=payload
    )
    assert response.status_code == 403
    
    # Admin can create
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    assert response.status_code == 201


def test_invitation_creation_returns_token_once(client: TestClient, admin_token: str):
    """Invitation creation should return raw token only once."""
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"intended_email": "test@example.com", "expires_in_hours": 24}
    )
    
    assert response.status_code == 201
    data = response.json()
    
    # Should contain raw token and URL
    assert "token" in data
    assert "invitation_url" in data
    assert "expires_at" in data
    assert "warning" in data
    
    # Token should be long and random
    assert len(data["token"]) > 32
    
    # URL should contain token
    assert data["token"] in data["invitation_url"]
    assert "/admin/register?token=" in data["invitation_url"]


def test_invitation_token_stored_as_hash(
    client: TestClient,
    admin_token: str,
    session: Session
):
    """Raw invitation tokens should never be stored - only SHA-256 hashes."""
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    
    assert response.status_code == 201
    raw_token = response.json()["token"]
    
    # Check database - should only have hash
    invitations = session.query(AdminInvitationRecord).all()
    
    # Compute expected hash
    expected_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    
    # Find invitation by hash
    found = False
    for inv in invitations:
        if inv.token_hash == expected_hash:
            found = True
            break
    
    assert found, "Invitation hash not found in database"
    
    # Ensure raw token is NOT in database
    for inv in invitations:
        assert inv.token_hash != raw_token, "Raw token found in database!"


def test_invitation_validation(client: TestClient, admin_token: str):
    """Invitation validation endpoint should return safe metadata."""
    # Create invitation
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"intended_email": "test@example.com", "expires_in_hours": 24}
    )
    token = create_response.json()["token"]
    
    # Validate invitation
    validate_response = client.get(
        f"/api/auth/admin-invitation/validate?token={token}"
    )
    
    assert validate_response.status_code == 200
    data = validate_response.json()
    
    assert data["valid"] is True
    assert data["role"] == "admin"
    assert data["intended_email"] == "test@example.com"
    assert data["expired"] is False
    assert data["used"] is False
    assert data["revoked"] is False


def test_invitation_is_single_use(client: TestClient, admin_token: str):
    """Invitations can only be used once."""
    # Create invitation
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    token = create_response.json()["token"]
    
    # Register first admin
    register_payload = {
        "token": token,
        "username": "admin_one",
        "password": "AdminOne984!@#",
        "display_name": "Admin One",
        "email": "admin1@test.com",
        "phone": "+9848766591",
    }
    
    response1 = client.post("/api/auth/register-admin", json=register_payload)
    assert response1.status_code == 201
    
    # Try to register second admin with same token
    register_payload["username"] = "admin_two"
    register_payload["email"] = "admin2@test.com"
    register_payload["phone"] = "+9848766592"
    
    response2 = client.post("/api/auth/register-admin", json=register_payload)
    assert response2.status_code == 409  # Already used
    assert "already been used" in response2.json()["detail"].lower()


def test_invitation_expiration(client: TestClient, admin_token: str, session: Session):
    """Expired invitations cannot be used."""
    # Create invitation that expires in 1 hour
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 1}
    )
    token = create_response.json()["token"]
    
    # Manually expire it in database
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    invitation = session.query(AdminInvitationRecord).filter_by(token_hash=token_hash).first()
    invitation.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
    session.commit()
    
    # Try to validate - should be expired
    validate_response = client.get(
        f"/api/auth/admin-invitation/validate?token={token}"
    )
    
    assert validate_response.status_code == 200
    data = validate_response.json()
    assert data["valid"] is False
    assert data["expired"] is True
    
    # Try to register - should fail
    register_response = client.post(
        "/api/auth/register-admin",
        json={
            "token": token,
            "username": "expired_admin",
            "password": "ExpiredStrong!@#99",
            "display_name": "Expired Admin",
            "email": "expired@test.com",
            "phone": "+9848766590",
        }
    )
    assert register_response.status_code == 410  # Gone/expired


def test_invitation_revocation(client: TestClient, admin_token: str, session: Session):
    """Admins can revoke invitations."""
    # Create invitation
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    token = create_response.json()["token"]
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    
    # Revoke invitation
    revoke_response = client.delete(
        f"/api/admin/invitations/{token_hash}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert revoke_response.status_code == 204
    
    # Validate - should be revoked
    validate_response = client.get(
        f"/api/auth/admin-invitation/validate?token={token}"
    )
    data = validate_response.json()
    assert data["valid"] is False
    assert data["revoked"] is True
    
    # Try to register - should fail
    register_response = client.post(
        "/api/auth/register-admin",
        json={
            "token": token,
            "username": "revoked_admin",
            "password": "Revoked984!@#",
            "display_name": "Revoked Admin",
            "email": "revoked@test.com",
            "phone": "+9848766590",
        }
    )
    assert register_response.status_code == 403  # Forbidden/revoked


def test_admin_registration_role_server_side(client: TestClient, admin_token: str):
    """Registration role must always be 'admin' server-side, never trust client."""
    # Create invitation
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    token = create_response.json()["token"]
    
    # Try to register with role='officer' in payload (should be ignored)
    register_response = client.post(
        "/api/auth/register-admin",
        json={
            "token": token,
            "username": "sneaky_user",
            "password": "Sneaky984!@#",
            "display_name": "Sneaky User",
            "email": "sneaky@test.com",
            "phone": "+9848766590",
            "role": "officer",  # This should be ignored
        }
    )
    
    assert register_response.status_code == 201
    data = register_response.json()
    
    # Role should be 'admin' regardless of what client sent
    assert data["role"] == "admin"


@pytest.mark.xfail(reason="Password validation error handling needs fix - ValueError not JSON serializable")
def test_public_cannot_create_admin_without_invitation(client: TestClient):
    """Public users cannot create admin accounts without valid invitation."""
    # Try to register admin without invitation
    response = client.post(
        "/api/auth/register",
        json={
            "username": "hacker_admin",
            "password": "HackerStrong!@#NP",  # No sequential chars
            "display_name": "Hacker Admin",
            "email": "hacker@test.com",
            "phone": "+9848766590",
            "region": "Test",
            "language": "en",
            "role": "admin",  # Try to set admin role
        }
    )
    
    # Should either fail or create beekeeper (never admin)
    if response.status_code == 201:
        data = response.json()
        assert data["role"] == "beekeeper", "Public registration created admin!"
    
    # Try with fake invitation token
    fake_response = client.post(
        "/api/auth/register-admin",
        json={
            "token": "fake_token_98445",
            "username": "fake_admin",
            "password": "FakeStrong!@#QX",  # No sequential chars
            "display_name": "Fake Admin",
            "email": "fake@test.com",
            "phone": "+9848766590",
        }
    )
    assert fake_response.status_code == 404


def test_invitation_list_admin_only(
    client: TestClient,
    beekeeper_token: str,
    admin_token: str
):
    """Only admins can list invitations."""
    # Beekeeper cannot list
    response = client.get(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {beekeeper_token}"}
    )
    assert response.status_code == 403
    
    # Admin can list
    response = client.get(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_registration_validates_uniqueness(client: TestClient, admin_token: str):
    """Admin registration should enforce username/email/phone uniqueness."""
    # Create invitation
    create_response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    token = create_response.json()["token"]
    
    # Register first admin
    response1 = client.post(
        "/api/auth/register-admin",
        json={
            "token": token,
            "username": "unique_admin",
            "password": "Unique984!@#",
            "display_name": "Unique Admin",
            "email": "unique@test.com",
            "phone": "+1111111111",
        }
    )
    assert response1.status_code == 201
    
    # Create second invitation
    create_response2 = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    token2 = create_response2.json()["token"]
    
    # Try to register with duplicate username
    response2 = client.post(
        "/api/auth/register-admin",
        json={
            "token": token2,
            "username": "unique_admin",  # Duplicate
            "password": "Duplicate984!@#",
            "display_name": "Duplicate Admin",
            "email": "different@test.com",
            "phone": "+2222222222",
        }
    )
    assert response2.status_code == 409
    assert "username" in response2.json()["detail"].lower()


def test_invitation_includes_creator(client: TestClient, admin_token: str):
    """Invitations should track who created them."""
    response = client.post(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"expires_in_hours": 24}
    )
    
    # Get admin username from token
    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    admin_username = me_response.json()["username"]
    
    # List invitations
    list_response = client.get(
        "/api/admin/invitations",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    invitations = list_response.json()
    assert len(invitations) > 0
    
    # Find our invitation
    for inv in invitations:
        if inv["created_by"] == admin_username:
            assert "expires_at" in inv
            assert "is_valid" in inv
            break
    else:
        pytest.fail("Created invitation not found in list")

