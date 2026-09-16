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

# This build context is `site/` only — there is no `.git` in here, so
# scripts/build-manifest.mjs cannot shell out to git for the commit identity
# (BM-1). deploy.sh computes these on the host (where `.git` exists) and
# passes them through docker-compose.yml's build.args.
#   --build-arg GIT_SHA=$(git rev-parse --short HEAD)
#   --build-arg GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
#   --build-arg GIT_DIRTY=true|false
ARG GIT_SHA
ARG GIT_BRANCH
ARG GIT_DIRTY
ENV GIT_SHA=$GIT_SHA
ENV GIT_BRANCH=$GIT_BRANCH
ENV GIT_DIRTY=$GIT_DIRTY

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
