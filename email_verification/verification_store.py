import random
import string
import json
from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any
from psql_database import DatabaseManager
from psql_database.config import DB_CONFIG
from utilities.rate_limiter import RateLimiter
from .verification_exceptions import \
        VerificationCodeRateLimitException, \
        VerificationCodeGenerationFailureException
from .email_sender import email_sender
from .verification_cleanup import VerificationCleanup

class VerificationStore:
    """
    Production-ready verification code storage using PostgreSQL.
    Scalable, persistent, and ready for horizontal scaling.
    """
    
    def __init__(self):
        self.db: Optional[DatabaseManager] = None
        self.initialized = False
        self.rate_limiter = RateLimiter()
        self.cleanup = VerificationCleanup()
    
    async def initialize(self):
        """Initialize database connection and ensure table exists."""
        self.db = DatabaseManager(DB_CONFIG)
        await self.db.connect()

        await self.rate_limiter.initialize()

        await self.cleanup.start(60, self.cleanup_expired)
        
        # Create verification_codes table if it doesn't exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS verification_codes (
            email VARCHAR(255) PRIMARY KEY,
            code VARCHAR(6) NOT NULL,
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            metadata JSONB DEFAULT '{}'
        );
        CREATE INDEX IF NOT EXISTS idx_expires_at ON verification_codes(expires_at);
        CREATE INDEX IF NOT EXISTS idx_code ON verification_codes(code);
        CREATE INDEX IF NOT EXISTS idx_email_code ON verification_codes(email, code);
        """
        
        await self.db.execute(create_table_sql)
        
        # Create cleanup function (runs every hour)
        cleanup_function_sql = """
        CREATE OR REPLACE FUNCTION cleanup_expired_codes()
        RETURNS void AS $$
        BEGIN
            DELETE FROM verification_codes WHERE expires_at < NOW();
        END;
        $$ LANGUAGE plpgsql;
        """
        
        await self.db.execute(cleanup_function_sql)
        
        self.initialized = True
        print("✅ VerificationStore initialized (production mode)")
        print("   Kevin is now tracking verification attempts")
    
    async def generate_code(self, email: str, ttl_minutes: int = 15, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a 6-digit verification code and store in database.
        
        Args:
            email: User's email address
            ttl_minutes: Time-to-live in minutes
            metadata: Additional data to store (e.g., purpose, IP, user agent)
        
        Returns:
            6-digit verification code
        """
        if not self.initialized:
            raise RuntimeError("VerificationStore not initialized. Call initialize() first.")
        
        if await self.rate_limiter.is_limited(f"email:generation:{email}", 3, 60 * 60):
            raise VerificationCodeRateLimitException("Code generation rate limit reached.")

        # Generate 6-digit code
        code = ''.join(random.choices(string.digits, k=6))
        
        # Calculate expiration
        expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(minutes=ttl_minutes)
        
        # Prepare metadata
        metadata_json = json.dumps(metadata or {})
        
        # Upsert: replace any existing code for this email
        query = """
        INSERT INTO verification_codes (email, code, expires_at, metadata)
        VALUES ($1, $2, $3, $4::jsonb)
        ON CONFLICT (email) 
        DO UPDATE SET 
            code = EXCLUDED.code,
            attempts = 0,
            expires_at = EXCLUDED.expires_at,
            metadata = EXCLUDED.metadata
        RETURNING code;
        """
        
        result = await self.db.execute_query(query, email, code, expires_at, metadata_json)
        
        if result:
            print(f"✅ Verification code generated for {email}")
            print(f"   Expires at: {expires_at}")
            print(f"   Kevin has logged this request")
            print(f"   Email sent.")
            email_sender.send_email(email, "FastAPI Confirmation Code~", f"Your confirmation code: {code}")
            return code
        
        raise VerificationCodeGenerationFailureException(f"Failed to generate verification code for {email}")
    
    async def verify_code(self, email: str, code: str, max_attempts: int = 5) -> bool:
        """
        Verify a code for a given email.
        
        Args:
            email: User's email address
            code: 6-digit code to verify
            max_attempts: Maximum number of failed attempts before lockout
        
        Returns:
            True if code is valid and not expired, False otherwise
        """
        if not self.initialized:
            raise RuntimeError("VerificationStore not initialized. Call initialize() first.")
        
        if await self.rate_limiter.is_limited(f"email:verification:{email}", 10, 60 * 15):
            raise VerificationCodeRateLimitException("Code verification rate limit reached.")

        # Get current code from database
        query = """
        SELECT code, attempts, expires_at 
        FROM verification_codes 
        WHERE email = $1;
        """
        
        result = await self.db.execute_query(query, email)
        
        if not result:
            print(f"❌ No verification code found for {email}")
            return False
        
        stored_code = result['code']
        attempts = result['attempts']
        expires_at = result['expires_at']
        
        # Check expiration
        if datetime.now(UTC).replace(tzinfo=None) > expires_at:
            print(f"❌ Verification code expired for {email}")
            await self._cleanup_email(email)
            return False
        
        # Check attempts
        if attempts >= max_attempts:
            print(f"❌ Too many failed attempts for {email}")
            await self._cleanup_email(email)
            return False
        
        # Verify code
        if stored_code == code:
            # Success!
            print(f"✅ Verification successful for {email}")
            print(f"   Kevin approves this authentication")
            return True
        
        # Failed attempt - increment counter
        await self._increment_attempts(email)
        print(f"❌ Invalid verification code for {email} (attempt {attempts + 1}/{max_attempts})")
        return False
    
    async def _increment_attempts(self, email: str):
        """Increment failed attempts counter."""
        query = """
        UPDATE verification_codes 
        SET attempts = attempts + 1 
        WHERE email = $1;
        """
        await self.db.execute(query, email)
    
    async def cleanup_email(self, email: str):
        """Remove verification code for an email."""
        query = "DELETE FROM verification_codes WHERE email = $1;"
        await self.db.execute(query, email)
    
    async def cleanup_expired(self):
        """Manually trigger cleanup of expired codes."""
        query = "SELECT cleanup_expired_codes();"
        await self.db.execute(query)
        print("🧹 Expired verification codes cleaned up")
        print("   Kevin's spreadsheet is now tidier")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get statistics about verification codes."""
        query = """
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE expires_at < NOW()) as expired,
            COUNT(*) FILTER (WHERE attempts >= 5) as locked,
            AVG(attempts) as avg_attempts
        FROM verification_codes;
        """
        
        result = await self.db.execute_query(query)
        
        if result:
            return {
                "total_codes": result['total'],
                "expired_codes": result['expired'],
                "locked_codes": result['locked'],
                "average_attempts": float(result['avg_attempts']) if result['avg_attempts'] else 0
            }
        
        return {"error": "Failed to get stats"}
    
    async def close(self):
        """Close database connection."""
        if self.db:
            await self.db.close()
            print("👋 VerificationStore closed")
            print("   Kevin went home")

# Singleton instance
verification_store = VerificationStore()