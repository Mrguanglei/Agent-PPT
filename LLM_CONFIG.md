# LLM 模型配置指南

本项目支持所有兼容 OpenAI API 格式的模型，包括国产大模型。

## 环境变量说明

在 `.env` 文件或 `docker-compose.yml` 中配置以下变量：

- `OPENAI_API_KEY`: API 密钥
- `OPENAI_BASE_URL`: API 基础 URL（可选，用于国产模型）
- `OPENAI_MODEL`: 模型名称（可选，默认为 gpt-4-turbo-preview）

## 国产模型配置示例

### 1. 智谱 AI (GLM-4)

```bash
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_API_KEY=your-zhipu-api-key
OPENAI_MODEL=glm-4-plus
```

支持模型：
- `glm-4-plus` - GLM-4 Plus（旗舰）
- `glm-4-0520` - GLM-4 0520
- `glm-4-air` - GLM-4 Air（轻量）
- `glm-4-flash` - GLM-4 Flash（超轻量）
- `glm-4-long` - GLM-4 Long（长上下文）

### 2. 通义千问 (阿里云)

```bash
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_API_KEY=sk-your-qwen-api-key
OPENAI_MODEL=qwen-max
```

支持模型：
- `qwen-max` - 通义千问超大规模语言模型
- `qwen-plus` - 千问_plus
- `qwen-turbo` - 千问_turbo
- `qwen-long` - 千问长上下文模型

### 3. 百度千帆 (文心一言)

```bash
OPENAI_BASE_URL=https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat
OPENAI_API_KEY=your-ernie-api-key
OPENAI_MODEL=ernie-bot-4
```

支持模型：
- `ernie-bot-4` - 文心大模型 4.0
- `ernie-bot` - 文心一言
- `ernie-bot-turbo` - 文心轻量版

### 4. DeepSeek

```bash
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_MODEL=deepseek-chat
```

支持模型：
- `deepseek-chat` - DeepSeek Chat
- `deepseek-coder` - DeepSeek Coder

### 5. 月之暗面 (Kimi)

```bash
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_API_KEY=sk-your-kimi-key
OPENAI_MODEL=moonshot-v1-8k
```

支持模型：
- `moonshot-v1-8k` - Kimi 8K 上下文
- `moonshot-v1-32k` - Kimi 32K 上下文
- `moonshot-v1-128k` - Kimi 128K 上下文

### 6. 零一万物 (Yi)

```bash
OPENAI_BASE_URL=https://api.lingyiwanwu.com/v1
OPENAI_API_KEY=your-yi-api-key
OPENAI_MODEL=yi-large
```

支持模型：
- `yi-large` - Yi 大模型
- `yi-medium` - Yi 中模型
- `yi-spark` - Yi 小模型
- `yi-vl-chat` - Yi 视觉理解模型

## Docker Compose 配置

在项目根目录创建 `.env` 文件：

```bash
# 使用智谱 AI GLM-4
OPENAI_API_KEY=your-zhipu-api-key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4-plus

SECRET_KEY=your-secret-key-here
```

然后启动服务：

```bash
docker-compose up -d
```

## OpenAI 官方配置

如果使用 OpenAI 官方 API：

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_BASE_URL=
OPENAI_MODEL=gpt-4-turbo-preview
```

## 注意事项

1. **API 密钥安全**：不要将 `.env` 文件提交到 Git 仓库
2. **Base URL 格式**：确保 Base URL 不包含尾部斜杠
3. **模型名称**：根据不同服务商提供的模型名称进行配置
4. **兼容性**：所有兼容 OpenAI API 格式的服务商都可以使用

## 测试配置

启动服务后，可以通过以下方式测试：

```bash
# 查看服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f backend

# 访问前端
open http://localhost:3000
```

## 故障排查

### 问题 1: API 调用失败
- 检查 API 密钥是否正确
- 确认 Base URL 格式正确
- 查看后端日志：`docker-compose logs backend`

### 问题 2: 模型不存在
- 确认模型名称拼写正确
- 检查该模型是否在您的账号服务范围内

### 问题 3: 连接超时
- 检查网络连接
- 某些国产模型 API 可能需要配置代理
