# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copia manifesto de dependências antes do código para aproveitar cache
COPY package*.json ./
RUN npm ci

# Copia o restante dos fontes e gera o build de produção
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove config padrão do nginx e substitui pela personalizada
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do Vite para a pasta pública do nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
