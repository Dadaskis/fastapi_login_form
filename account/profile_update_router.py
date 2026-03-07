from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from .profile_update_response import ProfileUpdateResponse
from .profile_update_form import ProfileUpdateForm
from .account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.put("/profile_update", response_model=ProfileUpdateResponse)
async def profile_update(request: Request, form: ProfileUpdateForm):
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
        
        user.bio = form.bio
        user.company = form.company
        user.email = form.email
        user.full_name = form.full_name
        user.location = form.location
        user.username = form.username

        result = await account_manager.update_user_in_database(user)
        return ProfileUpdateResponse(success=result)
    except:
        return RedirectResponse(url="/login")

