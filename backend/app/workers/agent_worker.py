"""
Dramatiq Worker for Agent execution
"""
import dramatiq
import dramatiq.brokers.redis
import dramatiq.middleware
import json
import logging
from typing import Dict, Any

from app.config import settings
from app.agent.runner import AgentRunner
from app.utils.redis_client import redis_client
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Redis broker
redis_broker = dramatiq.brokers.redis.RedisBroker(
    url=settings.redis_url,
    middleware=[
        dramatiq.middleware.AgeLimit(max_age=86400000),  # 24 hours
        dramatiq.middleware.TimeLimit(time_limit=300000),  # 5 minutes
        dramatiq.middleware.Retries(max_retries=3),
        # Note: Prometheus middleware has compatibility issues, omitting for now
    ]
)

# Set broker
dramatiq.set_broker(redis_broker)


@dramatiq.actor
def process_agent_run(agent_run_id: str, chat_id: str, user_id: str, message: str, model: str) -> None:
    """
    Process an Agent run

    This worker:
    1. Initializes the AgentRunner
    2. Executes the conversation loop
    3. Publishes SSE events to Redis
    """
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from app.config import settings

    logger.info(f"Starting agent run: {agent_run_id}")

    async def run_agent():
        # Create a new engine for this task to avoid event loop conflicts
        engine = create_async_engine(
            settings.database_url,
            echo=False,
            future=True,
            pool_size=1,
            max_overflow=0,
        )

        # Create session maker
        async_session_maker = sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

        try:
            # Create and run agent with custom session maker
            runner = AgentRunner(agent_run_id, chat_id, user_id, session_maker=async_session_maker)
            await runner.run(message)

            logger.info(f"Completed agent run: {agent_run_id}")

        except Exception as e:
            logger.error(f"Agent run failed: {agent_run_id}, error: {str(e)}", exc_info=True)
            # Publish error event
            try:
                await redis_client.publish(
                    f"agent_run:{agent_run_id}",
                    {
                        "type": "error",
                        "payload": {"message": str(e)}
                    }
                )
            except Exception as pub_err:
                logger.error(f"Failed to publish error: {pub_err}")
        finally:
            # Clean up this task's database connections
            await engine.dispose()

    # Run async function in a new event loop
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_agent())
    finally:
        # Clean up
        try:
            loop.run_until_complete(loop.shutdown_asyncgens())
        except Exception:
            pass
        loop.close()
        # Reset to default loop
        asyncio.set_event_loop(None)


class RedisListener:
    """Listen to Redis for agent run requests"""

    def __init__(self):
        self.running = True

    async def listen(self):
        """Listen for agent run requests"""
        import asyncio

        logger.info("Starting Redis listener for agent runs")

        while self.running:
            try:
                pubsub = await redis_client.subscribe("agent_runs")

                while self.running:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message['type'] == 'message':
                        data = json.loads(message['data'])

                        # Extract parameters
                        agent_run_id = data.get("agent_run_id")
                        chat_id = data.get("chat_id")
                        user_id = data.get("user_id")
                        user_message = data.get("message")
                        model = data.get("model", settings.openai_model)

                        logger.info(f"Received agent run request: {agent_run_id}")

                        # Send to Dramatiq worker
                        process_agent_run.send(
                            agent_run_id=agent_run_id,
                            chat_id=chat_id,
                            user_id=user_id,
                            message=user_message,
                            model=model,
                        )

            except Exception as e:
                logger.error(f"Redis listener error: {str(e)}")
                await asyncio.sleep(5)  # Wait before reconnecting


def start_worker():
    """Start the Dramatiq worker"""

    # Start Redis listener in a thread
    import threading
    import asyncio

    def run_listener():
        listener = RedisListener()
        asyncio.run(listener.listen())

    listener_thread = threading.Thread(target=run_listener, daemon=True)
    listener_thread.start()

    # Start Dramatiq worker
    logger.info("Starting Dramatiq worker")

    worker = dramatiq.Worker(redis_broker)
    worker.start()

    # Keep the main thread alive
    import time
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Stopping worker...")
        worker.stop()


if __name__ == "__main__":
    start_worker()
