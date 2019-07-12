// ocfl utilities

var fs = require('fs');


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
  var index_file = req.variables.ocfl_index_file;
  var pattern = new RegExp(url_path + '/([^/]+)/(.*)$');
  var match = req.uri.match(pattern);
  if( !match ) {
    req.error("Match failed " + pattern);
    req.return(500, "ocfl - url match failed");
  } else {
    var oid = match[1];
    var content = match[2] || index_file;
    var object = pairtree(oid);
    var opath = [ ocfl_repo ].concat(object).join('/');
    var newroute = '/' + opath + '/v1/content/' + content;
    req.warn("Remapped " + oid + " to " + newroute);
    req.internalRedirect(newroute);
  }
}


// version with versions

function ocfl_versioned(req) {
  var url_path = req.variables.ocfl_path;
  var ocfl_repo = req.variables.ocfl_repo;
  var ocfl_files = req.variables.ocfl_files;
  var index_file = req.variables.ocfl_index_file;
  var pattern = new RegExp(url_path + '/([^/\\.]+)(\\.v\\d+)?/(.*)$');
  var match = req.uri.match(pattern);
  if( !match ) {
    req.error("Match failed " + pattern);
    req.return(500, "ocfl - url match failed");
  } else {
    var oid = match[1];
    var v = match[2];
    var content = match[3] || index_file;
    var object = pairtree(oid);
    var opath = [ ocfl_repo ].concat(object).join('/');

    if( v ) {
      v = v.substr(1);
    }
    var vpath = version(req, ocfl_files + '/' + opath, content, v);
    if( vpath ) {
      var newroute = '/' + opath + '/' + vpath;
      req.warn("Remapped " + oid + " to " + newroute);
      req.internalRedirect(newroute);
    } else {
      req.error("Version not found");
      req.return(440, "Version not found");
    }
  }
}



function version(req, object, payload, version) {
  var inv = load_inventory(req, object);
  if( ! inv ) {
    req.error("Couldn't load inventory for " + object);
    return null;
  }
  var v = version || inv.head;
  if( ! inv.versions[v] ) {
    req.error("Couldn't find version " + v);
    return null;
  }
  var state = inv.versions[v].state;
  var hash = Object.keys(state).filter(function(h) {
    return ( state[h].includes(payload) )
  });
  if( hash.length > 0 ) {
    return inv.manifest[hash[0]];
  } else {
    req.error("Couldn't find resource " + payload + " in version " + v);
    return null;
  }
}


function load_inventory(req, object) {
  var ifile = object + 'inventory.json';
  try {
    var contents = fs.readFileSync(ifile);
    return JSON.parse(contents);
  } catch(e) {
    req.error("Error reading " + ifile);
    req.error(e);
    return null;
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





