from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from typing import Optional
from uuid import UUID
from app.dependencies import get_current_user, require_role
from app.models.item import ItemCreate, ItemUpdate, ItemResponse
from app.services.supabase import get_supabase_client
import uuid

router = APIRouter()

@router.get("/", response_model=list[ItemResponse])
def get_items(
    search: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    localizacion: Optional[str] = Query(None),
    order_by: Optional[str] = Query("created_at"),
    order_dir: Optional[str] = Query("desc"),
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    query = supabase.table("items").select("*")

    if search:
        query = query.or_(
            f"nombre.ilike.%{search}%,"
            f"descripcion.ilike.%{search}%,"
            f"categoria.ilike.%{search}%,"
            f"material.ilike.%{search}%,"
            f"localizacion.ilike.%{search}%"
        )
    if categoria:
        query = query.eq("categoria", categoria)
    if material:
        query = query.eq("material", material)
    if localizacion:
        query = query.eq("localizacion", localizacion)

    ascending = order_dir == "asc"
    query = query.order(order_by, desc=not ascending)

    result = query.execute()
    return result.data

@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: UUID, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    result = supabase.table("items").select("*").eq("id", str(item_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return result.data

@router.post("/", response_model=ItemResponse)
def create_item(
    item: ItemCreate,
    current_user: dict = Depends(require_role("admin", "editor"))
):
    supabase = get_supabase_client()
    data = item.model_dump()
    data["id"] = str(uuid.uuid4())
    data["created_by"] = current_user["id"]
    result = supabase.table("items").insert(data).execute()
    return result.data[0]

@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: UUID,
    item: ItemUpdate,
    current_user: dict = Depends(require_role("admin", "editor"))
):
    supabase = get_supabase_client()

    existing = supabase.table("items").select("*").eq("id", str(item_id)).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    changes = item.model_dump(exclude_unset=True)

    # Registrar movimientos si cambia cantidad o localizacion
    for campo in ["cantidad", "localizacion"]:
        if campo in changes and changes[campo] != existing.data[campo]:
            supabase.table("movements").insert({
                "item_id": str(item_id),
                "tipo": campo,
                "valor_anterior": str(existing.data[campo]),
                "valor_nuevo": str(changes[campo]),
                "usuario_id": current_user["id"]
            }).execute()

    result = supabase.table("items").update(changes).eq("id", str(item_id)).execute()
    return result.data[0]

@router.delete("/{item_id}")
def delete_item(
    item_id: UUID,
    current_user: dict = Depends(require_role("admin"))
):
    supabase = get_supabase_client()
    supabase.table("items").delete().eq("id", str(item_id)).execute()
    return {"message": "Artículo eliminado"}

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("admin", "editor"))
):
    supabase = get_supabase_client()
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_bytes = file.file.read()

    supabase.storage.from_("item-images").upload(
        path=file_name,
        file=file_bytes,
        file_options={"content-type": file.content_type}
    )

    url = supabase.storage.from_("item-images").get_public_url(file_name)
    return {"url": url}