# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Nginx
# ... etapa de build anterior ...

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# ESTA ES LA LÍNEA CLAVE: agregamos /browser al final de la ruta origen
COPY --from=build /app/dist/vm.management-front/browser /usr/share/nginx/html

# Mantenemos la configuración de Nginx para Angular
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]