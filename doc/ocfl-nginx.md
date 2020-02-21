ocfl-nginx
==========

## overview

ocfl-nginx is a JavaScript extension to the nginx web server which maps versioned resources in an OCFL repository to URLs.

URLs are of the form

    https://your.hostname.here/repository_name/a9ec837a9edf9e99.v1/PATH/TO/FILE.html

Incoming URLs are parsed into the following components:

* repository
* OID
* version [optional]
* resource path [optional]

If the version number is not present, or versioning is switched off, the HEAD (latest version) is used.

If the resource path is missing, or matches part of a path within the OCFL Object, and if autoindexing is switched on, the URL will return the contents of that path (analogous to the view of a file directory returned by an nginx autoindex)

## server variables

### $ocfl_files

Absolute filesystem path to the directory containing the OCFL repositories. For example, if the OCFL repository is at

    /etc/share/nginx/html/myrepo1_ocfl

Then `$ocfl_files` should be set to `/etc/share/nginx/html`.

## location variables

Each OCFL repository to be served requires two `location` sections in the nginx config: one which routes incoming URLs to the ocfl.js handler for that repository, and another which maps the repository as specified by the URL to an OCFL repository in `$ocfl_files`.

The name of the first location must match what you want in the URL. The second location's name must match the directory name of the OCFL repository relative to `$ocfl_files`.

By convention, the second location's name is the first location plus `_ocfl`

The following example shows how to configure myrepo1_ocfl from the example above:

    location /myrepo1/ {
        set $ocfl_path myrepo1;
        set $ocfl_repo myrepo1_ocfl;
        set $ocfl_solr mycore1
        js_content ocfl;
    }

    location /myrepo1_ocfl/ {
        root $ocfl_files;
    }

### $ocfl_path

This is used to build the pattern which the ocfl handler uses to parse incoming urls. It must be the same as the location path. (Todo: can it be got from nginx directly?)

### $ocfl_repo

This tells ocfl.js where the OCLF repo is located relative to `$ocfl_files`.

### $ocfl_solr

This should be the name of the Solr core in which this OCFL repository is indexed.

### js_content

This is the ngnix directive which tells the web server to handle requests at this URL using the `ocfl` function defined in `ocfl.js`. 

### $ocfl_files

Each of the locations representing the OCFL directory needs to set its `root` directive to the value configured earlier in `$ocfl_files`

## server or location variables

These can be configured for the whole server (all repos) or for individual repos

### $ocfl_err_pending

Relative URL to redirect to when ocfl.js can't find the requested OID. This may be different to a 'resource not found' message because the object may not have been written to the live repository yet

### $ocfl_err_not_found

Relative URL to redirect to in two cases:

- the incoming path can't be parsed by the REPO/OID(.vN)/PATH pattern
- the repo and oid are found, but the path doesn't exist at the requested version

### $ocfl_index_file

This is the equivalent of the nginx `index` directive. If a file with this name is found in the path (and exists in the requested version) it will be returned by default. If no such file is found, a 404 error is returned.

### $ocfl_autoindex

This is the equivalent of the nginx `autoindex` directive. If it is set to `on`, a directory listing will be generated from the OCFL object inventory.json file for any URL with no content or a path ending in '/'. `$ocfl_index_file` takes precedence over this setting: if the `$ocfl_index_file` is configured but not found, an autoindex listing will not be generated as a fallback.

### $ocfl_versions

If this variable is set to `on`, ocfl-nginx will serve earlier versions of files. Otherwise, only the HEAD version will be available, and versions in URLs will be ignored.

### $oclf_resolver

Used to set what method is used to resolve OIDs on the URL to an OCFL path.

- pairtree - use the pairtree algorithm
- solr - look up the OID in solr

If `solr` is chosen, all access to resources will be mediated through a solr lookup.

If `ocfl_solr` is configured for a repository, the default resolver is `solr`, otherwise it's `pairtree`.

### $ocfl_allow

Only allow content which matches a regular expression to be served, if this is defined.

The regexp is anchored to the end of the path, so

    set $ocfl_allow \.html

will get turned into `/\.html$/` when used to match. This is because `$` isn't allowed or escapable in an nginx variable assignment.

### $ocfl_referrer

Limits responses to only those HTTP requests with the 'Referer' header set to a value which matches. This allows the ocfl server to only deliver content when it's wrapped in an iframe from a page with the right URL.

Note: for this to work, you must set Cache-Control to `no-store` in the nginx config, otherwise the user will be able to view the cached copy of the content after it's been loaded by the iframe, bypassing the ocfl_referrer check.

## Sample config

Sample config for a server with a single ocfl repository.
    
    /etc/share/nginx/html/myrepo1_ocfl


The Solr server is on solr.backend:8983

    server {
        listen 443;
        server_name my.ocfl-nginx.org;
    
        set $ocfl_files /etc/share/nginx/html;
        set $ocfl_autoindex ro-crate-preview.html;
    
        location /solr/ {
            proxy_pass http://solr.backend:8983;
        }
        
        location /myrepo1/ {
            set $ocfl_path myrepo1;
            set $ocfl_repo myrepo1_ocfl;
            set $ocfl_solr mycore1
            js_content ocfl;
        }

        location /myrepo1_ocfl/ {
            root $ocfl_files;
        }
    }

