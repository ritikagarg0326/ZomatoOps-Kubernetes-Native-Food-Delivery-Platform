FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g @angular/cli@17 --legacy-peer-deps --quiet

COPY package.json .npmrc ./
RUN npm install --legacy-peer-deps --quiet

COPY . .
RUN ng build --configuration development

# ── Stage 2: serve via nginx ──────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/zomato-clone/browser /usr/share/nginx/html

RUN printf 'server {\n\
    listen 4200;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]