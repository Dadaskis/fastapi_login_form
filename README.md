# FastAPI Login System

A comprehensive, production-ready authentication system built with FastAPI, featuring email/password registration, OAuth2 (Google/GitHub), password recovery, and a cyberpunk-themed dashboard.

## Features

- **User Registration & Login** - Email/password authentication with bcrypt hashing
- **OAuth2 Integration** - Sign in with Google or GitHub
- **Password Recovery** - Email-based verification with 6-digit codes
- **Profile Management** - Update user profiles, change passwords
- **JWT Authentication** - Secure token-based authentication
- **PostgreSQL Database** - Persistent user storage
- **Redis Rate Limiting** - Protection against brute force attacks
- **Email Verification** - SMTP-based email sending for password resets
- **Responsive Frontend** - Cyberpunk-styled HTML/CSS/JS interface

## Tech Stack

- **Backend**: FastAPI, asyncpg, JWT, bcrypt
- **Database**: PostgreSQL
- **Cache**: Redis
- **Email**: SMTP (Gmail)
- **OAuth**: Google, GitHub
- **Frontend**: HTML, CSS, JavaScript (Jinja2 templates)

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL
- Redis
- SMTP server (Gmail recommended)
- Google OAuth credentials
- GitHub OAuth credentials

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fastapi_login_form.git
cd fastapi_login_form
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL:
   - Create a database named `fastapi_login_form`
   - Update `psql_database/config.py` with your credentials:
   ```python
   DB_CONFIG = {
       "host": "localhost",
       "database": "fastapi_login_form",
       "user": "postgres",
       "password": "your_password"
   }
   ```

5. Run the database setup:
```bash
python _setup_DB.py
```

6. Configure JWT secret:
   - Create a file `JWT_secret.txt` in the root directory
   - Add a random string (any text will work)

## Configuration

### Email SMTP Configuration

This application uses Gmail's SMTP server for sending verification emails.

#### Getting Gmail SMTP Credentials:

1. **Enable 2-Factor Authentication** on your Google account (required for app passwords)

2. **Generate an App Password**:
   - Go to your [Google Account](https://myaccount.google.com/)
   - Navigate to **Security** → **2-Step Verification** → **App passwords**
   - Enter any name as the app name, click "Create"
   - Copy the 16-character password generated

3. **Configure SMTP_config.json**:
   ```json
   {
       "sender": "your.email@gmail.com",
       "password": "your-16-char-app-password",
       "server_URL": "smtp.gmail.com",
       "server_port": 587
   }
   ```

The file will be created automatically on first run. Edit it with your credentials.

### OAuth2 Configuration (Google & GitHub)

#### Getting Google OAuth2 Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one

3. Navigate to **APIs & Services** → **Credentials**

4. Click **Create Credentials** → **OAuth 2.0 Client IDs**

5. Configure the OAuth consent screen:
   - User Type: External
   - App name: Your app name
   - Support email: Your email
   - Developer contact: Your email

6. Add authorized redirect URIs:
   - `http://127.0.0.1:8000/auth/google`
   - (For production: `https://yourdomain.com/auth/google`)
   - `http://127.0.0.1:8000/login/google`
   - (For production: `https://yourdomain.com/login/google`)

7. Create the client and copy:
   - Client ID
   - Client Secret

#### Getting GitHub OAuth2 Credentials:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)

2. Click **New OAuth App**

3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: `http://127.0.0.1:8000/login/github` (or production URL)
   - Authorization callback URL: `http://127.0.0.1:8000/auth/github`

4. Register the application

5. Copy:
   - Client ID
   - Generate and copy Client Secret

#### Configure oauth2_config.json:

```json
{
    "google_client_id": "your-google-client-id.apps.googleusercontent.com",
    "google_client_secret": "your-google-client-secret",
    "github_client_id": "your-github-client-id",
    "github_client_secret": "your-github-client-secret",
    "our_url": "http://127.0.0.1:8000"
}
```

**Important**: Update `our_url` to match your deployment domain in production.

## Running the Application

1. Start Redis server:
```bash
redis-server
```
*On Windows I just installed Memurai and called it a day, keep it in mind.*

2. Start the FastAPI application:
```bash
fastapi dev main.py
```

3. Access the application:
   - Main page: `http://127.0.0.1:8000`
   - Login: `http://127.0.0.1:8000/login`
   - Register: `http://127.0.0.1:8000/register`
   - Dashboard (protected): `http://127.0.0.1:8000/dashboard`

## API Endpoints

All API endpoints are prefixed with `/api`:

- `POST /register_user` - Register new user
- `POST /login_user` - Login user
- `GET /account_data` - Get current user data
- `PUT /profile_update` - Update user profile
- `PUT /change_password` - Change password
- `POST /reset_password_verification` - Request password reset code
- `POST /reset_password_confirmation` - Verify reset code
- `POST /reset_password` - Reset password with verified code
- `GET /login/google` - Initiate Google OAuth
- `GET /login/github` - Initiate GitHub OAuth

## Project Structure

```
fastapi_login_form/
├── account/                 # User account management
│   ├── account_manager.py   # Database operations
│   ├── user.py             # User model
│   └── *_router.py         # API route handlers
├── authorization/           # JWT token management
├── email_verification/      # Email sending and verification codes
├── navigation/              # HTML page routing
├── psql_database/           # PostgreSQL connection
├── utilities/               # Rate limiter and helpers
├── static/                  # Frontend files (HTML, CSS, JS)
├── main.py                  # Application entry point
├── JWT_secret.txt           # JWT secret key
├── SMTP_config.json         # Email configuration
├── oauth2_config.json       # OAuth credentials
├── requirements.txt         # Python dependencies
└── _setup_DB.py            # Database initialization
```

## License

MIT License. *Happiness to everyone!*

## Acknowledgments

- Kevin from accounting for... whatever it is he does
- The FastAPI team for an excellent framework
- All contributors who stare into the void and code anyway