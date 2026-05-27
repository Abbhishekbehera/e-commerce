FROM node:29.4.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD [ "nodemon","app.js" ]
