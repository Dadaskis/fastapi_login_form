from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from pathlib import Path
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

# Dynamically create routes
for html_file in html_files:
    route_name = html_file.replace(".html", "")
    # Skip index.html (handle at root)
    if route_name == "index":
        router.get("/")(create_route_handler(html_file))
    else:
        router.get(f"/{route_name}")(create_route_handler(html_file))