from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional

class ProfileUpdateForm(BaseModel):
    # Required fields
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    
    # Optional fields
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    company: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)

    model_config = ConfigDict(
        from_attributes=True
    )