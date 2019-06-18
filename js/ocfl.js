// ocfl utilities


// convert an oid to an array representing a path in the
// ocfl repository (the pairtree)

function oid_pairtree(oid) {
    return oid.match(/.{1,2}/g);
}






// entry-point from nginx

// note: staging_js -> staging

function ocfl_resolve(req) {
    try {
        var parts = req.uri.split('/');
        var oid = parts[parts.length - 1];
        var ocfl_path = oid_to_ocfl(oid);
        var route = [ 'staging' ];
        var newroute = '/' + route.concat(ocfl_path).join('/') + '/v1/content/';
        req.warn("Remapped " + oid + " to " + newroute);
        req.internalRedirect(newroute);
    } catch(e) {
        req.error("ocfl_resolve error: " + e);
        req.return(500, "ocfl_resolve: " + e);
    }
}




