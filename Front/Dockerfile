# ESTÁGIO 1: Construção (Build)
# Usamos uma versão leve do Node para instalar dependências e "buildar" o projeto
FROM node:22-alpine AS builder

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração primeiro (isso otimiza o cache do Docker)
COPY package*.json ./
COPY app/admin/package*.json ./app/admin/
COPY packages/ui-shared/package*.json ./packages/ui-shared/
COPY packages/utils/package*.json ./packages/utils/

# Instala as dependências
RUN npm install

# Copia todo o resto do código do projeto para o container
COPY . .

# Roda o comando do Vite para gerar a versão final (cria a pasta /dist)
RUN npm run build:admin

# ==========================================

# ESTÁGIO 2: Servidor de Produção (Nginx)
# Pegamos um servidor web super leve e limpo
FROM nginx:alpine

# Copia APENAS a pasta /dist gerada no Estágio 1 para a pasta pública do Nginx
COPY --from=builder /app/app/admin/dist /usr/share/nginx/html

# Libera a porta 80 do container
EXPOSE 80

# Inicia o servidor web
CMD ["nginx", "-g", "daemon off;"]