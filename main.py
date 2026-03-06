from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from account import register_router
from account import login_router
from navigation import HTML_responder
from account.account_manager import account_manager
from account.JWT_token import JWT_token_dispenser

async def app_startup():
    print("Backend start up!")
    await account_manager.initialize()
    JWT_token_dispenser.initialize()

async def app_shutdown():
    print("Backend shutting down!")

@asynccontextmanager
async def app_lifespan(api: FastAPI):
    await app_startup()
    yield
    await app_shutdown()

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(lifespan=app_lifespan)
app.mount("/static/", StaticFiles(directory=Path(BASE_DIR, "static")), name="static")
app.include_router(HTML_responder.router)
app.include_router(register_router.router, prefix="/api")
app.include_router(login_router.router, prefix="/api") 