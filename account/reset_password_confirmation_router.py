from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, Response
from .reset_password_confirmation_form import ResetPasswordConfirmationForm
from .reset_password_confirmation_response import ResetPasswordConfirmationResponse
from .account_manager import account_manager
from email_verification.verification_store import verification_store
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.post("/reset_password_confirmation", response_model=ResetPasswordConfirmationResponse)
async def reset_password_confirmation(response: Response, form: ResetPasswordConfirmationForm):
    if not await account_manager.does_user_exist_with_email(form.email):
        return ResetPasswordConfirmationResponse(
            success=False,
            message="email does not exist"
        )

    if await verification_store.verify_code(form.email, form.code):
        token = JWT_token_dispenser.make_token({
            "email" : form.email,
            "code" : form.code,
            "exp": datetime.now(UTC) + timedelta(minutes=15)
        })
        response.set_cookie(
            "token_pass_reset",
            token,
            httponly=True,
            secure=True,
            samesite="strict"
        )
        return ResetPasswordConfirmationResponse(
            success=True,
            message="nice try, right code"
        )
    else:
        return ResetPasswordConfirmationResponse(
            success=False,
            message="nice try, wrong code"
        )