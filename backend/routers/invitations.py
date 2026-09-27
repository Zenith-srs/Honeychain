"""
Admin invitation endpoints.

Security:
- All endpoints require authenticated admin
- Raw tokens are only returned once at creation
- Tokens are stored as SHA-256 hashes
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.deps import require_roles
from backend.models.user import UserRecord
from backend.schemas.invitation import (
    CreateInvitationRequest,
    InvitationCreatedResponse,
    InvitationOut,
)
from backend.services import invitation_service

router = APIRouter(prefix="/api/admin/invitations", tags=["admin", "invitations"])


@router.post("", response_model=InvitationCreatedResponse, status_code=201)
def create_invitation(
    payload: CreateInvitationRequest,
    request: Request,
    admin: UserRecord = Depends(require_roles("admin")),
    session: Session = Depends(get_db),
) -> InvitationCreatedResponse:
    """
    Create a new admin invitation (admin only).
    
    Returns the invitation URL and raw token ONCE.
    The token will not be shown again.
    """
    # Construct base URL from request
    base_url = str(request.base_url).rstrip("/")
    
    return invitation_service.create_invitation(
        session=session,
        admin_username=admin.username,
        payload=payload,
        base_url=base_url,
    )


@router.get("", response_model=list[InvitationOut])
def list_invitations(
    admin: UserRecord = Depends(require_roles("admin")),
    session: Session = Depends(get_db),
) -> list[InvitationOut]:
    """
    List all admin invitations (admin only).
    
    Returns invitations ordered by creation date (newest first).
    Does not include raw tokens.
    """
    return invitation_service.list_invitations(session)


@router.delete("/{token_hash}", status_code=204)
def revoke_invitation(
    token_hash: str,
    admin: UserRecord = Depends(require_roles("admin")),
    session: Session = Depends(get_db),
) -> None:
    """
    Revoke an invitation by its token hash (admin only).
    
    Revoked invitations cannot be used for registration.
    """
    invitation_service.revoke_invitation(session, token_hash)
    session.commit()
