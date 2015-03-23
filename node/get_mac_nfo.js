var http = require("http");
var id = process.argv[2];

var options = {
  host: 'www.macvendorlookup.com',
  port: 80,
  path: '/api/v2/'+id,
  method: 'POST'
};

var req = http.request(options, function(res) {
  // console.log('STATUS: ' + res.statusCode);
  // console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    // console.log(chunk);
    process.stdout.write(chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
// req.write('data\n');
// req.write('data\n');
req.end();