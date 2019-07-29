// ocfl utilities

var fs = require('fs');

var MAX_INDEX_LENGTH = 80;

// ocfl(request)
//
// entry-point from nginx


// Note: the regexp here requires URLs like

// /REPO_NAME/OID.vN/path/to/content

// ie the REPO_NAME can't have '/' in it

function ocfl(req) {

  var ocfl_repo = req.variables.ocfl_repo;
  var ocfl_root = req.variables.ocfl_root;
  var index_file = req.variables.ocfl_autoindex;

  var parts = req.uri.split('/');
  var repo = parts[1];
  var oidv = parts[2];
  var content = parts.slice(3).join('/');

  if( !repo ) {
    req.error("Couldn't find match for " + req.uri);
    req.return(440, "Resource not found");
    return;
  } else if( !oidv ) {
    repository_index(req, repo);
  } else {

    var pattern = new RegExp('^([^/\\.]+)(\\.v\\d+)?$');
    var match = oidv.match(pattern);
    if( !match ) {
      req.error("Couldn't match oid " + oidv);
      req.return(440, "Resource not found");
      return
    }
    var oid = match[1];
    var v = match[2];
    var object = pairtree(oid);
    var opath = [ ocfl_repo ].concat(object).join('/');

    if( v ) {
      v = v.substr(1);
    }

    if( !content ) {
      content = index_file;
    }

    req.error("oid: " + oid + "; v: " + v + "; object: " + opath);
    
    var vpath = version(req, ocfl_root + '/' + opath, content, v);
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


// see if this can return json or html

function repository_index(req, url_path) {

  var ocfl_root = req.variables.ocfl_root;
  var ocfl_repo = req.variables.ocfl_repo;
  var repo_index = req.variables.ocfl_repo_index;  
  var index_file = ocfl_root + '/' + ocfl_repo + '/' + repo_index;

  // this could be a subrequest for an index.json which is
  // generated from a database

  try {
    var js = fs.readFileSync(index_file);
    var index = JSON.parse(js);
     
    var html = "<html><body>";

    index.forEach((e) => {
      var entry = index_map(e);
      var url = '/' + url_path + '/' + entry[0] + '/'; 
        html += '<p><a href="' + url + '/">' + entry[1] + '</a></p>'
    });

    html += '</body>';
    send_html(req, html);
  } catch(e) {
    req.error("Error reading " + index_file);
    req.error(e);
    return null;
  }
}


// indexmap takes an index entry and returns an id and a chunk of HTML
// to be rendered as the index

function index_map(entry) {
  var html = entry['name'] + ': ' + entry['description'];
  if( html.length > MAX_INDEX_LENGTH ) {
    html = html.slice(0, MAX_INDEX_LENGTH) + '...';
  }
  return [ entry['@id'], html ];
}

function send_html(req, html) {
  req.status = 200;
  req.headersOut['Content-Type'] = "text/html; charset=utf-8";
  req.headersOut['Content-Length'] = html.length;
  req.sendHeader();
  req.send(html);
  req.finish();
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
    req.log("Trying to read " + ifile);
    var contents = fs.readFileSync(ifile);
    var ijs = JSON.parse(contents);
    return ijs;
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





