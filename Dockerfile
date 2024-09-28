FROM node:slim

WORKDIR /app

COPY . .

RUN npm install

RUN npm run dev
