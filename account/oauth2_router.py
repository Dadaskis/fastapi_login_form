from fastapi import APIRouter, Response, Request
from fastapi.responses import RedirectResponse
from fastapi_sso import GoogleSSO, GithubSSO
from .account_manager import account_manager
from authorization.JWT_token import JWT_token_dispenser
import os
import json

router = APIRouter()

file_name = "oauth2_config.json"
google_client_id = ""
google_client_secret = ""
github_client_id = ""
github_client_secret = ""
our_url = "" # Sudden communism here

if not os.path.exists(file_name):
    dict = {
        "google_client_id": "",
        "google_client_secret": "",
        "github_client_id": "",
        "github_client_secret": "",
        "our_url": ""
    }
    json_str = json.dumps(dict, indent=4)
    with open(file_name, "w", encoding="utf-8") as file:
        file.write(json_str)

with open(file_name, "r", encoding="utf-8") as file:
    json_str = file.read()
    dict = json.loads(json_str)
    google_client_id = dict.get("google_client_id", "")
    google_client_secret = dict.get("google_client_secret", "")
    github_client_id = dict.get("github_client_id", "")
    github_client_secret = dict.get("github_client_secret", "")
    our_url = dict.get("our_url", "")

def write_a_damn_warning():
    print("=" * 70)
    print("Hello there!")
    print("Seems like you forgot to configure 'oauth2_config.json'!")
    print("Please, consider to put all the needed Google and Github client IDs/secrets")
    print("Also don't forget to write our URL, even if it is localhost")
    print("Whenever you deploy just remember to change the URL to the production one")
    print("OH AND ALSO do not deploy during Mercury retrograde")
    print("=" * 70)
    print("Press Enter to die a horrible death")
    input()
    quit(0)

if google_client_id == "":
    write_a_damn_warning()

if google_client_secret == "":
    write_a_damn_warning()

if github_client_id == "":
    write_a_damn_warning()

if github_client_secret == "":
    write_a_damn_warning()

if our_url == "":
    write_a_damn_warning()

google_sso = GoogleSSO(
    client_id = google_client_id,
    client_secret = google_client_secret,
    redirect_uri = our_url + "/auth/google"
)

github_sso = GithubSSO(
    client_id = github_client_id,
    client_secret = github_client_secret,
    redirect_uri = our_url + "/auth/github"
)

@router.get("/login/google")
async def login_google():
    return await google_sso.get_login_redirect()

@router.get("/login/github")
async def login_github():
    return await github_sso.get_login_redirect()

@router.get("/auth/google")
async def auth_google(request: Request, response: Response):
    async with google_sso:
        user = await google_sso.verify_and_process(request)
        
        db_user = await account_manager.get_user_by_email(user.email)
        if db_user == None:
            db_user = await account_manager.create_oauth_user(
                email=user.email,
                username=user.display_name or user.email.split("@")[0],
                provider="google"
            )
        
        token = JWT_token_dispenser.make_token(db_user.get_payload())
        
        redirect = RedirectResponse(url="/dashboard")
        redirect.set_cookie("token", token, httponly=True, secure=True, samesite="lax")
        return redirect

@router.get("/auth/github")
async def auth_github(request: Request, response: Response):
    async with github_sso:
        user = await github_sso.verify_and_process(request)
        
        db_user = await account_manager.get_user_by_email(user.email)
        if db_user == None:
            db_user = await account_manager.create_oauth_user(
                email=user.email,
                username=user.display_name or user.email.split("@")[0],
                provider="github"
            )
        
        token = JWT_token_dispenser.make_token(db_user.get_payload())

        redirect = RedirectResponse(url="/dashboard")
        redirect.set_cookie("token", token, httponly=True, secure=True, samesite="lax")
        return redirect