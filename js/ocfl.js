// ocfl utilities

var fs = require('fs');


var PAGE_SIZE = 20;

// parse the URI and either serve the index or an ocfl_object

function ocfl(req) {

  var ocfl_solr = req.variables.ocfl_solr;

  var parts = req.uri.split('/');
  var repo = parts[1];
  var oidv = parts[2];
  var content = parts.slice(3).join('/');

  if( !repo ) {
    req.error("Couldn't find match for " + req.uri);
    req.internalRedirect(req.variables.ocfl_err_not_found);
    return;
  }

  if( oidv ) {
    ocfl_object(req, repo, oidv, content)
  } else {
    var argvs = parse_args(req.variables.args || "", [ 'start', 'format', 'fields' ]);
    req.error("argvs: " +  JSON.stringify(argvs));
    var start = argvs['start'] || '0';
    var format = argvs['format'] || 'html';
    var fields = [ 'id', 'name', 'path', 'uri_id' ];
    if( format === 'json' && argvs['fields'] ) {
      fields = argvs['fields'].split(',');
    }
    var query = solr_query({ start: start, q: "*:*", fl: fields });

    req.subrequest(ocfl_solr + '/select', { args: query }, ( res ) => {
      var solrJson = JSON.parse(res.responseBody);
      if( format === 'json' ) {
        send_json(req, solrJson);
      } else {
        send_html(req, render_index(repo, solrJson));
      }
    });
  }
}


function solr_query(options) {
  var query = "fq=" + encodeURIComponent("record_type_s:Dataset") + '&' +
    "q=" + encodeURIComponent(options['q']) + '&' +
    "fl=" + encodeURIComponent(options['fl'].join(','));
  if( options['start'] ) {
    query += "&start=" + options['start'];
  }
  return query;
}




// this is nasty

function parse_args(args, vars) {
  var values = {};
  vars.forEach((v) => {
    var start_re = new RegExp(v + '=([^&]+)');
    var match = args.match(start_re);
    if( match ) {
      values[v] = match[1];
    }
  });
  return values;
}


// parse a versioned url_id, look it up in solr to find the path
// and then return the versioned ocfl content

function ocfl_object(req, repo, oidv, content) {

  var pattern = new RegExp('^([^\\.]+)(\\.v\\d+)?$');
  var match = oidv.match(pattern);
  if( !match ) {
    req.error("Couldn't match oid " + oidv);
    req.internalRedirect(req.variables.ocfl_err_not_found);
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

  
  var query = solr_query({ q: "uri_id:" + oid, fl: [ 'path' ] });
  req.error("Subrequest " + query)
  req.subrequest(ocfl_solr + '/select', { args: query }, ( res ) => {
    var solrJson = JSON.parse(res.responseBody);
    req.error("Got back " + solrJson);
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
        req.internalRedirect(req.variables.ocfl_err_not_found);
      }
    } else {
      // if the oid is well-formed but not in the index, assume
      // that it's on its way and redirect to a 'come back later'
      // page
      req.error("OID " + oid + " not found in index");
      req.internalRedirect(req.variables.ocfl_err_pending);
    }
  
  });
}




// pass this the repostory and the JSON from solr


function render_index(repo, solrJson) {

  var docs = solrJson['response']['docs'];
  var start = solrJson['response']['start'];
  var numFound = solrJson['response']['numFound'];

  var html = '<html><head><link rel="stylesheet" type="text/css" href="/assets/ocfl.css"></head>\n' +
    '<body>\n' +
    '<div id="header">\n' +
    '<div id="title">OCFL Repository: ' + repo + '</div>\n' + 
    '<div id="nav">' + nav_links(repo, numFound, start) + '</div>\n' +
    '</div>' + 
    '<div id="body">\n';

  docs.forEach((d) => {
    var url = '/' + repo + '/' + d['uri_id'] + '/'; 
    html += '<div class="item"><a href="' + url + '">' + d['name'][0] + '</a></div>\n'
  });

  html += '</div>\n' +
  '<div id="footer"><a href="https://github.com/UTS-eResearch/ocfl-nginx">ocfl-nginx bridge v1.0.3</a></div>\n' +
  '</body>\n</html>\n';

  return html;

}


function nav_links(repo, numFound, start) {
  var html = '';
  var url = '/' + repo + '/'
  var last = start + PAGE_SIZE - 1;
  var next = undefined;
  if( last > numFound - 1 ) {
    last = numFound - 1;
  } else {
    next = start + PAGE_SIZE;
  }
  if( start > 0 ) {
    var prev = start - PAGE_SIZE;
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



function send_json(req, json) {
  req.status = 200;
  var jsonS = JSON.stringify(json);
  req.headersOut['Content-Type'] = "application/json; charset=utf-8";
  req.headersOut['Content-Length'] = jsonS.length;
  req.sendHeader();
  req.send(jsonS);
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






