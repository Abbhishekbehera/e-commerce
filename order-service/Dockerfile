FROM node:20-alpine

WORKDIR /app

# Shared module

COPY package*.json ./
RUN npm install --omit=dev

COPY shared ./shared

# Order Service

COPY order-service ./order-service

WORKDIR /app/order-service

EXPOSE 5003

CMD ["node", "app.js"]