from pydantic import BaseModel

class LoginForm(BaseModel):
    username: str
    email: str
    password: str