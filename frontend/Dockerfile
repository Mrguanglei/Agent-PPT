# Multi-purpose Dockerfile for React frontend (dev and prod)
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Default command - can be overridden in docker-compose.yml
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
