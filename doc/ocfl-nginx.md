OCFL-nginx
==========

(Documenting this before I write it)


## ocfl.conf

Sample config for a server with two ocfl repositories in the same nginx root:
    
    /etc/share/nginx/html/myrepo1_ocfl
    /etc/share/nginx/html/myrepo2_ocfl

Each repo has been indexed into a solr core with the names mycore1 and mycore2.

The Solr server is on solr.backend:8983

    server {
        listen 443;
        server_name my.ocfl-nginx.org;
    
        set $ocfl_root /etc/share/nginx/html;
        set $ocfl_autoindex ro-crate-preview.html;
    
        location /solr/ {
            proxy_pass http://solr.backend:8983;
        }
    
        location /myrepo1/ {
    	    set $ocfl_repo myrepo1_ocfl;
            set $ocfl_solr mycore1
	        js_content ocfl;
        }
    
        location /myrepo2/ {
    	    set $ocfl_repo myrepo2_ocfl;
            set $ocfl_solr mycore2
	        js_content ocfl;
        }
    
        location /myrepo2_ocfl/ {
            root $ocfl_root;
        }
    
        location /myrepo1_ocfl/ {
            root $ocfl_root;
        }
    
    }

Sample config for a server with one ocfl repository at /etc/share/nginx/html/myrepo_ocfl which is indexed in a static json file called index.json.  Note that the js content handler for this use case is ocfl_json


    server {
        listen 443;
        server_name my.ocfl-nginx.org;
    
        set $ocfl_root /etc/share/nginx/html;
        set $ocfl_autoindex ro-crate-preview.html;
    
        location /solr/ {
            proxy_pass http://solr.backend:8983;
        }
    
        location /myrepo/ {
    	    set $ocfl_repo myrepo_ocfl;
            set $ocfl_index index.json
	        js_content ocfl_json;
        }
        
        location /myrepo1_ocfl/ {
            root $ocfl_root;
        }
    
    }

