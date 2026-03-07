from fastapi import APIRouter, Response
from .reset_password_verification_form import ResetPasswordVerificationForm
from .reset_password_verification_response import ResetPasswordVerificationResponse
from .account_manager import account_manager
from email_verification.verification_store import verification_store

router = APIRouter()

@router.post("/reset_password_verification", response_model=ResetPasswordVerificationResponse)
async def reset_password_verification(response: Response, form: ResetPasswordVerificationForm):
    if not await account_manager.does_user_exist_with_email(form.email):
        return ResetPasswordVerificationResponse(
            success=False,
            message="email does not exist"
        )

    await verification_store.generate_code(form.email)

    return ResetPasswordVerificationResponse(
        success=True,
        message="success, check your email"
    )