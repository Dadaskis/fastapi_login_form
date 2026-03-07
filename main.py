from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from navigation import HTML_responder
from account.account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser
from email_verification.email_sender import email_sender

from account import register_router
from account import login_router
from account import account_data_router
from account import profile_update_router
from account import change_password_router

async def app_startup():
    print("Backend start up!")
    email_sender.initialize()
    await account_manager.initialize()
    JWT_token_dispenser.initialize()

async def app_shutdown():
    print("Backend shutting down!")
    email_sender.close()

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
app.include_router(account_data_router.router, prefix="/api") 
app.include_router(profile_update_router.router, prefix="/api") 
app.include_router(change_password_router.router, prefix="/api")