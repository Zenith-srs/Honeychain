from __future__ import annotations

import re
from pydantic import BaseModel, Field, model_validator


SUPPORTED_LANGUAGES = ("en", "hi", "bn", "ta", "kn", "te", "mr")
STAFF_ROLES = ("officer", "lab", "admin", "beekeeper")


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    password: str = Field(..., min_length=4, max_length=120)


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    display_name: str
    language: str
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class UserOut(BaseModel):
    username: str
    display_name: str
    role: str
    beekeeper_id: str | None
    cluster: str | None
    region: str | None
    language: str
    email: str | None = None
    phone: str | None = None
    active: bool = True


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=120)
    display_name: str = Field(..., min_length=2, max_length=120)
    region: str = Field(default="West Bengal", min_length=2, max_length=100)
    cluster: str = Field(default="", max_length=100)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    phone: str = Field(..., min_length=10, max_length=15, pattern=r"^[0-9+\-\s()]+$")
    language: str = Field(default="en", min_length=2, max_length=8)
    
    @model_validator(mode="after")
    def validate_fields(self) -> "RegisterRequest":
        # Validate username - alphanumeric, underscore, hyphen only
        if not self.username or len(self.username.strip()) < 3:
            raise ValueError("Username must be at least 3 characters long.")
        
        # Check for common weak usernames
        weak_usernames = ["abc", "test", "admin", "user", "demo", "guest", "root", "default"]
        if self.username.lower() in weak_usernames:
            raise ValueError("Username is too common. Please choose a more unique username.")
        
        # Validate password strength
        if not self._is_password_strong(self.password):
            raise ValueError(
                "Password must contain at least: 1 uppercase letter, 1 lowercase letter, "
                "1 number, and 1 special character (!@#$%^&*)"
            )
        
        # Check for sequential or repeated characters
        if self._has_sequential_chars(self.password):
            raise ValueError("Password cannot contain sequential characters (e.g., '123', 'abc').")
        
        # Validate email format (additional check beyond pattern)
        if not self.email or "@" not in self.email:
            raise ValueError("Valid email address is required.")
        
        # Validate phone number
        if not self.phone or len(self.phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")) < 10:
            raise ValueError("Valid phone number with at least 10 digits is required.")
        
        return self
    
    @staticmethod
    def _is_password_strong(password: str) -> bool:
        """Check if password meets strength requirements."""
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()-_=+[]{}|;:,.<>?/~`" for c in password)
        return has_upper and has_lower and has_digit and has_special
    
    @staticmethod
    def _has_sequential_chars(password: str) -> bool:
        """Check for sequential or repeated characters."""
        # Check for repeated characters (e.g., 'aaa', '111')
        for i in range(len(password) - 2):
            if password[i] == password[i + 1] == password[i + 2]:
                return True
        
        # Check for sequential numbers or letters
        sequences = ['012', '123', '234', '345', '456', '567', '678', '789',
                    'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
                    'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr',
                    'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz']
        password_lower = password.lower()
        return any(seq in password_lower for seq in sequences)


class LanguageUpdate(BaseModel):
    language: str = Field(..., min_length=2, max_length=8)


class ForgotRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)


class ResetRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    code: str | None = Field(default=None, min_length=4, max_length=12)
    password: str | None = Field(default=None, min_length=8, max_length=120)
    reset_code: str | None = Field(default=None, max_length=12)
    new_password: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def resolve_aliases(self) -> "ResetRequest":
        code = (self.code or self.reset_code or "").strip()
        password = self.password or self.new_password or ""
        if len(code) < 4:
            raise ValueError("Reset code is required.")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")
        self.code = code
        self.password = password
        return self


class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    password: str = Field(..., min_length=8, max_length=120)
    display_name: str = Field(..., min_length=2, max_length=120)
    role: str = Field(..., min_length=3, max_length=32)
    region: str | None = None
    cluster: str | None = None
    email: str | None = None
    phone: str | None = None


class AdminUserUpdate(BaseModel):
    role: str | None = None
    active: bool | None = None
    region: str | None = None
    cluster: str | None = None
    display_name: str | None = None
