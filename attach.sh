#! /bin/sh
#Attach a shell to nginx 
NGINX_PS=$(docker ps -f name=ocfl-nginx_nginx-ocfl -q)
docker exec -it $NGINX_PS /bin/bash -c 'exec "${SHELL:-sh}"'
