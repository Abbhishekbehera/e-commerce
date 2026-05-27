FROM node:29.4.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5002

CMD [ "nodemon","app.js" ]
