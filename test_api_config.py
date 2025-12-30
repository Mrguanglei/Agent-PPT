#!/usr/bin/env python3
"""
测试API端点配置
运行方式: python test_api_config.py
"""

import os
import sys
from pathlib import Path

# 添加backend目录到Python路径
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

try:
    from app.config import settings
    from app.agent.core import PPTAgent
    print("✅ 导入成功")
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    sys.exit(1)

def test_config():
    """测试配置加载"""
    print("\n🔧 测试配置加载:")

    config_items = [
        ("OPENAI_API_KEY", settings.OPENAI_API_KEY, "API密钥"),
        ("OPENAI_BASE_URL", settings.OPENAI_BASE_URL, "API基础URL"),
        ("OPENAI_MODEL", settings.OPENAI_MODEL, "模型名称"),
        ("SERPAPI_KEY", settings.SERPAPI_KEY, "搜索API密钥"),
    ]

    for name, value, desc in config_items:
        status = "✅ 已设置" if value and value != "" and not value.startswith("your-") else "⚠️ 未设置"
        display_value = value[:20] + "..." if value and len(value) > 20 else value or "空"
        print(f"  {name}: {status} ({desc})")
        print(f"    值: {display_value}")

def test_agent_initialization():
    """测试Agent初始化"""
    print("\n🤖 测试Agent初始化:")

    try:
        # 检查API Key是否设置
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("your-"):
            print("  ⚠️ OPENAI_API_KEY 未正确设置，跳过实际API调用测试")
            return

        agent = PPTAgent()
        print("  ✅ Agent初始化成功")
        print(f"  📡 API端点: {agent.client.base_url}")
        print(f"  🧠 使用模型: {agent.model}")
        print(f"  🔧 注册工具数量: {len(agent.tools)}")

        # 测试工具列表
        tool_names = [tool["function"]["name"] for tool in agent.tools]
        print(f"  🛠️ 可用工具: {', '.join(tool_names)}")

    except Exception as e:
        print(f"  ❌ Agent初始化失败: {e}")
        return False

    return True

def show_supported_endpoints():
    """显示支持的API端点"""
    print("\n🌐 支持的API端点示例:")
    endpoints = [
        ("OpenAI (官方)", "https://api.openai.com/v1", "gpt-4-turbo-preview"),
        ("DeepSeek", "https://api.deepseek.com/v1", "deepseek-chat"),
        ("Moonshot AI", "https://api.moonshot.cn/v1", "moonshot-v1-8k"),
        ("智谱AI", "https://open.bigmodel.cn/api/paas/v4", "glm-4"),
        ("本地服务", "http://localhost:8000/v1", "local-model"),
    ]

    for name, url, model in endpoints:
        print(f"  {name}: {url} (模型: {model})")

def main():
    """主函数"""
    print("🚀 PPT Agent API配置测试")
    print("=" * 50)

    # 测试配置
    test_config()

    # 测试Agent初始化
    agent_ok = test_agent_initialization()

    # 显示支持的端点
    show_supported_endpoints()

    print("\n" + "=" * 50)
    if agent_ok:
        print("🎉 配置测试完成！所有检查通过。")
    else:
        print("⚠️ 配置测试完成，但存在一些问题。")
        print("请检查环境变量设置和网络连接。")

    print("\n📖 更多信息请参考:")
    print("  - API_ENDPOINTS.md (API端点配置指南)")
    print("  - DOCKER_SETUP.md (Docker环境配置)")
    print("  - DEPLOYMENT.md (生产部署指南)")

if __name__ == "__main__":
    main()
