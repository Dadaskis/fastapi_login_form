from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

api = FastAPI()
api.mount("/frontend/", StaticFiles(directory=Path(BASE_DIR, "frontend")), name="frontend")

templates = Jinja2Templates(directory=Path(BASE_DIR, "frontend"))

@api.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )