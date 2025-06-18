FROM node:18-slim

WORKDIR /app

COPY package*.json ./

COPY . .

COPY .env ./.env

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]

