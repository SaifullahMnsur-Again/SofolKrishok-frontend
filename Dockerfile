# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Inline SPA nginx config — no external nginx.conf file needed in the repo
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Never cache index.html so browsers always fetch the latest hashed bundles\n\
    location = /index.html {\n\
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";\n\
        add_header Pragma "no-cache";\n\
        add_header Expires "0";\n\
    }\n\
\n\
    # SPA fallback — all unknown paths return index.html for React Router\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Long-cache hashed static assets (safe: Vite changes filename on every build)\n\
    location ~* \\.(ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|mp4|webm)$ {\n\
        expires 6M;\n\
        access_log off;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]