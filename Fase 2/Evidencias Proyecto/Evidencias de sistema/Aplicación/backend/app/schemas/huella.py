from pydantic import BaseModel, ConfigDict
from typing import List


class EnrollRequest(BaseModel):
    email: str
    index_finger: List[str]  # base64 FMDs


class VerifyRequest(BaseModel):
    email: str
    probe: str  # base64 FMD
