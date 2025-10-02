from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    rut_usuario: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
