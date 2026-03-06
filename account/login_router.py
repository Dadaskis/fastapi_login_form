from fastapi import APIRouter, Request
from .login_form import LoginForm
from .login_response import LoginResponse
from .account_manager import account_manager

router = APIRouter()

@router.post("/login_user", response_model=LoginResponse)
async def login_user(request: Request, form: LoginForm):
    pass