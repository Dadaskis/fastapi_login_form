from pydantic import BaseModel

class ResetPasswordResponse(BaseModel):
    success: bool
    message: str