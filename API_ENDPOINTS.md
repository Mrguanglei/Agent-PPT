# API 端点配置指南

## 🔧 OpenAI 兼容接口配置

PPT Agent 支持使用各种兼容 OpenAI API 的服务，包括官方 OpenAI、DeepSeek、Moonshot AI 等。

### 配置参数

```bash
# 必需参数
OPENAI_API_KEY=sk-your-api-key          # API 密钥
OPENAI_BASE_URL=https://api.example.com/v1  # API 基础URL
OPENAI_MODEL=gpt-4-turbo-preview        # 模型名称
```

## 🌟 支持的服务提供商

### 1. 官方 OpenAI
```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4-turbo-preview
```

### 2. DeepSeek
```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 3. Moonshot AI (Kimi)
```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_MODEL=moonshot-v1-8k
```

### 4. 其他兼容服务
```bash
# 智谱AI (ChatGLM)
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4

# 本地部署的模型服务
OPENAI_API_KEY=sk-local
OPENAI_BASE_URL=http://localhost:8000/v1
OPENAI_MODEL=local-model
```

## 🚀 部署配置示例

### 开发环境
```bash
# .env 文件
OPENAI_API_KEY=sk-your-dev-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 生产环境
```bash
# .env.prod 文件
OPENAI_API_KEY=sk-your-prod-key
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_MODEL=moonshot-v1-32k
```

## 🧪 测试配置

### 1. 验证 API 连接
```bash
# 测试配置是否正确
cd backend
python -c "
from app.agent.core import PPTAgent
agent = PPTAgent()
print('✅ OpenAI 客户端初始化成功')
print(f'使用模型: {agent.model}')
print(f'API 端点: {agent.client.base_url}')
"
```

### 2. 测试简单请求
```python
# 在 Python 中测试
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.deepseek.com/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

## 📊 性能对比

| 服务商 | 响应速度 | 价格 | 特点 |
|--------|----------|------|------|
| OpenAI | 快 | 高 | 功能最全，质量最高 |
| DeepSeek | 快 | 中低 | 性价比高，支持长文本 |
| Moonshot | 中等 | 中 | 平衡性能和价格 |
| 本地部署 | 最快 | 免费 | 完全私有化 |

## ⚠️ 注意事项

### 1. API Key 安全
- 不要将 API Key 提交到版本控制系统
- 使用环境变量管理敏感信息
- 定期轮换 API Key

### 2. 模型兼容性
- 确保选择的模型在目标服务商中可用
- 不同服务商可能支持不同的参数和功能
- 某些高级功能可能不被所有服务商支持

### 3. 速率限制
- 注意各服务商的 API 调用频率限制
- 实现适当的重试和错误处理机制
- 考虑使用缓存减少 API 调用

### 4. 网络配置
- 确保服务器可以访问目标 API 端点
- 配置适当的超时和重试策略
- 考虑使用代理服务器（如需要）

## 🔧 故障排除

### 常见错误

#### 1. 连接超时
```bash
# 检查网络连接
curl -I https://api.deepseek.com/v1

# 配置代理（如果需要）
export HTTPS_PROXY=http://proxy.company.com:8080
```

#### 2. 认证失败
```bash
# 验证 API Key 格式
echo $OPENAI_API_KEY | head -c 10  # 应该以 sk- 开头

# 检查 API Key 是否有效
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### 3. 模型不存在
```bash
# 列出可用模型
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.deepseek.com/v1/models | jq '.data[].id'
```

## 📚 更多资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs)
- [Moonshot AI 文档](https://platform.moonshot.cn/docs)

## 🎯 推荐配置

### 开发环境
```bash
# 推荐使用 DeepSeek（免费额度充足）
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 生产环境
```bash
# 推荐使用官方 OpenAI 或 Moonshot
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4-turbo-preview
```

根据你的需求和预算选择最适合的服务商！🚀
