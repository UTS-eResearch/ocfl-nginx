ocfl-nginx
==========

JavaScript utilities for serving OCFL repositories via nginx.

## Contents

- ocfl.conf - nginx config file
- ocfl.js - javascript to map incoming URLs to ocfl object paths

## Roadmap

### UTS Stash MVP

Resolving oids to OCFL paths to serve datasets as part of the UTS reseach data catalogue toolchain.

### Versions

Static versions - write out copies or symlinks of each version

Explore feasibility of dynamic versions, which would do internal nginx redirects to the latest version of a file based on the manifest

Expose versions to the web using a protocol such as memento




