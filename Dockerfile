# src-frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
# Copiamos el build de Angular al directorio de Nginx
COPY --from=build /app/dist/ifx-vms-frontend/browser /usr/share/nginx/html
# Copiamos una config básica de Nginx para manejar rutas de Angular
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80