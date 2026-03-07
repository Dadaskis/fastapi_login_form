import smtplib
from email.message import EmailMessage
from .SMTP_config import SMTPConfig

class EmailSender:
    SMTP_config: SMTPConfig
    server: smtplib.SMTP

    def print_warning(self):
        print("=" * 70)
        print("WARNING")
        print("Your SMTP is NOT configured. EmailSender cannot send any emails.")
        print("Please, configure your SMTP config at '/SMTP_config.json'")
        print("Server shutting down.")
        print("=" * 70)
        print("Press Enter to painfully die.")
        input()
        quit(0)

    def initialize(self):
        self.SMTP_config = SMTPConfig()
        status = self.SMTP_config.load_from_json()
        if not status:
            self.print_warning()

        if self.SMTP_config.server_URL == "":
            self.print_warning()
        
        print("Email Sender: Performing a server connection...")
        try:
            self.server = smtplib.SMTP(
                self.SMTP_config.server_URL, 
                self.SMTP_config.server_port
            )
            self.server.starttls()
            self.server.login(
                self.SMTP_config.sender,
                self.SMTP_config.password
            )
            print("Email Sender: Successful server connection!")
        except Exception as e:
            print(f"Email Sender Failed: {e}")
            self.print_warning()
        
        print("Email sender is up!")

    def send_email(self, recipient, subject, body) -> bool:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = self.SMTP_config.sender
        msg['To'] = recipient

        try:
            self.server.send_message(msg)
            return True
        except Exception as e:
            print(f"Email Sender Failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def close(self):
        self.server.close()

email_sender = EmailSender()