from redis import asyncio as aioredis
from datetime import datetime

class RateLimiter:
    def __init__(self, redis_url="redis://localhost"):
        self.redis = None
        self.redis_url = redis_url
    
    async def initialize(self):
        self.redis = await aioredis.from_url(self.redis_url)
        print("✅ Rate limiter connected to Redis")
    
    async def is_limited(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int,
        use_sorted_set: bool = False
    ) -> bool:
        """
        Generic rate limiter.
        
        Args:
            key: Unique identifier (e.g., "generate:1.2.3.4" or "email:user@test.com")
            max_requests: Maximum allowed requests in the window
            window_seconds: Time window in seconds
            use_sorted_set: Use sorted set for precise counting (slower but exact)
        
        Returns:
            True if limited, False otherwise
        """
        if use_sorted_set:
            return await self._is_limited_sorted_set(key, max_requests, window_seconds)
        else:
            return await self._is_limited_counter(key, max_requests, window_seconds)
    
    async def _is_limited_counter(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Simple counter-based rate limiting (faster, approximate)."""
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, window_seconds)
        
        return current > max_requests
    
    async def _is_limited_sorted_set(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Sorted set-based rate limiting (slower, exact window)."""
        now = datetime.now().timestamp()
        window_start = now - window_seconds
        
        # Add current request
        await self.redis.zadd(key, {f"{now}": now})
        
        # Remove old requests
        await self.redis.zremrangebyscore(key, 0, window_start)
        
        # Count requests in window
        count = await self.redis.zcard(key)
        
        # Set expiry on the key (cleanup)
        await self.redis.expire(key, window_seconds)
        
        return count > max_requests
    
    async def get_remaining(self, key: str, max_requests: int, window_seconds: int) -> int:
        """Get remaining requests for a key."""
        current = await self.redis.get(key)
        if not current:
            return max_requests
        return max(0, max_requests - int(current))
    
    async def reset(self, key: str):
        """Manually reset a rate limit key."""
        await self.redis.delete(key)