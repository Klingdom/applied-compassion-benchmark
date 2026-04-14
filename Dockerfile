FROM nginx:alpine

# Remove default nginx config and html
RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site files
COPY legacy-html/ /usr/share/nginx/html/

# Copy error pages
COPY error-pages/404.html /usr/share/nginx/html/404.html
COPY error-pages/50x.html /usr/share/nginx/html/50x.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
