from pydantic import BaseModel

class ResetPasswordForm(BaseModel):
    password: str