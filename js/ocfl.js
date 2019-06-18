// ocfl utilities

// ocfl(request)
//
// entry-point from nginx
//
// expects two parameters set on the request variables:
// ocfl_path - the part of the URL path before the OID in the incoming URL
// ocfl_repo - the nginx location mapped to the actual ocfl file root

function ocfl(req) {
    var url_path = req.variables.ocfl_path;
    var ocfl_repo = req.variables.ocfl_repo;
    var pattern = new RegExp(url_path + '/([^/]+)(.*)$');
    var match = req.uri.match(pattern);
    if( !match ) {
        req.error("Match failed " + pattern);
        req.return(500, "ocfl - url match failed");
    } else {
        var oid = match[1];
        var content = match[2];
        var object = oid_pairtree(oid);
        var opath = [ ocfl_repo ].concat(object).join('/');
        var newroute = '/' + opath + '/v1/content/' + content;
        req.warn("Remapped " + oid + " to " + newroute);
        req.internalRedirect(newroute);
    }
}

// convert an oid to an array representing a path in the
// ocfl repository (the pairtree)

// TODO: replace this bad regexp version with something more robust

function oid_pairtree(oid) {
    return oid.match(/.{1,2}/g);
}
