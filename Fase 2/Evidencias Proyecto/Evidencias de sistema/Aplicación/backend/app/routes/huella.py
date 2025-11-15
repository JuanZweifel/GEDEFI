from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import json

from app.db import get_db
from app.models import Usuario
from app import schemas

router = APIRouter(prefix="/huella", tags=["Huella"])

PHP_ENROLL_URL = "http://localhost:5555/coreComponents/enroll.php"
PHP_VERIFY_URL = "http://localhost:5555/coreComponents/verify.php"


@router.post("/enroll")
async def enroll_fingerprint(req: schemas.EnrollRequest, db: Session = Depends(get_db)):
    """
    Receives fingerprint samples (index_finger), forwards them to the PHP client,
    receives the final template from HID engine, and stores it in the DB.
    """

    # 1. Find the user
    user: Usuario = db.query(Usuario).filter(Usuario.email_usuario == req.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validate samples
    if not req.index_finger or len(req.index_finger) == 0:
        raise HTTPException(status_code=400, detail="No fingerprint samples provided")

    # 2. Prepare payload for PHP client
    # PHP expects a form field "data" containing a JSON string
    post_data = {
        "data": json.dumps(
            {"index_finger": req.index_finger, "middle_finger": req.index_finger}
        )
    }

    # 3. Send request to PHP client
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PHP_ENROLL_URL,
                data=post_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=20,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500, detail=f"PHP client error: {response.text}"
            )

        engine_output = response.json()

        if "enrolled_index_finger" not in engine_output:
            raise HTTPException(
                status_code=500, detail=f"Invalid engine response: {engine_output}"
            )

        final_template = engine_output["enrolled_index_finger"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 4. Save final template in DB
    user.huella_indice = final_template
    db.add(user)
    db.commit()

    return {
        "status": "ok",
        "stored_for": user.email_usuario,
        "template_length": len(final_template),
    }


@router.post("/verify")
async def verify_fingerprint(req: schemas.VerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies a fingerprint by delegating the comparison to the PHP client.
    """

    # 1. Look up the user
    user: Usuario = db.query(Usuario).filter(Usuario.email_usuario == req.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    enrolled_fp = user.huella_indice
    if not enrolled_fp:
        raise HTTPException(
            status_code=400, detail="Usuario no tiene huella registrada"
        )

    # 2. Prepare payload for PHP client
    post_data = {
        "data": (
            "{"
            f'"pre_enrolled_finger_data": "{req.fingerprint}",'
            f'"enrolled_index_finger_data": "{enrolled_fp}",'
            f'"enrolled_middle_finger_data": "{enrolled_fp}"'
            "}"
        )
    }

    # 3. Send to PHP verification endpoint
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PHP_VERIFY_URL,
                data=post_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=20,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500, detail=f"Engine error: {response.text}"
            )

        engine_result = response.text.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 4. Interpret engine result
    if engine_result == "match":
        return {"status": "ok", "message": "Huellas verificadas correctamente"}

    elif engine_result == "no_match":
        raise HTTPException(status_code=401, detail="Las huellas no coinciden")

    else:
        raise HTTPException(
            status_code=500, detail=f"Respuesta inesperada del motor: {engine_result}"
        )
