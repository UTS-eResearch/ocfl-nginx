DEPLOYMENT
==========

Use this as a basis for ansiblising it


The following setup is required on the nginx container:

Add the load_module line to 

/etc/nginx/nginx.conf

    load_module modules/ngx_http_js_module.so;

Create a directory /etc/nginx/js and install the ocfl.js in it

/etc/nginx/js/ocfl.js

To do this manually, I've been doing this to get around the nginx container
not having an editor

    > cp ocfl.js /mnt/nginx.conf
    > attachNginx.sh
    root@5a25369ace28:/# cd /etc/nginx
    root@5a25369ace28:/etc/nginx# mkdir js
    root@5a25369ace28:/etc/nginx# mv ./conf.d/ocfl.js ./js/
    root@5a25369ace28:/etc/nginx# cp nginx.conf ./conf.d/nginx.conf.main
    // then go back to the vagrant and edit the config file to ad the load_module
    > vi /mnt/nginx.conf/nginx.conf.main 
    root@5a25369ace28:/etc/nginx# cp ./conf.d/nginx.conf.main nginx.conf




/etc/nginx/conf.d/ocfl.conf




