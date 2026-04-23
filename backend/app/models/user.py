from pydantic import BaseModel
from typing import Literal

class UserProfile(BaseModel):
    id: str
    email: str
    role: Literal["admin", "editor", "viewer"]