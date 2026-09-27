from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base


class AdminInvitationRecord(Base):
    """
    Stores admin invitations with secure token hashing.
    
    Security notes:
    - token_hash stores SHA-256 hash, never the raw token
    - tokens are cryptographically random, single-use
    - invitations expire and can be revoked
    """
    __tablename__ = "admin_invitations"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hex
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="admin")
    intended_email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_by: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
