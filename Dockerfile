# Stage 1: Build Next.js static export
FROM node:20-alpine AS builder
WORKDIR /app
COPY site/package.json site/package-lock.json ./
RUN npm ci
COPY site/ .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
