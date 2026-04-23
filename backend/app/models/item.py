from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ItemBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria: str
    material: Optional[str] = None
    localizacion: str
    cantidad: int
    imagen_url: Optional[str] = None
    notas: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    material: Optional[str] = None
    localizacion: Optional[str] = None
    cantidad: Optional[int] = None
    imagen_url: Optional[str] = None
    notas: Optional[str] = None

class ItemResponse(ItemBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: UUID

    class Config:
        from_attributes = True