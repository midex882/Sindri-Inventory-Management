from google import genai
from google.genai import types
from app.config import get_settings
import base64

async def identify_object(image_bytes: bytes, content_type: str) -> str:
    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            types.Content(
                parts=[
                    types.Part(
                        inline_data=types.Blob(
                            mime_type=content_type,
                            data=base64.b64encode(image_bytes).decode("utf-8")
                        )
                    ),
                    types.Part(
                        text=(
                            "Identifica el objeto principal que aparece en esta imagen. "
                            "Responde ÚNICAMENTE con el nombre del objeto en español, "
                            "en singular y en minúsculas. "
                            "Por ejemplo: 'destornillador', 'martillo', 'tuerca'. "
                            "Sin explicaciones, sin puntuación, solo el nombre."
                        )
                    )
                ]
            )
        ]
    )

    return response.text.strip().lower()