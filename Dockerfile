# Stage 1: Build Next.js static export
FROM node:20-alpine AS builder
WORKDIR /app
COPY site/package.json site/package-lock.json ./
RUN npm ci
COPY site/ .

# Optional: pass search-engine site-verification tokens at build time.
# Supply these as --build-arg flags to `docker build` (or as build args in
# docker-compose.yml). When absent, no verification meta tags are emitted.
#   --build-arg NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>
#   --build-arg NEXT_PUBLIC_BING_SITE_VERIFICATION=<token>
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
ENV NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ENV NEXT_PUBLIC_BING_SITE_VERIFICATION=$NEXT_PUBLIC_BING_SITE_VERIFICATION

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
