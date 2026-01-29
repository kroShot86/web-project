# Base image
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy backend source
COPY . .

# Copy frontend build (будет скопировано в docker-compose.prod.yml)
# Папка для фронтенда
RUN mkdir -p public

EXPOSE 5000

CMD ["node", "server.js"]