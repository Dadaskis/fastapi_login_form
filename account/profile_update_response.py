from pydantic import BaseModel

class ProfileUpdateResponse(BaseModel):
    success: bool