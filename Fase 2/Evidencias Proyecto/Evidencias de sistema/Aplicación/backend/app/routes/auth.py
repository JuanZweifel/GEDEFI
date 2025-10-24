import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.usuario import Usuario
from sqlalchemy.orm import Session
from app.security import get_password_hash
from app.schemas import (
    LoginRequest,
    Token,
    PasswordRecoveryRequest,
    ResetPasswordRequest,
    RefreshRequest,
)
from app.services.auth import (
    login_for_access_token,
    send_recovery_email,
    reset_user_password,
    refresh_access_token,
)
from app.db import get_db
from app.models.recuperacion_contrasena import RecuperacionContrasena

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    token = login_for_access_token(db, form_data.email, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.post("/recover")
def recover_password(recovery: PasswordRecoveryRequest, db: Session = Depends(get_db)):
    send_recovery_email(db, recovery.email)

    return {
        "message": "Si el correo existe, se enviará un email para recuperar la contraseña."
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    return reset_user_password(db, request.token, request.new_password)


@router.post("/refresh")
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    return refresh_access_token(req.refresh_token, db)
