FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && ./node_modules/.bin/tsx src/server.ts"]
