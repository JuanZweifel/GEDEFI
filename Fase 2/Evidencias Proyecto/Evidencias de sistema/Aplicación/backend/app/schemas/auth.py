from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    rut_usuario: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None
    admin: Optional[bool] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
