ocfl-nginx
==========

Utilities for serving OCFL objects via nginx.

This package doesn't provide indexing or discovery - it's a proof-of-concept of whether it's possible to resolve ocfl ids and versions using as little JavaScript as possible.

It's nowhere near production-ready and will probably not scale to datasets with many files or versions.

## Contents

    conf.d/ocfl.conf - nginx config file
    js/ocfl.js - javascript to map incoming URLs to ocfl object paths

## Prerequsites

Requires nginx with the njs JavaScript extension installed.

## Roadmap

### Docker

Publish a Docker image which installs the ocfl config and javascript on an ngnix container.

### Versions

Put a proper test framework around versioning.

Expose versions to the web using a protocol such as memento




