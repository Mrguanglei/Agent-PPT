"""
Redis Client Utility
"""
import json
from typing import Optional, Any
import redis.asyncio as aioredis
from redis.asyncio.connection import ConnectionPool

from app.config import settings


class RedisClient:
    """Async Redis Client"""

    def __init__(self):
        self._pool: Optional[ConnectionPool] = None
        self._client: Optional[aioredis.Redis] = None

    async def connect(self):
        """Establish Redis connection"""
        if self._client is None:
            self._pool = ConnectionPool.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            self._client = aioredis.Redis(connection_pool=self._pool)

    async def disconnect(self):
        """Close Redis connection"""
        if self._client:
            await self._client.close()
            self._client = None
            self._pool = None

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis"""
        if not self._client:
            await self.connect()
        return await self._client.get(key)

    async def set(
        self,
        key: str,
        value: str,
        expire: Optional[int] = None,
    ) -> bool:
        """Set value in Redis"""
        if not self._client:
            await self.connect()
        return await self._client.set(key, value, ex=expire)

    async def delete(self, key: str) -> int:
        """Delete key from Redis"""
        if not self._client:
            await self.connect()
        return await self._client.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self._client:
            await self.connect()
        return await self._client.exists(key) > 0

    async def publish(self, channel: str, message: Any) -> int:
        """Publish message to channel"""
        if not self._client:
            await self.connect()
        if isinstance(message, dict):
            message = json.dumps(message)
        return await self._client.publish(channel, message)

    async def subscribe(self, channel: str):
        """Subscribe to channel"""
        if not self._client:
            await self.connect()
        pubsub = self._client.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

    async def incr(self, key: str) -> int:
        """Increment value"""
        if not self._client:
            await self.connect()
        return await self._client.incr(key)

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time"""
        if not self._client:
            await self.connect()
        return await self._client.expire(key, seconds)

    async def keys(self, pattern: str = "*") -> list:
        """Get keys matching pattern"""
        if not self._client:
            await self.connect()
        return await self._client.keys(pattern)

    async def json_get(self, key: str) -> Optional[dict]:
        """Get JSON value"""
        value = await self.get(key)
        if value:
            return json.loads(value)
        return None

    async def json_set(self, key: str, value: dict, expire: Optional[int] = None) -> bool:
        """Set JSON value"""
        return await self.set(key, json.dumps(value), expire)

    @property
    def client(self) -> aioredis.Redis:
        """Get raw Redis client"""
        if not self._client:
            raise RuntimeError("Redis client not initialized. Call connect() first.")
        return self._client


# Global redis client instance
redis_client = RedisClient()
