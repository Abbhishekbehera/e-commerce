FROM node:20-alpine

WORKDIR /app

# Shared module
COPY package*.json ./
RUN npm install --omit=dev

COPY shared ./shared

# Notification Service
COPY notification-service ./notification-service

WORKDIR /app/notification-service


EXPOSE 5004

CMD ["node", "app.js"]