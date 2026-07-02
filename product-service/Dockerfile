FROM node:20-alpine

WORKDIR /app

# Shared module
COPY package*.json ./
RUN npm install --omit=dev

COPY shared ./shared

# Product Service
COPY product-service ./product-service

WORKDIR /app/product-service

EXPOSE 5002

CMD ["node", "app.js"]