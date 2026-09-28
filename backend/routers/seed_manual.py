"""Manual database seeding endpoint for Railway deployment troubleshooting."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db, init_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/seed-database")
def manual_seed(session: Session = Depends(get_db)) -> dict:
    """Manually trigger database initialization and seeding."""
    try:
        init_db()
        return {"status": "success", "message": "Database seeded successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/check-accounts")
def check_accounts(session: Session = Depends(get_db)) -> dict:
    """Check which staff accounts exist in database."""
    from backend.models.user import UserRecord
    
    staff_usernames = ["kvic_admin", "kvic_field_officer", "lab_inspector"]
    accounts = {}
    
    for username in staff_usernames:
        user = session.get(UserRecord, username)
        accounts[username] = "exists" if user else "missing"
    
    return {"accounts": accounts}
