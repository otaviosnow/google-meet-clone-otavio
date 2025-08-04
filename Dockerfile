# Dockerfile para Google Meet Fake SaaS

# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar pasta uploads
RUN mkdir -p uploads

# Criar pasta logs
RUN mkdir -p logs

# Definir permissões
RUN chmod +x install.sh

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 