from pydantic import BaseModel, ConfigDict
from typing import List


class EnrollRequest(BaseModel):
    email: str
    index_finger: List[str]  # base64 FMDs


class VerifyRequest(BaseModel):
    fingerprint: str  # base64 FMD
