# Dockerfile for ocfl-nginx

FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx
RUN mkdir -p /etc/nginx/js
COPY js/ocfl.js /etc/nginx/js
COPY conf.d/ocfl.conf /etc/nginx/conf.d