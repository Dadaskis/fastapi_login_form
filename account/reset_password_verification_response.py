from pydantic import BaseModel

class ResetPasswordVerificationResponse(BaseModel):
    success: bool
    message: str