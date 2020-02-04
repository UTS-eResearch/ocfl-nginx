ocfl-nginx
==========

nginx-js script for serving an ocfl repository with a solr index.

## Contents

    conf.d/ocfl.conf
    js/ocfl.js
    assets/ocfl.css
    Dockerfile
    docker-compose.yml

## Prerequsites

Requires nginx with the njs JavaScript extension installed.

## Deployment

Components: a solr container and an nginx-ocfl container.


## Roadmap

### Automated test

### Versions

Put a proper test framework around versioning.

Expose versions to the web using a protocol such as memento

### node.js

A variant which uses the same javascript but in a node.js/express app rather than an nginx


