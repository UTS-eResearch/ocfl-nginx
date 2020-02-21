# Dockerfile for ocfl-nginx

FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx
COPY conf.d/ocfl.conf /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/js
COPY js/ocfl.js /etc/nginx/js
COPY portal/ /etc/share/nginx/html/
RUN mkdir -p /etc/share/nginx/html/assets
COPY assets/* /etc/share/nginx/html/assets/
RUN mkdir -p /etc/share/nginx/html/error
COPY error/* /etc/share/nginx/html/error/
