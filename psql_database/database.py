"""Database manager for PostgreSQL interactions."""

import asyncpg
from typing import Optional, Any, List

class DatabaseManager:
    """Manages database connections and queries."""
    
    def __init__(self, config: dict):
        """
        Initialize database manager with configuration.
        
        Args:
            config: Database connection configuration dictionary
        """
        self.config = config
        self.connection = None
    
    async def connect(self):
        """Establish database connection."""
        try:
            self.connection = await asyncpg.connect(**self.config)
            print("✅ Connected to database successfully")
            print("   Kevin from accounting has logged this connection")
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            raise
    
    async def execute_query(self, query: str, *args) -> Optional[Any]:
        """
        Execute SQL query and return first row.
        
        Args:
            query: SQL query to execute
            *args: Query parameters
            
        Returns:
            First row as asyncpg Record, or None if no results
        """
        try:
            result = await self.connection.fetchrow(query, *args)
            return result
        except Exception as e:
            print(f"❌ Database query error: {e}")
            print(f"   Query: {query}")
            print(f"   Args: {args}")
            return None
    
    async def fetch_all(self, query: str, *args) -> List[asyncpg.Record]:
        """Fetch all rows from query."""
        try:
            return await self.connection.fetch(query, *args)
        except Exception as e:
            print(f"❌ Database fetch error: {e}")
            return []
    
    async def execute(self, query: str, *args) -> str:
        """Execute query (INSERT, UPDATE, DELETE) and return status."""
        try:
            result = await self.connection.execute(query, *args)
            return result
        except Exception as e:
            print(f"❌ Database execute error: {e}")
            return f"ERROR: {e}"
    
    async def fetch_value(self, query: str, *args) -> Any:
        """Fetch a single value from the first row first column."""
        try:
            return await self.connection.fetchval(query, *args)
        except Exception as e:
            print(f"❌ Database fetch_value error: {e}")
            return None
    
    async def close(self):
        """Close database connection."""
        if self.connection:
            await self.connection.close()
            self.connection = None
            print("👋 Database connection closed")
            print("   Kevin went home")