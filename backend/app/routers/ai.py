from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.dependencies import get_current_user
from app.services.gemini import identify_object
from app.services.supabase import get_supabase_client

router = APIRouter()

@router.post("/identify")
async def identify_item(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    file_bytes = await file.read()
    objeto_detectado = await identify_object(file_bytes, file.content_type)

    supabase = get_supabase_client()
    result = (
        supabase.table("items")
        .select("*")
        .or_(
            f"nombre.ilike.%{objeto_detectado}%,"
            f"descripcion.ilike.%{objeto_detectado}%"
        )
        .execute()
    )

    return {
        "objeto_detectado": objeto_detectado,
        "coincidencias": result.data
    }