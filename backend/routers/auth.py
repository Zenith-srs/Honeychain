from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.deps import get_current_user, require_roles
from backend.models.user import UserRecord
from backend.schemas.auth import (
    ForgotRequest,
    LanguageUpdate,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetRequest,
    TokenOut,
    UserOut,
)
from backend.schemas.invitation import RegisterAdminRequest, ValidateInvitationResponse
from backend.schemas.telemetry import Hive
from backend.services import auth_service, invitation_service, me_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: RegisterRequest, session: Session = Depends(get_db)) -> TokenOut:
    return auth_service.register_beekeeper(session, payload)





@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, session: Session = Depends(get_db)) -> TokenOut:
    return auth_service.authenticate(session, payload.username, payload.password)


@router.post("/login-form", response_model=TokenOut)
def login_form(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db),
) -> TokenOut:
    return auth_service.authenticate(session, form.username, form.password)


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshRequest, session: Session = Depends(get_db)) -> TokenOut:
    return auth_service.refresh_tokens(session, payload.refresh_token)


@router.post("/logout")
def logout(payload: RefreshRequest, session: Session = Depends(get_db)) -> dict[str, str]:
    auth_service.revoke_refresh(session, payload.refresh_token)
    return {"status": "signed_out"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotRequest, session: Session = Depends(get_db)) -> dict[str, str]:
    return auth_service.request_password_reset(session, payload.username)


@router.post("/reset-password")
def reset_password(payload: ResetRequest, session: Session = Depends(get_db)) -> dict[str, str]:
    return auth_service.reset_password(session, payload.username, payload.code or "", payload.password or "")


@router.get("/me", response_model=UserOut)
def me(user: UserRecord = Depends(get_current_user)) -> UserOut:
    return auth_service.user_out(user)


@router.get("/me/harvests")
def my_harvests(
    user: UserRecord = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[dict]:
    return me_service.harvests_for_user(session, user)


@router.get("/me/cluster")
def my_cluster(
    user: UserRecord = Depends(require_roles("officer", "admin")),
    session: Session = Depends(get_db),
) -> dict:
    return me_service.cluster_overview(session, user)


@router.patch("/me/language", response_model=UserOut)
def set_language(
    payload: LanguageUpdate,
    user: UserRecord = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> UserOut:
    return auth_service.set_language(session, user, payload.language)


@router.get("/me/hives", response_model=list[Hive])
def my_hives(
    user: UserRecord = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[Hive]:
    return me_service.hives_for_user(session, user)


@router.get("/status")
def auth_status() -> dict[str, bool | str]:
    """
    Public endpoint to check authentication system status.
    
    Returns demo mode status for frontend feature detection.
    """
    import os
    
    demo_mode = auth_service.is_demo_mode_enabled()
    env = os.environ.get("HONEYCHAIN_ENV", "development")
    
    return {
        "demo_mode": demo_mode,
        "environment": env,
    }


@router.post("/demo-login/{role}", response_model=TokenOut)
def demo_role_login(role: str, session: Session = Depends(get_db)) -> TokenOut:
    """
    Unified demo login endpoint for admin, officer, and lab roles.
    
    Only available when:
    - HONEYCHAIN_DEMO_MODE=true
    - HONEYCHAIN_ENV != production
    - Demo passwords configured for the requested role
    
    Allowed roles: admin, officer, lab
    
    Returns 404 when demo mode is disabled.
    Returns 422 for invalid roles.
    """
    if role not in ["admin", "officer", "lab"]:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid demo role '{role}'. Allowed roles: admin, officer, lab"
        )
    
    credentials = auth_service.get_demo_credentials(role)
    
    if credentials is None:
        raise HTTPException(
            status_code=404,
            detail=f"Demo {role} login is not available.",
        )
    
    demo_username, demo_password = credentials
    return auth_service.demo_login(session, role, demo_username, demo_password)


@router.get("/admin-invitation/validate", response_model=ValidateInvitationResponse)
def validate_admin_invitation(token: str, session: Session = Depends(get_db)) -> ValidateInvitationResponse:
    """
    Validate an admin invitation token (public).
    
    Returns safe metadata only, no sensitive data.
    """
    return invitation_service.validate_invitation(session, token)


@router.post("/register-admin", response_model=TokenOut, status_code=201)
def register_admin(payload: RegisterAdminRequest, session: Session = Depends(get_db)) -> TokenOut:
    """
    Register a new admin using an invitation token.
    
    Security:
    - Requires valid, unexpired, unused invitation
    - Role is always set to "admin" server-side
    - Validates username/email/phone uniqueness
    - Uses strong password hashing
    """
    user = invitation_service.register_admin_with_invitation(
        session=session,
        token=payload.token,
        username=payload.username,
        password=payload.password,
        display_name=payload.display_name,
        email=payload.email,
        phone=payload.phone,
    )
    session.commit()
    
    return auth_service.authenticate(session, user.username, payload.password)
