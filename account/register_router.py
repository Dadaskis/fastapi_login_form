from fastapi import APIRouter, Response
from .register_form import RegisterForm
from .register_response import RegisterResponse
from .account_manager import account_manager

router = APIRouter()

@router.post("/register_user", response_model=RegisterResponse)
async def register_user(response: Response, form: RegisterForm):
    if await account_manager.does_user_exist_with_email(form.email):
        return RegisterResponse(
            success=False,
            message="email already exists"
        )

    if await account_manager.does_user_exist_with_username(form.username):
        return RegisterResponse(
            success=False,
            message="email already exists"
        )

    user = await account_manager.register_user(
        form.username, form.email, form.password, form.username
    )

    if user:
        return RegisterResponse(
            success=True,
            message="user registered successfully"
        )

    return RegisterResponse(
        success=False,
        message="user registration failed due to mercury retrograde"
    )