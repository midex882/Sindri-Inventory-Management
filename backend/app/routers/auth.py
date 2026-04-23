from fastapi import APIRouter, Depends, HTTPException
from app.config import get_settings
from app.dependencies import get_current_user
from app.services.supabase import get_supabase_client

router = APIRouter()

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", current_user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return result.data

@router.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    supabase = get_supabase_client()
    result = supabase.table("profiles").select("*").execute()
    return result.data

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    new_role = body.get("role")
    if new_role not in ["admin", "editor", "viewer"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    supabase = get_supabase_client()
    result = (
        supabase.table("profiles")
        .update({"role": new_role})
        .eq("id", user_id)
        .execute()
    )
    return result.data[0]