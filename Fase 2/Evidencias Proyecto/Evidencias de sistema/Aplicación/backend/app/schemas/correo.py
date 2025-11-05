from pydantic import BaseModel
from typing import Union, List


class ComunicadoRequest(BaseModel):
    asunto: str
    cuerpo: str
    destinatarios: Union[str, List[str]]
