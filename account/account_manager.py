import sys
import bcrypt
import json
from datetime import datetime, UTC
from pathlib import Path
from typing import Optional
from .user import User

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

from psql_database import DatabaseManager
from psql_database.config import DB_CONFIG

class AccountManager:
    def __init__(self):
        """Initialize AccountManager with database connection."""
        self.db = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize database connection (call this at startup)."""
        self.db = DatabaseManager(DB_CONFIG)
        await self.db.connect()
        self.initialized = True
        print("✅ AccountManager initialized. Kevin is watching.")
    
    async def process_user_obj_from_query(self, result) -> Optional[User]:
        """
        Just a function to keep the repetitive mess off get_user_by_id,
        get_user_by_email and get_user_by_username.

        Args:
            result: SQL query result
        
        Returns:
            A User object. Maybe. Just maybe.
        """
        if result:
            # Convert asyncpg record to dict and create User object
            user_data = dict(result)

            if isinstance(user_data.get('kevin_notes'), str):
                user_data['kevin_notes'] = json.loads(user_data['kevin_notes'])

            user = User(**user_data)
            
            print(f"✅ Found user: {user.username}")
            print(f"   Soul status: {user.soul_status}")
            print(f"   Unicorn sightings: {user.unicorn_sightings}")
            
            return user
        else:
            print(f"❌ User has not been found. Kevin is sad.")
            return None

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Retrieve a user by their ID and return as User object.
        
        Args:
            user_id: The user's ID number
            
        Returns:
            User: User object if found, None if not found
        """
        if not self.initialized:
            raise RuntimeError("AccountManager not initialized. Call initialize() first.")
        
        query = "SELECT * FROM users WHERE id = $1"
        result = await self.db.execute_query(query, user_id)
        return await self.process_user_obj_from_query(result)
    
    async def get_user_by_email(self, user_email: str) -> Optional[User]:
        """
        Retrieve a user by their email and return as User object.
        
        Args:
            user_email: The user's email
            
        Returns:
            User: User object if found, None if not found
        """
        if not self.initialized:
            raise RuntimeError("AccountManager not initialized. Call initialize() first.")
        
        query = "SELECT * FROM users WHERE email = $1"
        result = await self.db.execute_query(query, user_email)
        return await self.process_user_obj_from_query(result)

    async def get_user_by_username(self, user_name: str) -> Optional[User]:
        """
        Retrieve a user by their username and return as User object.
        
        Args:
            user_name: The user's username
            
        Returns:
            User: User object if found, None if not found
        """
        if not self.initialized:
            raise RuntimeError("AccountManager not initialized. Call initialize() first.")
        
        query = "SELECT * FROM users WHERE username = $1"
        result = await self.db.execute_query(query, user_name)
        return await self.process_user_obj_from_query(result)

    async def register_user(self, username: str, email: str, password: str, full_name: Optional[str] = None) -> Optional[User]:
        """
        Registers a user. Requires username, email, password...
        ... honestly I'm scared to imagine what I'll have to do for the sake of OAuth2 here.
        Letter to the future me: I assume you won't have to edit this function to add a possibility
        to login with Google or GitHub.

        Args:
            username: User's name
            email: User's email (Kevin surely won't use it for spamming, right?)
            password: User's unencrypted password
            fill_name: User's full name if one even exists lol
        
        Returns:
            A user corporate-signed object...
            ... Except for the days with Mercury retrograde, then we are returning None.
        """
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()) # Bath salts make it safer...
        query = """
            INSERT INTO users (username, email, hashed_password, full_name, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        """
        now = datetime.now()
        query_result = await self.db.execute_query(query, username, email, hashed_password.decode(), full_name, now, now)
        if query_result:
            user_id = query_result['id']
            return await self.get_user_by_id(user_id)
        
        return None

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user by email and password.
        
        Args:
            email: User's email :)
            password: Unencrypted password :)

        Returns:
            A corporate-grade user object...
            ... except for the Kevin's day offs.
        """
        user = await self.get_user_by_email(email)
        
        if not user:
            print(f"❌ User {user} not found")
            return None
        
        # Verify password
        if bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
            # Update last login
            await self.update_last_login(user.id)
            print(f"✅ User {user.username} authenticated successfully")
            return user
        
        print(f"❌ Invalid password for {user}")
        return None

    async def update_last_login(self, user_id: int) -> bool:
        """
        Update user's last login time.
        
        Args:
            user_id: Well, user's ID.
        
        Returns:
            A boolean - Was it actually updated?
        """
        query = "UPDATE users SET last_login = $1 WHERE id = $2"
        now = datetime.now()
        result = await self.db.execute(query, now, user_id)
        return "UPDATE 1" in result
    
    async def does_user_exist_with_username(self, username: str) -> bool:
        """
        Check if user with that username already exists.
        
        Args:
            username: User's designated username
        
        Returns:
            A boolean - Does the user exist in our supercomputer database?
        """
        query = "SELECT EXISTS(SELECT * FROM users WHERE username = $1)"
        result = await self.db.execute_query(query, username)
        return result['exists'] if result else False
    
    async def does_user_exist_with_email(self, user_email: str) -> bool:
        """
        Check if user with that email already exists.
        
        Args:
            user_email: User's email
        
        Returns:
            A boolean - Does the user exist in our supercomputer database?
        """
        query = "SELECT EXISTS(SELECT * FROM users WHERE email = $1)"
        result = await self.db.execute_query(query, user_email)
        return result['exists'] if result else False

    async def update_user_in_database(self, user: User) -> bool:
        """
        Update ALL user fields in database.
        So lazy it updates everything automatically.
        """
        if not self.initialized:
            raise RuntimeError("AccountManager not initialized. Call initialize() first.")
        
        # Convert User object to dict, excluding None values
        user_data = user.model_dump(exclude_none=True)
        
        # Remove fields that shouldn't be updated directly
        forbidden_fields = ['id', 'created_at']  # Never update these
        for field in forbidden_fields:
            user_data.pop(field, None)
        
        if 'kevin_notes' in user_data and isinstance(user_data['kevin_notes'], dict):
            user_data['kevin_notes'] = json.dumps(user_data['kevin_notes'])
        
        # Ensure updated_at is current
        user_data['updated_at'] = datetime.now(UTC).replace(tzinfo=None)
        
        # Build dynamic UPDATE query
        set_clause = ", ".join([f"{key} = ${i+2}" for i, key in enumerate(user_data.keys())])
        values = list(user_data.values())
        
        query = f"""
            UPDATE users 
            SET {set_clause}
            WHERE id = $1
            RETURNING id
        """
        
        # Execute with user.id as first parameter
        result = await self.db.execute_query(query, user.id, *values)
        
        if result:
            print(f"✅ User {user.id} updated successfully")
            print(f"   Kevin notes: {user.kevin_notes}")
            return True
        
        print(f"❌ Failed to update user {user.id}")
        return False

    async def close(self):
        """Close database connection."""
        if self.db:
            await self.db.close()
            print("👋 AccountManager closed. Kevin went home.")

# Create singleton instance
account_manager = AccountManager()