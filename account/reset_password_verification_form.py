from pydantic import BaseModel

class ResetPasswordVerificationForm(BaseModel):
    email: str