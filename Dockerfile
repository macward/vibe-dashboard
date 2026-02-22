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

# Remove default nginx user requirement
RUN sed -i 's/user  nginx;/#user  nginx;/' /etc/nginx/nginx.conf

# Create directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R 1000:1000 /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run

COPY --from=build --chown=1000:1000 /app/dist /usr/share/nginx/html
COPY --chown=1000:1000 nginx.conf /etc/nginx/conf.d/default.conf

USER 1000

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
