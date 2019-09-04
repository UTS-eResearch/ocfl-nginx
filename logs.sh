#!/bin/bash

# Follow logs

NGINX_PS=$(docker ps -f name=ocflmount -q)
docker container logs -f $NGINX_PS
