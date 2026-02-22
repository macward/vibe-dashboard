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

# Create data directory
RUN mkdir -p /opt/data/vibe-dash && \
    chown -R 1000:1000 /opt/data/vibe-dash

# Create nginx.conf for rootless
RUN echo 'pid /opt/data/vibe-dash/nginx.pid;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /opt/data/vibe-dash/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    client_body_temp_path /opt/data/vibe-dash/client_temp;' >> /etc/nginx/nginx.conf && \
    echo '    proxy_temp_path /opt/data/vibe-dash/proxy_temp;' >> /etc/nginx/nginx.conf && \
    echo '    fastcgi_temp_path /opt/data/vibe-dash/fastcgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    uwsgi_temp_path /opt/data/vibe-dash/uwsgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    scgi_temp_path /opt/data/vibe-dash/scgi_temp;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Fix permissions
RUN chown -R 1000:1000 /var/cache/nginx /usr/share/nginx/html

COPY --from=build --chown=1000:1000 /app/dist /usr/share/nginx/html
COPY --chown=1000:1000 nginx.conf /etc/nginx/conf.d/default.conf

USER 1000

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
