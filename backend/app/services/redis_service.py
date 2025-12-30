import redis.asyncio as redis
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class RedisPubSubService:
    """Redis发布订阅服务"""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.Redis.pubsub] = None

    async def connect(self):
        """连接到Redis"""
        try:
            self.redis_client = redis.Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True
            )
            self.pubsub = self.redis_client.pubsub()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """断开Redis连接"""
        if self.pubsub:
            await self.pubsub.aclose()
        if self.redis_client:
            await self.redis_client.aclose()

    async def publish_message(self, channel: str, message: Dict[str, Any]):
        """发布消息到指定频道"""
        if not self.redis_client:
            await self.connect()

        try:
            message_json = json.dumps(message)
            await self.redis_client.publish(channel, message_json)
            logger.debug(f"Published message to channel {channel}: {message}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise

    async def subscribe_channel(self, channel: str):
        """订阅频道"""
        if not self.pubsub:
            await self.connect()

        try:
            await self.pubsub.subscribe(channel)
            logger.info(f"Subscribed to channel: {channel}")
        except Exception as e:
            logger.error(f"Failed to subscribe to channel {channel}: {e}")
            raise

    async def unsubscribe_channel(self, channel: str):
        """取消订阅频道"""
        if self.pubsub:
            try:
                await self.pubsub.unsubscribe(channel)
                logger.info(f"Unsubscribed from channel: {channel}")
            except Exception as e:
                logger.error(f"Failed to unsubscribe from channel {channel}: {e}")

    async def listen_messages(self, channel: str):
        """监听频道消息"""
        if not self.pubsub:
            await self.connect()

        # 确保已订阅
        await self.subscribe_channel(channel)

        try:
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        yield data
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse message data: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error listening to messages: {e}")
            raise


# 全局实例
redis_service = RedisPubSubService()
