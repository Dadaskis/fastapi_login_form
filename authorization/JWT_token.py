import jwt
import os
from account.user import User
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class JWTTokenDispenser:
    def initialize(self):
        print("JWT token machine initialization...")

        self.secret_key = ""

        if os.path.exists(Path(BASE_DIR, "JWT_secret.txt")):
            with open(Path(BASE_DIR, "JWT_secret.txt"), "r", encoding="utf-8") as file:
                self.secret_key = file.read()
                self.secret_key = self.secret_key.strip()
            if self.secret_key == "":
                # There's no JWT secret available ...
                print("Failed to get a JWT secret key, put a secret into JWT_secret.txt")
                assert False
            print("JWT secret key acquired!")
        else:
            # There's no JWT secret available
            # Create a text file at the root folder and put your secret there...
            # please.
            print("Failed to get a JWT secret key, put a secret into JWT_secret.txt")
            with open(Path(BASE_DIR, "JWT_secret.txt"), "w", encoding="utf-8") as file:
                file.write(" ")
            assert False
    
    def make_token(self, user: User) -> str:
        payload = user.get_payload()
        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def get_user_id_from_token(self, token: str) -> int:
        try:
            dict = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return dict.get("id")
        except jwt.InvalidTokenError:
            return None  # Don't crash, just return None

JWT_token_dispenser = JWTTokenDispenser()