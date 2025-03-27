FROM node:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN npm install

COPY . .

RUN npm run lint

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start"]
