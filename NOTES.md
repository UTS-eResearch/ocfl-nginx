# NOTES

## Authentication - for later

auth_request allows all incoming requests to be forwarded to an authentication endpoint



## Versions

very simple versioning plan

incoming URL

https://server/datasets/OID/path/to/payload.jpg

the handler splits this to:

   OID -> get ocfl path
   path/to/payload.jpg -> the content

need a function which reads the manifest and resolves path/to/payload.jpg to a versioned path
like v4/content/path/to/payload.jpg

then do an internalRedirect to

datasets_ocfl/OCFLPATH/v4/content/path/to/payload.jpg



http://localhost:8080/staging/99aeeba852c43991a917d541de5b8a64/CATALOG.html

http://localhost:8080/staging/99aeeba852c43991a917d541de5b8a64/blobboid.gif