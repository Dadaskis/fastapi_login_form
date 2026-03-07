import bcrypt
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from .reset_password_form import ResetPasswordForm
from .reset_password_response import ResetPasswordResponse
from .account_manager import account_manager
from email_verification.verification_store import verification_store
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.post("/reset_password", response_model=ResetPasswordResponse)
async def reset_password(request: Request, response: Response, form: ResetPasswordForm):
    token = request.cookies.get("token_pass_reset")

    if not token:
        return RedirectResponse(url="/login")
    
    payload = JWT_token_dispenser.get_token_payload(token)
    
    email = payload.get("email")
    if email == None:
        return RedirectResponse(url="/login")
    
    code = payload.get("code")
    if code == None:
        return RedirectResponse(url="/login")

    if await verification_store.verify_code(email, code):
        response.set_cookie("token_pass_reset", None)

        user = await account_manager.get_user_by_email(email)

        hashed_password = bcrypt.hashpw(form.password.encode(), bcrypt.gensalt())
        user.hashed_password = hashed_password.decode()

        result = await account_manager.update_user_in_database(user)

        await verification_store.cleanup_email(email)

        return ResetPasswordResponse(
            success=result,
            message="nice try, right code"
        )
    else:
        return RedirectResponse(url="/login")