from pydantic import BaseModel

class ResetPasswordConfirmationForm(BaseModel):
    email: str
    code: str