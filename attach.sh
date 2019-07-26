#! /bin/sh
#Attach a shell to nginx 
NGINX_PS=$(docker ps -f name=ocflmount -q)
docker exec -it $NGINX_PS /bin/bash -c 'exec "${SHELL:-sh}"'
