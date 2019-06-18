# NOTES

## Authentication - for later

auth_request allows all incoming requests to be forwarded to an authentication endpoint



NOTES
=====

Design notes for the nginx / ocfl bridge

In nginx: map an ID to an ocfl path

ie /staging/297fdfa5441fd39bb4a25f3563d96b3f -> /ROOT/staging/29/7f/df/a5/44/1f/d3/9b/b4/a2/5f/35/63/d9/6b/3f/

In stash: to write the URL to the metadata record, the same transformation (almost):

297fdfa5441fd39bb4a25f3563d96b3f, staging -> https://DATADOMAIN/PATH/staging/297fdfa5441fd39bb4a25f3563d96b3f

## Parameters

- Object ID
- Repository file root
- Repository URL base  https://DATADOMAIN/PATH

filename(ID) => FILESYSTEM + idtoocfl(ID)
url(ID)      => URLBASE + idtoocfl(ID)

This assumes that all repositories are like

$FILESYSTEM/staging
$FILESYSTEM/public

which is OK for now.

## Config

In the datapubs.js config file for stash:

    "sites": {
  	  "staging": {
        "dir": "/publication/staging",
        "url": "http://localhost:8080/staging"
      },
  	  "public": {
        "dir": "/publication/public",
        "url": "http://localhost:8080/public"
      }
    }

This covers FILESYSTEM and URLBASE and is more flexible 

## shared code

