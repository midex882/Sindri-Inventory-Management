from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.backends import ECKey
import httpx
import json
from functools import lru_cache
from app.config import get_settings
from app.services.supabase import get_supabase_client


security = HTTPBearer()

@lru_cache()
def get_jwks():
    settings = get_settings()
    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    response = httpx.get(url)
    response.raise_for_status()
    return response.json()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    settings=Depends(get_settings)
):
    token = credentials.credentials
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break

        if key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Clave pública no encontrada"
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256", "HS256"],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

        # Leer rol real desde la tabla profiles
        supabase = get_supabase_client()
        profile = supabase.table("profiles").select("role, familia").eq("id", user_id).single().execute()

        if not profile.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Perfil no encontrado"
            )

        user_metadata = payload.get("user_metadata", {})
        avatar_url = user_metadata.get("picture", "")

        return {
            "id": user_id,
            "role": profile.data["role"],
            "familia": profile.data.get("familia", False),
            "avatar_url": avatar_url
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}"
        )

def require_role(*roles: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para esta acción"
            )
        return current_user
    return role_checker