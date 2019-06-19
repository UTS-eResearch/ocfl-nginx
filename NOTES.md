# NOTES

## Authentication - for later

auth_request allows all incoming requests to be forwarded to an authentication endpoint



## Versions

Basic versioning is now available with the ocfl_versioned handler

https://server/ocfl/staging/OID/path/to/payload.jpg -> returns head

https://server/ocfl/staging/OID/path/to/payload.jpg?version=v1 -> returns this resource at v1

