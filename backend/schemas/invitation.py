from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class CreateInvitationRequest(BaseModel):
    """Request to create an admin invitation."""
    intended_email: str | None = Field(
        default=None, 
        min_length=5, 
        max_length=120,
        description="Optional email address of the intended recipient"
    )
    expires_in_hours: int = Field(
        default=24,
        ge=1,
        le=168,  # Max 7 days
        description="Number of hours until invitation expires"
    )


class InvitationOut(BaseModel):
    """Admin invitation details (without raw token)."""
    token_hash: str
    role: str
    intended_email: str | None
    created_by: str
    created_at: datetime
    expires_at: datetime
    used_at: datetime | None
    revoked_at: datetime | None
    is_valid: bool  # Computed: not used, not revoked, not expired


class InvitationCreatedResponse(BaseModel):
    """Response after creating an invitation - includes raw token ONCE."""
    invitation_url: str
    token: str  # Raw token - shown only once
    expires_at: datetime
    warning: str = "This invitation link will only be shown once. Copy it now."


class ValidateInvitationResponse(BaseModel):
    """Public validation response - safe metadata only."""
    valid: bool
    role: str | None = None
    intended_email: str | None = None
    expired: bool = False
    used: bool = False
    revoked: bool = False
    detail: str = ""


class RegisterAdminRequest(BaseModel):
    """Admin registration payload using an invitation token."""
    token: str = Field(..., min_length=32, max_length=128)
    username: str = Field(..., min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=120)
    display_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    phone: str = Field(..., min_length=10, max_length=15, pattern=r"^[0-9+\-\s()]+$")
