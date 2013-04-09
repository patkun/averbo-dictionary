var url = require('url');
var pg = require('pg');
var conString = ":AVERBO";

exports.go = function(req, res) {
    var url_parts = url.parse(req.url, true);
    var q = url_parts.query.sq;
    q = q.replace(/\s+/g," ").replace(/[^\w ]+/g,"").replace(/(\S+)/g,"$1:*").replace(/ (?!$)/g, " | ").replace(/[ |]+$/,"");
    console.log(q);
    var client = new pg.Client(conString);
    var r = "";
    client.connect()
    var query = client.query("SELECT lemma,extra,en FROM averbodict WHERE index @@ to_tsquery('" + q +"') LIMIT 42");
    var lucky = false;
    res.setHeader("Content-Type", "text/plain");
    query.on('row', function(row) {
	console.log(row);
	if (row.length != 0) {
	    lucky = true;
	    r += "<dt><span id=\"lemma\">" + row.lemma + "</span> <span id=\"extra\">" + row.extra + "</span></dt><dd>" + row.en + "</dd>";
	}
    });
    query.on('end', function() { 
	client.end();
	console.log(r);
	if (lucky == false) { r = "<dt><span id=\"lemma\">:-(</span></dt>";}
	r = "<dl>" + r + "</dl>";
	r = r.replace(/"/g,"%%%");
	res.end('_testcb(\'{"results":"' + r + '"}\')');
    });


};
