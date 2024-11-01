# Fase de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

# Fase de produção
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

CMD ["yarn", "start"]
