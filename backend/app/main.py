import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, items, movements, ai, wardrobe

app = FastAPI(
    title="Sindri API",
    description="API de inventario de almacén",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://sindri-inventory-management.vercel.app/",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(movements.router, prefix="/movements", tags=["movements"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(wardrobe.router, prefix="/wardrobe", tags=["wardrobe"])

@app.get("/")
def root():
    return {"status": "Sindri API running"}