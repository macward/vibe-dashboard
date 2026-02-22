# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_API_TOKEN
ARG VITE_POLLING_INTERVAL=10000

RUN npm run build

# Production stage - rootless compatible
FROM nginx:alpine

# Create nginx.conf for rootless
RUN echo 'pid /tmp/nginx.pid;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    client_body_temp_path /tmp/client_temp;' >> /etc/nginx/nginx.conf && \
    echo '    proxy_temp_path /tmp/proxy_temp;' >> /etc/nginx/nginx.conf && \
    echo '    fastcgi_temp_path /tmp/fastcgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    uwsgi_temp_path /tmp/uwsgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    scgi_temp_path /tmp/scgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Fix permissions
RUN chown -R 1000:1000 /var/cache/nginx /var/log/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx

COPY --from=build --chown=1000:1000 /app/dist /usr/share/nginx/html
COPY --chown=1000:1000 nginx.conf /etc/nginx/conf.d/default.conf

USER 1000

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
