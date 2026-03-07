"""Script to create users table in PostgreSQL database."""

import asyncio
import sys
from psql_database import DatabaseManager
from psql_database.config import DB_CONFIG

async def create_users_table():
    """Create users table if it doesn't exist."""
    
    # Initialize database manager
    db = DatabaseManager(DB_CONFIG)
    
    try:
        # Connect to database
        await db.connect()
        print("✅ Connected to database")
        
        # SQL to create users table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            bio TEXT,
            location VARCHAR(255),
            company VARCHAR(255),
            avatar VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            is_superuser BOOLEAN DEFAULT FALSE,
            soul_status VARCHAR(50) DEFAULT 'pending',
            kevin_notes JSONB DEFAULT '{}',
            unicorn_sightings INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            last_logout TIMESTAMP
        );
        """
        
        # Execute table creation
        result = await db.execute_query(create_table_sql)
        print("✅ Users table created or already exists")
        print(f"   Result: {result}")
        
        # Create index on username for faster lookups
        await db.execute_query(
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);"
        )
        print("✅ Created index on username")
        
        # Create index on email for faster lookups
        await db.execute_query(
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"
        )
        print("✅ Created index on email")
        
        # Verify table exists by counting rows
        count = await db.execute_query("SELECT COUNT(*) FROM users;")
        print(f"✅ Current users in table: {count[0] if count else 0}")
        
        print("\n🎉 Database setup complete!")
        print("   Kevin from accounting has been notified of the new table")
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        print("   Kevin is very disappointed")
        sys.exit(1)
    finally:
        # Always close the connection
        await db.close()

if __name__ == "__main__":
    print("🔧 Database Setup Script")
    print("========================")
    asyncio.run(create_users_table())