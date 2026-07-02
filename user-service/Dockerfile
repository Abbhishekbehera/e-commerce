FROM node:20-alpine

WORKDIR /app

# Shared module
COPY package*.json ./
RUN npm install --omit=dev

COPY shared ./shared
# User Service

COPY user-service ./user-service

WORKDIR /app/user-service

EXPOSE 5001

CMD ["node", "app.js"]