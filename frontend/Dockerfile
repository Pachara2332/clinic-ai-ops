FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./
COPY public ./public
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
