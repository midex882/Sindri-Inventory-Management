from google import genai
from google.genai import types
from app.config import get_settings
import base64
import asyncio

async def identify_object(image_bytes: bytes, content_type: str) -> dict:
    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    prompt = (
        "Analiza la imagen y responde ÚNICAMENTE con una lista de palabras clave en español "
        "separadas por comas, en minúsculas, sin puntuación final. "
        "Incluye: el nombre del objeto, sinónimos, categoría, material si es visible, color si es relevante. "
        "Máximo 8 palabras clave. "
        "Ejemplo: 'martillo, herramienta, madera, metal, carpintería'"
    )

    contents = [
        types.Content(
            parts=[
                types.Part(
                    inline_data=types.Blob(
                        mime_type=content_type,
                        data=base64.b64encode(image_bytes).decode("utf-8")
                    )
                ),
                types.Part(text=prompt)
            ]
        )
    ]

    for intento in range(3):
        try:
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=contents
            )
            texto = response.text.strip().lower()
            palabras = [p.strip() for p in texto.split(",") if p.strip()]
            return {
                "objeto_detectado": palabras[0] if palabras else "objeto",
                "palabras_clave": palabras
            }
        except Exception as e:
            if intento < 2 and ("503" in str(e) or "UNAVAILABLE" in str(e)):
                await asyncio.sleep(2 ** intento)
                continue
            raise