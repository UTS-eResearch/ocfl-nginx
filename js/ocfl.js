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
    var pattern = new RegExp(url_path + '/([^/]+)/(.*)$');
    var match = req.uri.match(pattern);
    if( !match ) {
        req.error("Match failed " + pattern);
        req.return(500, "ocfl - url match failed");
    } else {
        var oid = match[1];
        var content = match[2];
        var object = pairtree(oid);
        var opath = [ ocfl_repo ].concat(object).join('/');
        var newroute = '/' + opath + '/v1/content/' + content;
        req.warn("Remapped " + oid + " to " + newroute);
        req.internalRedirect(newroute);
    }
}



// adapted from npm pairtree


function stringToUtf8ByteArray (str) {
  str = str.replace(/\r\n/g, '\n');
  var out = [], p = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192;
      out[p++] = (c & 63) | 128;
    } else {
      out[p++] = (c >> 12) | 224;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    }
  }
  return out;
}

function pairtree(id, separator) {
  separator = separator || '/';
  id = id.replace(/[\"*+,<=>?\\^|]|[^\x21-\x7e]/g, function(c) {
    c = stringToUtf8ByteArray(c);
    var ret = '';
    for (var i=0, l=c.length; i<l; i++) {
      ret += '^' + c[i].toString(16);
    }
    //c = c.charCodeAt(0);
    //if (c > 255) return ''; // drop characters greater than ff
    //return '^' + c.toString(16);
    return ret;
  });
  id = id.replace(/\//g, '=').replace(/:/g, '+').replace(/\./g, ',');
  var path = separator;
  while (id) {
    path += id.substr(0, 2) + separator;
    id = id.substr(2);
  }
  return path;
}


