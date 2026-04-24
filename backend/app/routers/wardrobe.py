from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from app.dependencies import get_current_user
from app.services.supabase import get_supabase_client
from colorthief import ColorThief
from PIL import Image
import io, uuid

router = APIRouter()

def get_familia_or_admin(current_user: dict):
    if not (current_user.get("familia") or current_user.get("role") == "admin"):
        raise HTTPException(status_code=403, detail="Solo familia")
    return current_user

def extract_colors(image_bytes: bytes) -> list[str]:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        ct = ColorThief(buf)
        palette = ct.get_palette(color_count=3, quality=5)
        return [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in palette[:3]]
    except Exception:
        return []

@router.get("/")
def list_wardrobe(
    search: Optional[str] = None,
    categoria: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    get_familia_or_admin(current_user)
    supabase = get_supabase_client()
    query = supabase.table("wardrobe").select("*").order("created_at", desc=True)
    if categoria:
        query = query.eq("categoria", categoria)
    result = query.execute()
    data = result.data

    if search:
        s = search.lower()
        data = [
            p for p in data if
            s in (p.get("nombre") or "").lower() or
            s in (p.get("marca") or "").lower() or
            s in (p.get("material") or "").lower() or
            s in (p.get("tipo") or "").lower() or
            s in (p.get("categoria") or "").lower() or
            any(s in c.lower() for c in (p.get("colores") or []))
        ]

    return data

@router.get("/{prenda_id}")
def get_prenda(prenda_id: str, current_user: dict = Depends(get_current_user)):
    get_familia_or_admin(current_user)
    supabase = get_supabase_client()
    result = supabase.table("wardrobe").select("*").eq("id", prenda_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    return result.data

@router.post("/")
async def create_prenda(
    nombre: str = Form(...),
    talla: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
    tipo: Optional[str] = Form(None),
    marca: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    fotos: list[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user)
):
    get_familia_or_admin(current_user)
    supabase = get_supabase_client()

    foto_urls = []
    colores = []

    for i, foto in enumerate(fotos):
        if not foto.content_type.startswith("image/"):
            continue
        file_bytes = await foto.read()
        if i == 0:
            colores = extract_colors(file_bytes)
        ext = foto.filename.split(".")[-1] if "." in foto.filename else "jpg"
        path = f"{uuid.uuid4()}.{ext}"
        supabase.storage.from_("wardrobe-images").upload(
            path, file_bytes, {"content-type": foto.content_type}
        )
        public_url = supabase.storage.from_("wardrobe-images").get_public_url(path)
        foto_urls.append(public_url)

    result = supabase.table("wardrobe").insert({
        "nombre": nombre,
        "talla": talla,
        "categoria": categoria,
        "tipo": tipo,
        "marca": marca,
        "material": material,
        "colores": colores,
        "fotos": foto_urls,
        "created_by": current_user["id"]
    }).execute()

    return result.data[0]

@router.patch("/{prenda_id}")
async def update_prenda(
    prenda_id: str,
    nombre: Optional[str] = Form(None),
    talla: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
    tipo: Optional[str] = Form(None),
    marca: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    fotos_nuevas: list[UploadFile] = File(default=[]),
    fotos_existentes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    get_familia_or_admin(current_user)
    supabase = get_supabase_client()

    existing = supabase.table("wardrobe").select("*").eq("id", prenda_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")

    prenda = existing.data
    foto_urls = []

    if fotos_existentes is not None:
        import json
        try:
            foto_urls = json.loads(fotos_existentes)
        except Exception:
            foto_urls = prenda.get("fotos", [])
    else:
        foto_urls = prenda.get("fotos", [])

    colores = prenda.get("colores", [])
    primera_foto_nueva = len(foto_urls) == 0

    for i, foto in enumerate(fotos_nuevas):
        if not foto.content_type.startswith("image/"):
            continue
        file_bytes = await foto.read()
        if primera_foto_nueva and i == 0:
            colores = extract_colors(file_bytes)
        ext = foto.filename.split(".")[-1] if "." in foto.filename else "jpg"
        path = f"{uuid.uuid4()}.{ext}"
        supabase.storage.from_("wardrobe-images").upload(
            path, file_bytes, {"content-type": foto.content_type}
        )
        public_url = supabase.storage.from_("wardrobe-images").get_public_url(path)
        foto_urls.append(public_url)

    updates = {"fotos": foto_urls, "colores": colores, "updated_at": "now()"}
    if nombre is not None: updates["nombre"] = nombre
    if talla is not None: updates["talla"] = talla
    if categoria is not None: updates["categoria"] = categoria
    if tipo is not None: updates["tipo"] = tipo
    if marca is not None: updates["marca"] = marca
    if material is not None: updates["material"] = material

    result = supabase.table("wardrobe").update(updates).eq("id", prenda_id).execute()
    return result.data[0]

@router.delete("/{prenda_id}")
def delete_prenda(prenda_id: str, current_user: dict = Depends(get_current_user)):
    get_familia_or_admin(current_user)
    supabase = get_supabase_client()
    supabase.table("wardrobe").delete().eq("id", prenda_id).execute()
    return {"ok": True}