"""
异步任务定义
"""
from app.worker import celery_app
from app.agent.core import PPTAgent
from app.services.redis_service import redis_service
from app.services.agent_service import AgentService
from app.database import get_db
from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging
import asyncio

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def process_agent_message(self, conversation_id: str, message: str, user_id: str, project_id: str = None):
    """
    处理Agent消息的异步任务

    Args:
        conversation_id: 会话ID
        message: 用户消息
        user_id: 用户ID
        project_id: 项目ID（可选）

    Returns:
        dict: 处理结果
    """
    async def _process():
        try:
            logger.info(f"Processing agent message for conversation {conversation_id}")

            # 连接Redis
            await redis_service.connect()

            # 获取数据库连接
            async for db in get_db():
                try:
                    # 获取对话历史
                    conversation = await AgentService.get_conversation(
                        db,
                        UUID(conversation_id),
                        UUID(user_id)
                    )

                    if not conversation:
                        logger.error(f"Conversation {conversation_id} not found")
                        await redis_service.publish_message(
                            f"conversation:{conversation_id}",
                            {
                                "type": "error",
                                "data": {"message": "对话不存在"}
                            }
                        )
                        return

                    conversation_history = conversation.messages or []

                    # 创建Agent实例并处理消息流
                    agent = PPTAgent(redis_service, conversation_id)

                    # 处理消息流（消息会自动通过Redis发布）
                    updated_history = await agent.process_stream(
                        project_id,
                        message,
                        conversation_history,
                        conversation_id
                    )

                    # 更新对话历史
                    await AgentService.update_conversation_messages(
                        db,
                        UUID(conversation_id),
                        updated_history
                    )

                    logger.info(f"Successfully processed agent message for conversation {conversation_id}")
                    return {
                        "status": "success",
                        "conversation_id": conversation_id
                    }

                finally:
                    await db.close()
                    break

        except Exception as e:
            logger.error(f"Error processing agent message: {e}")
            try:
                await redis_service.publish_message(
                    f"conversation:{conversation_id}",
                    {
                        "type": "error",
                        "data": {"message": str(e)}
                    }
                )
            except:
                pass
            return {
                "status": "error",
                "conversation_id": conversation_id,
                "error": str(e)
            }
        finally:
            await redis_service.disconnect()

    # 运行异步任务
    return asyncio.run(_process())

@celery_app.task(bind=True)
def generate_ppt_content(self, project_id: str, user_id: str):
    """
    生成PPT内容的异步任务

    Args:
        project_id: 项目ID
        user_id: 用户ID

    Returns:
        dict: 生成结果
    """
    try:
        logger.info(f"Generating PPT content for project {project_id}")

        # 这里可以实现PPT生成逻辑
        # 目前先返回一个简单的响应
        return {
            "status": "success",
            "project_id": project_id,
            "message": "PPT content generation completed"
        }

    except Exception as e:
        logger.error(f"Error generating PPT content: {e}")
        return {
            "status": "error",
            "project_id": project_id,
            "error": str(e)
        }
