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
    resultado = await identify_object(file_bytes, file.content_type)

    objeto_detectado = resultado["objeto_detectado"]
    palabras_clave = resultado["palabras_clave"]

    print(f">>> Palabras clave: {palabras_clave}")  # ← añade esto

    supabase = get_supabase_client()

    todos = []
    vistos = set()

    for palabra in palabras_clave:
        if len(palabra) < 3:
            continue
        filtro = (
            f"nombre.ilike.%{palabra}%,"
            f"descripcion.ilike.%{palabra}%,"
            f"categoria.ilike.%{palabra}%,"
            f"material.ilike.%{palabra}%"
        )
        print(f">>> Buscando: {palabra} — filtro: {filtro}")  # ← y esto
        result = supabase.table("items").select("*").or_(filtro).execute()
        print(f">>> Resultados para '{palabra}': {len(result.data)}")  # ← y esto
        for item in result.data:
            if item["id"] not in vistos:
                vistos.add(item["id"])
                todos.append(item)

    print(f">>> Total coincidencias: {len(todos)}")  # ← y esto

    return {
        "objeto_detectado": objeto_detectado,
        "palabras_clave": palabras_clave,
        "coincidencias": todos
    }
