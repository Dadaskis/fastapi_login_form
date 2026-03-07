from pydantic import BaseModel

class ResetPasswordConfirmationResponse(BaseModel):
    success: bool
    message: str