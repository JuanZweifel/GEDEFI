from pydantic import BaseModel, Field


class ReportPartidosRequest(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int
