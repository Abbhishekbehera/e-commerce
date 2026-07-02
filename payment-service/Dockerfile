FROM node:20-alpine

WORKDIR /app

# Shared module

COPY package*.json ./
RUN npm install --omit=dev

COPY shared ./shared

# Payment Service
COPY payment-service ./payment-service

WORKDIR /app/payment-service

EXPOSE 5005

CMD ["node", "app.js"]