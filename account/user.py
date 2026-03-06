from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any

class User(BaseModel):
    """User model representing the database users table."""
    
    # Required fields
    id: int
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    hashed_password: str
    
    # Optional fields
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    avatar: Optional[str] = Field(None, max_length=255)
    
    # Status fields
    is_active: bool = True
    is_superuser: bool = False
    soul_status: str = "pending"  # pending, transferred, questioned
    
    # Kevin's special fields
    kevin_notes: Dict[str, Any] = Field(default_factory=dict)
    unicorn_sightings: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    last_logout: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allows creation from asyncpg record
    
    def get_payload(self) -> dict:
        tomorrow = datetime.now(UTC) + timedelta(days=1)
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "bio": self.bio,
            "avatar": self.avatar,
            "soul_status": self.soul_status,
            "is_superuser": self.is_superuser,
            "exp": tomorrow
        }