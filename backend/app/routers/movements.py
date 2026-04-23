from fastapi import APIRouter, Depends, Query
from typing import Optional
from uuid import UUID
from app.dependencies import get_current_user
from app.models.movement import MovementResponse
from app.services.supabase import get_supabase_client

router = APIRouter()

@router.get("/", response_model=list[MovementResponse])
def get_movements(
    item_id: Optional[UUID] = Query(None),
    tipo: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    query = supabase.table("movements").select("*").order("created_at", desc=True)

    if item_id:
        query = query.eq("item_id", str(item_id))
    if tipo:
        query = query.eq("tipo", tipo)

    result = query.execute()
    return result.data

@router.get("/{item_id}", response_model=list[MovementResponse])
def get_item_movements(
    item_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    result = (
        supabase.table("movements")
        .select("*")
        .eq("item_id", str(item_id))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data