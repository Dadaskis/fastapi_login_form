import json
import os

class SMTPConfig:
    sender: str
    password: str
    server_URL: str
    server_port: int

    def __init__(self):
        self.sender = ""
        self.password = ""
        self.server_URL = ""
        self.server_port = 0

    def save_to_json(self, file_name = "SMTP_config.json"):
        dict = {
            "sender": self.sender,
            "password": self.password,
            "server_URL": self.server_URL,
            "server_port": self.server_port
        }
        json_str = json.dumps(dict, indent=4)
        with open(file_name, "w", encoding="utf-8") as file:
            file.write(json_str)
    
    def load_from_json(self, file_name = "SMTP_config.json") -> bool:
        if not os.path.exists(file_name):
            self.save_to_json(file_name)
            return False
        
        with open(file_name, "r", encoding="utf-8") as file:
            json_str = file.read()
            dict = json.loads(json_str)
            self.sender = dict.get("sender", "")
            self.password = dict.get("password", "")
            self.server_URL = dict.get("server_URL", "")
            self.server_port = dict.get("server_port", "")
        
        return True