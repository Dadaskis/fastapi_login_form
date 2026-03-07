from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from account.account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser
from email_verification.email_sender import email_sender
from email_verification.verification_store import verification_store

from navigation import HTML_responder
from account import register_router
from account import login_router
from account import account_data_router
from account import profile_update_router
from account import change_password_router
from account import reset_password_verification_router
from account import reset_password_confirmation_router
from account import reset_password_router

async def app_startup():
    print("Backend start up!")
    email_sender.initialize()
    await account_manager.initialize()
    JWT_token_dispenser.initialize()
    await verification_store.initialize()

async def app_shutdown():
    print("Backend shutting down!")
    email_sender.close()
    await account_manager.close()
    await verification_store.close()

@asynccontextmanager
async def app_lifespan(api: FastAPI):
    await app_startup()
    yield
    await app_shutdown()

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(lifespan=app_lifespan)
app.mount("/static/", StaticFiles(directory=Path(BASE_DIR, "static")), name="static")
app.include_router(HTML_responder.router)

api_routers = [
    register_router.router,
    login_router.router,
    account_data_router.router,
    profile_update_router.router,
    change_password_router.router,
    reset_password_verification_router.router,
    reset_password_confirmation_router.router,
    reset_password_router.router
]
for api_router in api_routers:
    app.include_router(api_router, prefix="/api")