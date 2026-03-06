from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

api = FastAPI()
api.mount("/static/", StaticFiles(directory=Path(BASE_DIR, "static")), name="static")

templates = Jinja2Templates(directory=Path(BASE_DIR, "static"))

@api.get("/{page_name:path}", response_class=HTMLResponse)
async def home_page(request: Request, page_name: str):
    if page_name == "":
        page_name = "index"
    return templates.TemplateResponse(
        request=request,
        name=page_name + ".html"
    ) 