#! /bin/sh
# stop and remove the ocflmount container

NGINX_PS=$(docker ps -f name=ocflmount -q)
docker stop $NGINX_PS
docker rm $NGINX_PS