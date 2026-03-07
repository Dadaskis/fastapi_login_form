from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from .account_data_response import AccountDataResponse
from .account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser

router = APIRouter()

@router.get("/account_data", response_model=AccountDataResponse)
async def get_account_data(request: Request):
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
        
        response = AccountDataResponse.model_validate(user)
        return response
    except:
        return RedirectResponse(url="/login")

