import bcrypt
from fastapi import APIRouter, Response
from .login_form import LoginForm
from .login_response import LoginResponse
from .account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.post("/login_user", response_model=LoginResponse)
async def login_user(response: Response, form: LoginForm):
    user = await account_manager.authenticate_user(form.email, form.password)
    
    if user == None:
        return LoginResponse(
            success=False,
            message="invalid",
            token=""
        )

    token = JWT_token_dispenser.make_token(user.get_payload())

    response.set_cookie(
        "token",
        token,
        httponly=True,
        secure=True,
        samesite="lax"
    )

    return LoginResponse(
        success=True,
        message="you are logged in, surprisingly",
        token=token
    )

