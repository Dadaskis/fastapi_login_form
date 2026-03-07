from pydantic import BaseModel

class ChangePasswordResponse(BaseModel):
    success: bool
    message: str