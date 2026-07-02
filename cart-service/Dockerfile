FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
# Shared module
COPY shared ./shared


# Cart Service
COPY cart-service ./cart-service

WORKDIR /app/cart-service

EXPOSE 5006

CMD ["node", "app.js"] 