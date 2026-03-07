from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class AccountDataResponse(BaseModel):
    # Required fields
    id: int
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    
    # Optional fields
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    avatar: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    
    # Status fields
    is_active: bool = True
    is_superuser: bool = False
    soul_status: str = "pending"  # pending, transferred, questioned
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        from_attributes=True
    )