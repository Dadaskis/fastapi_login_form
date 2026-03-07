import bcrypt
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from .change_password_response import ChangePasswordResponse
from .change_password_form import ChangePasswordForm
from .account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.put("/change_password", response_model=ChangePasswordResponse)
async def change_password(request: Request, form: ChangePasswordForm):
    token = request.cookies.get("token")

    if not token:
        return RedirectResponse(url="/login")
    
    try:
        user_id = JWT_token_dispenser.get_user_id_from_token(token)
        if user_id == None:
            return RedirectResponse(url="/login")
        
        user = await account_manager.get_user_by_id(user_id)
        if not user:
            return RedirectResponse(url="/register")
        
        check_result = bcrypt.checkpw(
            form.current_password.encode(), 
            user.hashed_password.encode()
        )
        
        if not check_result:
            return ChangePasswordResponse(success=False, message="wrong current password")
        
        hashed_password = bcrypt.hashpw(form.new_password.encode(), bcrypt.gensalt())
        user.hashed_password = hashed_password.decode()

        result = await account_manager.update_user_in_database(user)
        return ChangePasswordResponse(success=result, message="success")
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(url="/login")

