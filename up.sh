#!/bin/bash

OCFL_DIR=/Users/mike/working/redbox/ocfl-nginx/test_repos/

docker run -d --name ocflmount \
  --mount type=bind,source=${OCFL_DIR},target=/etc/share/nginx/html \
  -p 8080:8080 \
  $1
