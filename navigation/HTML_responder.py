from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from authorization.JWT_token import JWT_token_dispenser
import os

BASE_DIR = Path(__file__).resolve().parent.parent

templates = Jinja2Templates(directory=Path(BASE_DIR, "static"))

router = APIRouter()

static_dir = Path(BASE_DIR, "static")

html_files = [f for f in os.listdir(static_dir) if f.endswith(".html")]

def create_route_handler(template_name: str):
    """Factory function that returns a handler for a specific template"""
    async def handler(request: Request):
        return templates.TemplateResponse(
            request=request,
            name=template_name
        )
    return handler

def create_protected_route_handler(template_name: str):
    """Factory function that returns a protected handler for a specific template"""
    async def handler(request: Request):
        token = request.cookies.get("token")
    
        if not token:
            print("No token!!!")
            return RedirectResponse(url="/login")
        
        try:
            user_dict = JWT_token_dispenser.get_token_payload(token)
            print(user_dict)
            user_id = user_dict.get("id", None)
            if user_id == None:
                return RedirectResponse(url="/login")

            return templates.TemplateResponse(
                request=request,
                name=template_name
            )
        except:
            return RedirectResponse(url="/login")
    return handler

protected_pages = [
    "dashboard"
]

# Dynamically create routes
for html_file in html_files:
    route_name = html_file.replace(".html", "")
    # Skip index.html (handle at root)
    if route_name == "index":
        router.get("/")(create_route_handler(html_file))
    else:
        if route_name in protected_pages:
            router.get(f"/{route_name}")(create_protected_route_handler(html_file))
        else:
            router.get(f"/{route_name}")(create_route_handler(html_file))