# Fase de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos necessários para instalação das dependências
COPY package*.json ./

# Instala as dependências
RUN yarn install

# Copia o restante dos arquivos
COPY . .

# Ignora o linting durante a build
RUN yarn build --no-lint

# Fase de produção
FROM node:20-alpine AS production

WORKDIR /app

# Copia o resultado da build
COPY --from=builder /app ./

# Expõe a porta 3001
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["yarn", "start"]
