// ocfl utilities


// convert an oid to an array representing a path in the
// ocfl repository (the pairtree)

function oid_to_ocfl(oid) {
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

function basic_rewrite(r) {
    r.warn("basic_rewrite was called");
    r.internalRedirect("/rewritten/");
}

function throw_error(r) {
    r.warn("throw_error was called");
    r.return(500, "Throw an error");
}

