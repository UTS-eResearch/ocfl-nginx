// ocfl utilities

var fs = require('fs');


var PAGE = 20;

// parse the URI and either serve the index or an ocfl_object

function ocfl(req) {

  var ocfl_solr = req.variables.ocfl_solr;
  var license = req.variables.default_license;

  var parts = req.uri.split('/');
  var repo = parts[1];
  var oidv = parts[2];
  var content = parts.slice(3).join('/');

  if( !repo ) {
    req.error("Couldn't find match for " + req.uri);
    req.internalRedirect("/50x.html");
    return;
  }

  if( oidv ) {
    ocfl_object(req, repo, oidv, content)
  } else {

    var start = parse_pagination(req.variables.args);
    var query = solr_query(license, { q: "*:*", fl: [ 'id', 'name', 'path', 'uri_id' ] });

    req.subrequest(ocfl_solr + '/select', { args: query }, ( res ) => {
      var solrJson = JSON.parse(res.responseBody);
      var docs = solrJson['response']['docs'];
      var start = solrJson['response']['start'];
      var numFound = solrJson['response']['numFound'];
      send_html(req, render_index(repo, numFound, start, PAGE, docs));
    });
  }
}


function solr_query(license, options) {
  var query = "fq=" + encodeURIComponent("record_type_s:Dataset") + '&' +
    "fq=" + encodeURIComponent("license:" + license ) + "&" +
    "q=" + encodeURIComponent(options['q']) + '&' +
    "fl=" + encodeURIComponent(options['fl'].join(','));
  return query;
}


function parse_pagination(args) {
  if( ! args ) {
    return '0';
  }
  var start_re = new RegExp('^start=(\\d+)');
  var match = args.match(start_re);
  if( match ) {
    return match[1];
  }
  return '0';
}


// parse a versioned url_id, look it up in solr to find the path
// and then return the versioned ocfl content

function ocfl_object(req, repo, oidv, content) {

  var pattern = new RegExp('^([^\\.]+)(\\.v\\d+)?$');
  var match = oidv.match(pattern);
  if( !match ) {
    req.error("Couldn't match oid " + oidv);
    req.return(440, "Resource not found");
    return
  }

  var oid = match[1];
  var v = match[2];

  var ocfl_solr = req.variables.ocfl_solr;
  var ocfl_repo = req.variables.ocfl_repo;
  var ocfl_root = req.variables.ocfl_root;
  var index_file = req.variables.ocfl_autoindex;
  var ocfl_versions = req.variables.ocfl_versions;
  var license = req.variables.default_license;

  
  var query = solr_query(license, { q: "uri_id:" + oid, fl: [ 'path' ] });

  req.subrequest(ocfl_solr + '/select', { args: query }, ( res ) => {
    var solrJson = JSON.parse(res.responseBody);
    if( solrJson['response']['docs'].length === 1 ) {
      var p = solrJson['response']['docs'][0]['path'];
      var opath = [ ocfl_repo ].concat(p).join('/');
      
      if( ocfl_versions !== "on" ) {
        v = undefined
      } else {
        if( v ) {
          v = v.substr(1);
        }
      }

      if( !content ) {
        content = index_file;
      }

      var vpath = version(req, ocfl_root + '/' + opath, content, v);
      if( vpath ) {
        var newroute = '/' + opath + '/' + vpath;
        req.warn("Remapped " + oid + " to " + newroute);
        req.internalRedirect(newroute);
      } else {
        req.error("Version not found");
        req.internalRedirect("/404.html");
      }
    } else {
      req.error("OID " + oid + " not found in index");
      req.internalRedirect("/404.html");
    }
  
  });
}




// pass this the repostory, the page start index and a list of objects
// with the properties url_id and name (name is an array)


function render_index(repo, numFound, start, page, links) {

  var html = '<html><head><link rel="stylesheet" type="text/css" href="/assets/ocfl.css"></head>\n' +
    '<body>\n' +
    '<div id="header">\n' +
    '<div id="title">OCFL Repository: ' + repo + '</div>\n' + 
    '<div id="nav">' + nav_links(repo, numFound, start, page) + '</div>\n' +
    '</div>' + 
    '<div id="body">\n';

  links.forEach((l) => {
    var url = '/' + repo + '/' + l['uri_id'] + '/'; 
    html += '<div class="item"><a href="' + url + '">' + l['name'][0] + '</a></div>\n'
  });

  html += '</div>\n' +
  '<div id="footer"><a href="https://github.com/UTS-eResearch/ocfl-nginx">ocfl-nginx bridge v1.0.3</a></div>\n' +
  '</body>\n</html>\n';

  return html;

}


function nav_links(repo, numFound, start, page) {
  var html = '';
  var url = '/' + repo + '/'
  var last = start + page - 1;
  var next = undefined;
  if( last > numFound - 1 ) {
    last = numFound - 1;
  } else {
    next = start + page;
  }
  if( start > 0 ) {
    var prev = start - page;
    if( prev < 0 ) {
      prev = 0;
    }
    if( prev > 0 ) {
      html += '<a href="' + url + '?start=' + String(prev) + '">&lt;--</a> ';
    } else {
      html += '<a href="' + url + '">&lt;--</a> '; 
    }
  }
  html += String(start + 1) + '-' + String(last + 1) + ' of ' + String(numFound);
  if( next ) {
    html += ' <a href="' + url + '?start=' + String(next) + '">--&gt;</a>'
  }
  return html;
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
  var ifile = object;
  if( ifile.slice(-1) !== '/' ) {
    ifile += '/';
  }
  ifile += 'inventory.json';
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






