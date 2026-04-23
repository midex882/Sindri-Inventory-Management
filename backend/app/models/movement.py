from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

class MovementResponse(BaseModel):
    id: UUID
    item_id: UUID
    tipo: Literal["cantidad", "localizacion"]
    valor_anterior: str
    valor_nuevo: str
    usuario_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True